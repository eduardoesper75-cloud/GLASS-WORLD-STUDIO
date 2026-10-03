/**
 * GWS · B15 — Banco de pruebas del thread pool de libuv.
 *
 * Por que existe: desde el fix B12, `/auth/login` esta limitado a 5/min por
 * IP, asi que ya no se puede generar saturacion de bcrypt desde HTTP — el
 * throttler corta antes. Este script aisla la variable en un proceso: dispara
 * N verificaciones bcrypt y, en paralelo, mide la latencia de trabajo async
 * que representa "el resto de la aplicacion" (que es lo que se degradaba).
 *
 * Uso:
 *   node tests/simulation/b15-threadpool-bench.js [concurrencia]
 * El valor de UV_THREADPOOL_SIZE se toma del entorno, igual que en produccion.
 */
const bcrypt = require('bcrypt');
const { monitorEventLoopDelay } = require('perf_hooks');

const CONCURRENCY = Number(process.argv[2] || 24);
const ROUNDS = 12; // igual que BCRYPT_ROUNDS en auth.service.ts

// Mismo hash para no pagar el costo de hash() en cada verify.
const HASH = bcrypt.hashSync('SeedSeller2026!', ROUNDS);

const lag = monitorEventLoopDelay({ resolution: 10 });
lag.enable();

/** Trabajo "del resto de la app": una espera de E/S corta, como un SELECT. */
function trabajoAsync() {
  return new Promise((resolve) => setImmediate(resolve));
}

async function main() {
  const samples = [];
  let totalMs = 0;

  const inicio = Date.now();

  // N verificaciones bcrypt concurrentes (el caso que satura el pool).
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      const t0 = process.hrtime.bigint();
      await bcrypt.compare('incorrecta', HASH);
      const ms = Number(process.hrtime.bigint() - t0) / 1e6;
      totalMs += ms;
      samples.push(ms);
    }),
  );

  // Mientras corría eso, se mide la latencia del trabajo concurrente.
  // Se muestrea durante la ventana de saturación.
  const muestreo = setInterval(() => {
    const t0 = process.hrtime.bigint();
    trabajoAsync().then(() => {
      const ms = Number(process.hrtime.bigint() - t0) / 1e6;
      samples.push(ms);
    });
  }, 5);

  await new Promise((r) => setTimeout(r, 50));
  clearInterval(muestreo);
  lag.disable();

  const wall = Date.now() - inicio;
  const bcryptSamples = samples.slice(0, CONCURRENCY).sort((a, b) => a - b);
  const pct = (arr, p) =>
    arr.length ? arr[Math.min(arr.length - 1, Math.floor((p / 100) * arr.length))] : 0;

  console.log(JSON.stringify({
    UV_THREADPOOL_SIZE: process.env.UV_THREADPOOL_SIZE ?? '(default 4)',
    concurrency: CONCURRENCY,
    bcryptRounds: ROUNDS,
    wallClockMs: wall,
    bcryptP50: +pct(bcryptSamples, 50).toFixed(1),
    bcryptP95: +pct(bcryptSamples, 95).toFixed(1),
    bcryptMax: +Math.max(...bcryptSamples, 0).toFixed(1),
    eventLoopLagP99Ms: +(lag.percentile(99) / 1e6).toFixed(2),
    eventLoopLagMaxMs: +(lag.max / 1e6).toFixed(2),
  }, null, 2));
}

main();