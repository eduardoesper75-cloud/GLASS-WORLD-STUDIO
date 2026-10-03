/**
 * B15 — Comparacion bcrypt(12) vs argon2id (params OWASP) bajo concurrencia.
 *
 * Pregunta: el pool de libuv de 8 threads (arreglo B15) reduce el tiempo de
 * bcrypt, pero argon2id es mucho mas rapido. La pregunta real es si argon2id
 * deja de competir por el threadpool compartido o solo se reduce el problema.
 *
 * Metodo (corrige el error de muestreo de b15-threadpool-bench.js):
 *   - monitorEventLoopDelay y el muestreador de trabajo async se arman ANTES de
 *     lanzar el lote, no despues. Asi se mide realmente durante el hash.
 *   - Cada operacion se lanza con Promise.all, sin esperarlas en serie.
 *   - UV_THREADPOOL_SIZE se lee desde el entorno del proceso hijo.
 *
 * Uso:  node tests/simulation/b15-algoritmo-bench.js <concurrencia> <algoritmo>
 * Ej.:  node tests/simulation/b15-algoritmo-bench.js 24 argon2id
 */

'use strict';

const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { monitorEventLoopDelay } = require('perf_hooks');

const CONCURRENCY = Number(process.argv[2] || 24);
const ALGORITHM = String(process.argv[3] || 'argon2id');

// Params Argon2id recomendados por OWASP Password Storage Cheat Sheet:
// m=19456 KiB (19 MiB), t=2, p=1.
const ARGON2 = {
  memory: 19456,
  passes: 2,
  parallelism: 1,
  tagLength: 32,
};

const PASSWORD = 'clave-de-prueba-b15';

function hashBcrypt() {
  return bcrypt.hash(PASSWORD, 12);
}

function hashArgon2id() {
  return new Promise((resolve, reject) => {
    crypto.argon2(
      'argon2id',
      {
        message: Buffer.from(PASSWORD),
        nonce: crypto.randomBytes(16),
        parallelism: ARGON2.parallelism,
        tagLength: ARGON2.tagLength,
        memory: ARGON2.memory,
        passes: ARGON2.passes,
      },
      (err, derived) => (err ? reject(err) : resolve(derived)),
    );
  });
}

async function main() {
  const medir = ALGORITHM === 'bcrypt' ? hashBcrypt : hashArgon2id;

  const histograma = monitorEventLoopDelay({ resolution: 10 });
  histograma.enable();

  // Muestreador de trabajo async realmente concurrente con el lote de hashes.
  const muestrasAsync = [];
  const muestreo = setInterval(() => {
    const inicio = process.hrtime.bigint();
    setImmediate(() => {
      muestrasAsync.push(Number(process.hrtime.bigint() - inicio) / 1e6);
    });
  }, 5);

  const duraciones = [];
  const t0 = process.hrtime.bigint();
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      const inicio = process.hrtime.bigint();
      await medir();
      duraciones.push(Number(process.hrtime.bigint() - inicio) / 1e6);
    }),
  );
  const wallClockMs = Number(process.hrtime.bigint() - t0) / 1e6;

  clearInterval(muestreo);
  histograma.disable();

  const p = (arr, q) => {
    const s = [...arr].sort((a, b) => a - b);
    return s[Math.min(s.length - 1, Math.floor(s.length * q))];
  };

  console.log(
    JSON.stringify({
      algoritmo: ALGORITHM,
      uvThreadpoolSize: process.env.UV_THREADPOOL_SIZE || '(default libuv 4)',
      concurrencia: CONCURRENCY,
      wallClockMs: Number(wallClockMs.toFixed(1)),
      hashP50Ms: Number(p(duraciones, 0.5).toFixed(1)),
      hashP95Ms: Number(p(duraciones, 0.95).toFixed(1)),
      eventLoopLagP99Ms: Number((histograma.percentile(99) / 1e6).toFixed(2)),
      eventLoopLagMaxMs: Number((histograma.max / 1e6).toFixed(2)),
      asyncTickP95Ms: muestrasAsync.length
        ? Number(p(muestrasAsync, 0.95).toFixed(2))
        : null,
      asyncTickMaxMs: muestrasAsync.length
        ? Number(Math.max(...muestrasAsync).toFixed(2))
        : null,
    }),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});