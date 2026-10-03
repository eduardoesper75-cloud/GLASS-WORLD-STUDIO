/**
 * GWS - Configuracion del thread pool de libuv (B15)
 * --------------------------------------------------
 * `UV_THREADPOOL_SIZE` DEBE estar seteada antes de que Node cargue el primer
 * addon nativo que use el thread pool. Por eso esto es un modulo aparte
 * importado como PRIMERO en `main.ts`, y no una linea dentro de `bootstrap()`:
 * los imports de TypeScript se hoistean, asi que cualquier codigo en
 * `bootstrap()` corre despues de que `AppModule` (y con el bcrypt) ya se
 * cargo.
 *
 * -- El problema (B15) --------------------------------------------------
 * `bcrypt` es un addon nativo y es CPU-bound puro: cada `bcrypt.compare` de
 * 12 rondas ocupa un thread del pool durante ~236 ms sin ceder. El pool por
 * defecto de libuv es 4. Cuando 4+ bcrypt lo saturan, los cores quedan
 * quemando CPU y el event loop - que corre en un solo hilo logico de la
 * misma CPU - recibe menos timeslices. De ahi el `eventLoopLag` medido y los
 * picos de hasta 15,6 s que se veian en endpoints de LECTURA.
 *
 * Ojo con la formulacion: el I/O de sockets TCP de Postgres lo atiende el
 * event loop, NO el thread pool de libuv. El pool cubre fs, DNS, zlib,
 * crypto y addons nativos. La contencion es de CPU y de event loop.
 *
 * -- Por que 8, y no 16 -------------------------------------------------
 * Medido en esta maquina (8 cores logicos, Node v24.19.0), bcrypt(12),
 * concurrencia 32, 3 repeticiones:
 *
 *   pool   wall clock   bcrypt p50   event-loop lag p99
 *     4      1890 ms      1134 ms        20-22 ms   <- default libuv
 *     8      1055 ms       722 ms        22-23 ms   <- elegido
 *    12      1080 ms       725 ms        24-31 ms   <- sin ganancia
 *    16      1070 ms       763-881 ms    27-94 ms   <- descartado
 *
 * De 4 a 8 el tiempo total se reduce a la mitad. De 8 a 16 NO mejora
 * (1055 vs 1070 ms) y el event loop se vuelve erratico, con picos de hasta
 * 94 ms. El beneficio esta agotado en 8; seguir subiendo solo agrega
 * contencion de contexto.
 *
 * Esto corrige la hipotesis original de B15, que proponia 16 apoyandose en
 * que "los threads hacen I/O y esperan". Para bcrypt eso es falso: es CPU
 * puro, asi que mas threads significa mas competencia por CPU, no mas
 * paralelismo barato. Ver docs/ops/investigacion-b15-picos.md 3.5.
 *
 * -- Sobre-escritura ----------------------------------------------------
 * `UV_THREADPOOL_SIZE` gana si viene del entorno: quien despliega puede
 * ajustarlo sin recompilar (util en Railway, donde los cores cambian segun
 * el plan). El 8 de arriba es el default y acota a 16.
 *
 * -- Alternativa de fondo ------------------------------------------------
 * Este ajuste amortigua el problema; no lo elimina. La solucion de fondo es
 * migrar a argon2id: medido 3,7x mas rapido que bcrypt(12) y con 0% de
 * degradacion bajo saturacion del pool, porque no compite por el. Evaluado,
 * NO implementado - requiere aprobacion. Ver docs/ops/investigacion-b15-picos.md 4.
 */

/** Threads por defecto del thread pool de libuv. */
const DEFAULT_UV_THREADPOOL_SIZE = 8;

/** Maximo aceptado. Por encima de 16 el beneficio deja de compensarse. */
const MAX_UV_THREADPOOL_SIZE = 16;

function resolver(): number {
  const crudo = process.env.UV_THREADPOOL_SIZE;

  if (crudo === undefined || crudo === '') return DEFAULT_UV_THREADPOOL_SIZE;

  const n = Number(crudo);
  if (!Number.isFinite(n) || n <= 0) {
    console.warn(
      `[B15] UV_THREADPOOL_SIZE="${crudo}" no es un entero positivo; ` +
        `usando ${DEFAULT_UV_THREADPOOL_SIZE}.`,
    );
    return DEFAULT_UV_THREADPOOL_SIZE;
  }

  const entero = Math.floor(n);
  if (entero > MAX_UV_THREADPOOL_SIZE) {
    console.warn(
      `[B15] UV_THREADPOOL_SIZE=${entero} supera el maximo recomendado ` +
        `(${MAX_UV_THREADPOOL_SIZE}); acotando.`,
    );
    return MAX_UV_THREADPOOL_SIZE;
  }
  return entero;
}

const resuelto = resolver();

// eslint-disable-next-line no-console
console.log(`[B15] UV_THREADPOOL_SIZE=${resuelto}`);
process.env.UV_THREADPOOL_SIZE = String(resuelto);

export const UV_THREADPOOL_SIZE = resuelto;