/**
 * B15 — Prueba de contencion entre bcrypt y argon2id.
 *
 * Responde la pregunta central: argon2id sigue compitiendo por el threadpool
 * de libuv que bloquea bcrypt (y fs, dns, crypto), o tiene su propia ruta?
 *
 * Metodo: se lanza una avalancha de bcrypt que satura el pool y, en medio de
 * ella, se miden latencias de argon2id en aislamiento. Si argon2id comparte el
 * pool, su latencia se multiplica. Si tiene ruta propia, no se mueve.
 *
 * Uso: node tests/simulation/b15-contencion-bench.js <concurrenciaBcrypt>
 */

'use strict';

const crypto = require('crypto');
const bcrypt = require('bcrypt');

const CONCURRENCY = Number(process.argv[2] || 32);

const PASSWORD = 'clave-de-prueba-b15';

function hashArgon2id() {
  return new Promise((resolve, reject) => {
    crypto.argon2(
      'argon2id',
      {
        message: Buffer.from(PASSWORD),
        nonce: crypto.randomBytes(16),
        parallelism: 1,
        tagLength: 32,
        memory: 19456,
        passes: 2,
      },
      (err, derived) => (err ? reject(err) : resolve(derived)),
    );
  });
}

async function medirArgon2id(muestras) {
  const duraciones = [];
  for (let i = 0; i < muestras; i += 1) {
    const inicio = process.hrtime.bigint();
    await hashArgon2id();
    duraciones.push(Number(process.hrtime.bigint() - inicio) / 1e6);
  }
  return duraciones;
}

function p50(arr) {
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

async function main() {
  // 1) Referencia: argon2id con el pool libre.
  const referencia = await medirArgon2id(12);

  // 2) Con la avalancha de bcrypt en curso.
  const saturacion = Array.from({ length: CONCURRENCY }, () =>
    bcrypt.hash(PASSWORD, 12).catch(() => null),
  );
  // Pequeño retraso para que bcrypt ocupe los threads antes de medir.
  await new Promise((r) => setTimeout(r, 60));
  const bajoCarga = await medirArgon2id(12);
  await Promise.all(saturacion);

  console.log(
    JSON.stringify({
      poolSize: process.env.UV_THREADPOOL_SIZE || '(libuv 4)',
      concurrenciaBcrypt: CONCURRENCY,
      argon2idP50Libre: Number(p50(referencia).toFixed(1)),
      argon2idP50ConBcrypt: Number(p50(bajoCarga).toFixed(1)),
      degradacion: `${(p50(bajoCarga) / p50(referencia)).toFixed(1)}x`,
    }),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});