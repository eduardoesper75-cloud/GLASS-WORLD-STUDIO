/**
 * B12 — Configuración del rate limiting global (2026-10-02)
 * -------------------------------------------------------
 * Este archivo existe por una razón concreta: antes de sacarlo, el `ttl` global
 * vivía literal dentro de `app.module.ts`, donde ningún test podía alcanzarlo.
 * Un `ThrottlerModule.forRoot()` en un spec tiene que reescribir los valores a
 * mano, así que el test "pasaba" mientras la app real corría con `ttl: 60` — es
 * decir, el test daba luz verde a exactamente el bug que había que cazar.
 *
 * Extraer la config a un módulo propio hace que el spec importe LA MISMA
 * función que usa la app en runtime. Si el bug vuelve, el test lo ve.
 *
 * --- El bug ---------------------------------------------------------
 * `@nestjs/throttler` v6 interpreta `ttl` en **milisegundos**. El código
 * pasaba `THROTTLE_TTL_SECONDS ?? 60` creyendo que eran segundos, dejando una
 * ventana de 60 ms. Con `limit: 100` eso permite ~100 req cada 60 ms, o sea
 * ~1.667 req/s (100.000/min), contra los 100/min que el comentario decía
 * proteger. Medido en local contra el global: 2.927 req/s (175.000/min).
 *
 * Los decoradores `@Throttle()` de los controllers tenian el mismo error
 * (`ttl: 60` en login/register/elevate/totp), asi que `/auth/login` aceptaba
 * ~83 intentos de contrasena por segundo en lugar de 5 por minuto.
 *
 * --- La regla -------------------------------------------------------
 * `ttl` siempre en milisegundos. Si escribis un literal, escribi `60_000`.
 * Si viene de una env var expresada en segundos, converti explicitamente
 * (`* 1000`) y nombrala en SEGUNDOS, que es lo que hace `throttleOptions()`.
 */

/**
 * Subconjunto del entorno que lee esta funcion.
 *
 * Se declara propio en vez de usar `NodeJS.ProcessEnv` porque el monorepo
 * incluye `apps/web` (Next.js), cuyos tipos globales redeclaran `ProcessEnv`
 * con `NODE_ENV` obligatorio. Tipar contra `NodeJS.ProcessEnv` obligaba a los
 * tests a castear `as unknown as`, que esconde errores en vez de atraparlos.
 */
export type ThrottleEnv = Record<string, string | undefined>;

/** Configuracion en milisegundos, ya normalizada. */
export interface ThrottleConfig {
  /** Duracion de la ventana, en ms. */
  ttl: number;
  /** Requests permitidos por ventana y por IP. */
  limit: number;
}

/**
 * Construye la config del throttler global a partir del entorno.
 *
 * Las env vars se expresan en SEGUNDOS porque eso es lo que un operador
 * espera; la conversion a ms ocurre aca, en un solo lugar, que es lo que
 * evita que el error vuelva a colarse.
 */
export function throttleOptions(env: ThrottleEnv = process.env): ThrottleConfig {
  const segundos = Number(env.THROTTLE_TTL_SECONDS ?? 60);
  const limite = Number(env.THROTTLE_LIMIT_PER_MINUTE ?? 100);

  // Un NaZ aca dejaria el throttler sin ventana efectiva (ttl falsy -> el
  // guard no limita nada). Es una falla silenciosa y por eso se falla ruidoso.
  if (!Number.isFinite(segundos) || segundos <= 0) {
    throw new Error(
      `THROTTLE_TTL_SECONDS invalido: "${env.THROTTLE_TTL_SECONDS}". ` +
        'Debe ser un numero positivo de segundos (se convierte a ms internamente).',
    );
  }
  if (!Number.isFinite(limite) || limite <= 0) {
    throw new Error(
      `THROTTLE_LIMIT_PER_MINUTE invalido: "${env.THROTTLE_LIMIT_PER_MINUTE}". ` +
        'Debe ser un entero positivo.',
    );
  }

  return { ttl: Math.round(segundos * 1000), limit: Math.round(limite) };
}