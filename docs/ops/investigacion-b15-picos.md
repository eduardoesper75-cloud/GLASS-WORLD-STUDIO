# B15 · Investigación de los picos de latencia (15,6 s en lecturas)

**Fecha:** 2026-10-03 (ampliado el 2026-10-03 tras la remediación)
**Estado:** causa raíz **probada**. Remediación A **aplicada**; B **evaluada, no implementada**.
**Alcance:** este documento **sí modificó código de producción**: `src/config/threadpool.ts`
(nuevo) y `src/main.ts`. No se tocó `bcrypt` ni ningún flujo de autenticación.

---

## 1. Resumen ejecutivo

Los picos de hasta **15,6 s** en endpoints de lectura no provenían de la base de
datos. Provenían de **bcrypt ocupando el thread pool de libuv**, que es
compartido con fs, DNS y crypto, y cuya saturación **roba CPU y ciclos del event
loop** de un solo hilo.

En términos de la taxonomía de *The Art of Computer Systems* (§6.1):
**"adversity, not condition"** — no es un defecto de una función lenta, es una
interacción adversa entre un trabajo CPU-bound y un event loop de un solo hilo
lógico.

Resultado de la remediación, medido con 3 repeticiones y 32 hashes concurrentes:

| `UV_THREADPOOL_SIZE` | wall clock | bcrypt p50 | event-loop lag p99 |
|---|---|---|---|
| 4 (default libuv) | 1.890 ms | 1.134 ms | 20-22 ms |
| **8 (aplicado)** | **1.055 ms** | **722 ms** | **22-23 ms** |
| 16 (evaluado, descartado) | 1.070 ms | 763-881 ms | 27-94 ms |

El tiempo total **se reduce a la mitad** subiendo de 4 a 8. Subir de 8 a 16 **no
aporta ninguna ganancia** y vuelve el event loop errático (picos de hasta 94 ms).

**Y la hallazgo que domina todo lo demás:** `argon2id` con los parámetros de OWASP
es **3,7x más rápido** que bcrypt(12) *y* **no compite por el thread pool** — se
midió **0% de degradación** con 32 bcrypt en vuelo. Ver §4.

---

## 2. El mecanismo

`bcrypt` v5.1.1 es un **addon nativo** (`node_modules/bcrypt/lib/binding/napi-v3/
bcrypt_lib.node`, verificado presente). Los addons nativos de Node se ejecutan en
el **thread pool de libuv**, cuyo tamaño por defecto es **4**
(`UV_THREADPOOL_SIZE` vacío = 4, confirmado).

Los login de `auth.service.ts` usan `BCRYPT_ROUNDS = 12`
(`src/auth/auth.service.ts:30`), con **5 llamadas** a `bcrypt.compare`
(:91, :120, :166, :213, :248).

Medición de costo unitario: **un login aislado = 236 ms** (k6 y PowerShell
coinciden: 236/235/236 ms).

La cadena causal:

1. Un `bcrypt.compare` de 12 rondas ocupa **un** thread del pool durante ~236 ms.
2. Con 4 threads, solo **4 verificaciones** de contraseña pueden estar en vuelo
   a la vez.
3. bcrypt es **CPU-bound puro**: no es I/O, no espera, no cede. Los 4 threads
   quedan quemando CPU al 100% durante cientos de milisegundos.
4. El event loop de Node corre en **un solo hilo lógico** de la misma CPU. Con
   los 4 cores ocupados por bcrypt, el loop recibe menos timeslices: de ahí
   el `eventLoopLag` medido de 20-94 ms.
5. Una petición de lectura de marketplace no tarda: **tarda en arrancar**.

> **Corrección de la versión 1 de este documento.** Aquí se afirmaba que "el pool
> también lo usan las operaciones de red (conexiones a Postgres)" y que "las
> conexiones de BD esperan turno". **Eso es incorrecto.** El I/O de sockets TCP
> de Postgres lo atiende el event loop vía epoll/IOCP, **no** el thread pool de
> libuv. El pool cubre fs, DNS, zlib, crypto y addons nativos como bcrypt. La
> contención real es de **CPU y de event loop**, no de "turnos de conexión".

Por eso los picos afectaban a **lecturas** (`/marketplace/products`, ~2 ms
normales) y no solo al login: el daño se propaga por el event loop compartido.

---

## 3. Experimentos y resultados

Máquina: **8 procesadores lógicos**. Backend: Node v24.19.0, NestJS.

### 3.1 Baseline sin carga

| Métrica | Valor |
|---|---|
| `/health` en reposo (vía PowerShell) | ~41 ms |
| `/health` vía k6 | p50 3,91 ms · p95 9,20 ms |

El baseline de PowerShell (41 ms) es **overhead del cliente**, no del servidor.
Por eso en los experimentos se lee el **delta contra ese baseline**, no el valor
absoluto. Es por eso que la sonda final se escribió en k6.

### 3.2 Experimento A — 40 logins concurrentes, thread pool por defecto (4)

| Muestra | Latencia `/health` |
|---|---|
| 1 | 141,5 ms |
| 2-10 | 92, 88, 86, 88, 94, 98, 85, 86, 86 ms |

**Delta contra baseline: ~+47 ms.** Un endpoint que hace `SELECT 1` pasó de
41 ms a ~88 ms.

### 3.3 Experimento B — 40 logins concurrentes, `UV_THREADPOOL_SIZE=16`

| Muestra | Latencia `/health` |
|---|---|
| 1 | 97,0 ms |
| 2-5 | 53,0 · 54,0 · 52,9 · 51,9 ms |
| 6 | 99,5 ms |
| 7 | 52,2 ms |

**Delta contra baseline: ~+11 ms.** Una **reducción del delta de ~77%** bajo la
misma carga de autenticación, sin tocar el código de la aplicación.

### 3.4 Experimento C — sonda en k6, `UV_THREADPOOL_SIZE=16`

```
b15_health_ms ... avg=4,6ms  med=3,91ms  p95=9,20ms  p99=11,28ms  max=150,9ms
b15_login_ms .. avg=5,84ms med=5,65ms  p95=10,99ms p99=12,67ms max=272,94ms
iterations .... 209.522 (2.993/s)
```

**Hallazgo colateral importante:** los logins muestran p95 de 10,99 ms — nada
como los ~2.400 ms de corridas anteriores. No es una mejora: tras el fix B12,
`/auth/login` está limitado a 5/min por IP, así que **casi todo lo que el
escenario "carga" ahora es 429 y nunca ejecuta bcrypt**. La sonda ya **no puede
reproducir B15** por diseño.

Esto es una mejora de seguridad con un costo de diagnóstico: el escenario B de
FASE 11 pasó de "medir capacidad de autenticación" a "medir cuánto frena el
throttle".

### 3.5 Remediación A — dimensionar el thread pool (MEDIDO, NO SUPUESTO)

Los experimentos 3.2-3.4 probaron que agrandar el pool **ayuda**, pero no
midieron **hasta dónde**. La hipótesis original ("16 es mejor") era una intuición
sin medir. Se midió con `tests/simulation/b15-threadpool-bench.js`, bcrypt(12),
concurrencia 32, 3 repeticiones:

| pool | wall clock | bcrypt p50 | event-loop lag p99 | veredicto |
|---|---|---|---|---|
| 4 | 1.890 ms | 1.134 ms | 20-22 ms | default |
| 8 | 1.055 ms | 722 ms | 22-23 ms | **aplicado** |
| 12 | 1.080 ms | 725 ms | 24-31 ms | sin ganho |
| 16 | 1.070 ms | 763-881 ms | 27-94 ms | **descartado** |

**Conclusión:** el beneficio se agota en 8. De 8 a 16 el wall clock no mejora
(1055 vs 1070 ms) pero el event loop se vuelve inestable. Con 8 cores lógicos,
16 threads solo agregan contención de contexto.

> **Nota metodológica.** `b15-threadpool-bench.js` fue corregido tras una primera
> corrida: el intervalo que muestrea trabajo async se creaba **después** de
> `await Promise.all(...)`, así que ese muestreo nunca ocurría. La corrección
> está en `b15-algoritmo-bench.js`, que arma los medidores antes del lote y
> además mide `setImmediate` como señal independiente del event loop.

### 3.6 Qué se midió en `/health` con el fix aplicado

Con `UV_THREADPOOL_SIZE=8` y el backend en `:3001`:

- `/health` responde **200**.
- `npm test`: **6 suites / 38 tests en verde**.
- El Clamping del override funciona: `UV_THREADPOOL_SIZE=32` → log
  `[B15] UV_THREADPOOL_SIZE=32 supera el máximo recomendado (16); acotando.`
  y queda en 16.

No se volvió a medir la latencia HTTP de `/health` bajo carga de login porque
**B12 impide generarla** (§3.4). La evidencia del pool=8 es la medición directa
de hashes más la verificación funcional, no una cifra HTTP.

---

## 4. Evaluación B — migración de bcrypt a argon2id (PLAN, NO IMPLEMENTADO)

> **Nada de esta sección se implementó.** `BCRYPT_ROUNDS = 12` sigue intacto y
> no se instaló ningún paquete. Esto es un plan que requiere aprobación de Jorge.

### 4.1 Qué recomienda la fuente

**OWASP Password Storage Cheat Sheet** (fuente primaria, texto literal):

- Recomendación principal: *"Use Argon2id with a minimum configuration of
  **19 MiB of memory, an iteration count of 2, and 1 degree of parallelism**"*.
- Sobre bcrypt, sin ambigüedad: *"bcrypt **should only** be used for password
  storage in **legacy systems** where Argon2 and scrypt are not available"*.
- Work factor de bcrypt: *"as large as verification server performance will
  allow, with a minimum of 10"*.

GWS usa bcrypt(12) sobre Node. **No es legacy**: es una elección vigente, pero
justamente el caso que OWASP dice reemplazar. El work factor 12 ya cumple el
mínimo de 10, así que **bajarlo a 10 (opción C) no lo dejaría más alineado con
OWASP** — solo más rápido y más débil. Es el peor movimiento de los tres.

**Hoffman, *Web Application Security: Exploitation and Countermeasures for
Modern Web Applications*** (Andrew Hoffman, O'Reilly, 2019; 2ª ed. 2024) tiene la
sección **"Hashing Credentials" (p. 197)**, y su postura es la misma: recomienda
algoritmos de hash **lentos** como bcrypt. **⚠️ SIN RESPALDO BIBLIOGRÁFICO PARA
ARGON2ID**: la 1ª edición (2019) es anterior a la estandarización de argon2id y
no lo trata. No se debe citar a Hoffman como apoyo de una migración a argon2id.
**El respaldo es OWASP**, no Hoffman.

### 4.2 La premisa "argon2 no bloquea el event loop" — matizada

La premisa es **parcialmente cierta y dangerousamente incompleta**. Medido en
esta máquina (Node v24.19.0, 8 cores):

`crypto.argon2(algorithm, parameters, callback)` es async, pero por dentro usa
`kCryptoJobAsync`. La pregunta empírica es si **comparte el thread pool de
libuv** con bcrypt. Se respondió midiendo:

**Prueba de contención** (`b15-contencion-bench.js`) — 32 bcrypt concurrentes,
midiendo argon2id en medio de la avalancha:

| pool | argon2id p50 con pool libre | argon2id p50 con 32 bcrypt | degradación |
|---|---|---|---|
| 4 | 30,6 ms | 31,1 ms | **1,0x** |
| 8 | 31,3 ms | 31,3 ms | **1,0x** |

**0% de degradación.** argon2id **no** saca threads del pool de libuv. Lo que
sí hace es **concurrencia interna**: con `parallelism: 1` es secuencial dentro
de cada llamada, así que además de rápida es **poco exigente en threads**.

### 4.3 Costo medido: bcrypt(12) vs argon2id(OWASP 19 MiB / t=2 / p=1)

Concurrencia 24, `b15-algoritmo-bench.js`:

| algoritmo | pool | wall clock | hash p50 | event-loop lag p99 |
|---|---|---|---|---|
| bcrypt(12) | 4 | 1.376 ms | 902 ms | 19,2 ms |
| **argon2id** | **4** | **369 ms** | **221 ms** | 23,6 ms |
| bcrypt(12) | 8 | 737 ms | 484 ms | 34,0 ms |
| **argon2id** | **8** | **330 ms** | **213 ms** | 21,5 ms |

argon2id es **~3,7x más rápido** en wall clock y **~4x más barato por hash** que
bcrypt(12) con los mismos parámetros de seguridad que OWASP recomienda para
bcrypt. Y a diferencia de bcrypt, su latencia **casi no depende del pool**
(369 vs 330 ms) porque el trabajo es corto.

### 4.4 Plan de migración propuesto (NO EJECUTADO)

1. **Elegir librería.** Node v24 trae `crypto.argon2` nativo (sin dependencia
   extra) pero es una primitiva cruda: no genera ni codifica sal en formato PHC
   estándar, no hace el `verify` con comparación constante. Para hashing de
   contraseñas, usar `argon2` (napi) o `@node-rs/argon2`, que ya resuelven PHC.
   **Trade-off:** dependencia nativa más (build en Railway) a cambio de manejo
   correcto de sal/PHC.
2. **No tocar los hashes existentes.** Son bcrypt(12) válidos y deben seguir
   verificando. Solo cambiar el hash en el **login exitoso** (rehash transparente).
3. **Detección por formato.** Todo hash de `passwordHash` de GWS empieza con
   `$2a$`/`$2b$`/`$2y$` (bcrypt) o `$argon2id$` (PHC). Elegir verificador por
   prefijo: si empieza con `$argon2id$` → argon2, si no → bcrypt.
4. **Rehash en login.** Si el login fue con bcrypt y sale bien, recalcular con
   argon2id y guardar. El usuario nunca nota nada y los hashes migran solos.
5. **Categoría de esquema.** ¿Hace falta columna nueva? **Depende de si el
   campo actual es `varchar` con largo suficiente** — un hash argon2id es más
   largo que uno bcrypt(12). Si el campo es corto, la validación falla al
   guardar. **Esto es el riesgo operativo principal de la migración.**
6. **Medir antes/después con el mismo banco.** `b15-algoritmo-bench.js` ya sirve
   para comparar; registrar wall clock, hash p50 y event-loop lag.
7. **Rollback.** Cambiar de vuelta el prefijo de verificación a bcrypt-only es
   un revert de una línea: los hashes argon2id-*vuelven* a no verificar, pero los
   bcrypt siguen intactos. **Nunca** al revés (rehashear un bcrypt a argon2id y
   revertir dejaría los hashes argon2id huérfanos). Por eso el paso 4 es
   rehash-en-login y no migración masiva por script.

### 4.5 Veredicto de B

**Migrar a argon2id es la solución de fondo recomendada**, y superior a seguir
parcheando el pool: más rápida, no compite por el pool, memory-hard (resiste
ataques GPU, que es justo lo que bcrypt no hace bien), y alineada con la
recomendación vigente de OWASP. La opción A (pool=8) es un **mitigador
inmediato y de bajo riesgo** que ya está aplicado y no estorba a la migración
posterior — de hecho, con argon2id el pool deja de ser el cuello de botella.

Requiere decisión de Jorge por: (a) dependencia nativa extra, (b) largura de
columna del hash, (c) aceptar que argon2id quede fuera del alcance de Hoffman.

---

## 5. Qué se descartó como causa

| Hipótesis | Veredicto | Cómo se descartó |
|---|---|---|
| Queries lentas de Postgres | **Descartada** | El log del proceso de sonda registró **0 líneas de query** durante la corrida. Ojo: `logging` solo se activa con `NODE_ENV=development` (`src/app.module.ts`), así que la ausencia de queries **no prueba por sí sola** que no hubiera ninguna — prueba que tampoco había una consulta lenta *observable*. La descartamos por el orden de magnitud (15,6 s no sale de un `SELECT` sin índice sobre 2 productos) y por el efecto medido del pool en §3.5. |
| `synchronize: true` bloqueando | **Descartada** | `src/app.module.ts:59` tiene `synchronize: false` explícito. |
| Pool de BD subdimensionado | **Descartado como causa** | No hay `poolSize` configurado → TypeORM usa 10. Suficiente para las 2 consultas de una lectura; no explica 15,6 s. |
| Fuga de memoria / GC | **Descartada** | Working set de 94 MB, estable. Los picos no crecen a lo largo de la corrida, no es un leak. |
| Crecimiento del dataset | **Descartada** | Solo 2 productos en seed. El catálogo completo cabe en memoria. |
| Base de datos compartida con otra app | **No descartada, pero improbable** | La caída de ~77% al agrandar el thread pool apunta a saturación de CPU/threads, no a contención de BD. |

---

## 6. Por qué los picos **desaparecieron** en la corrida final

En la corrida FASE 11 del 2026-10-03 (ver `docs/simulation/analisis-fase-11-final.md`),
sobre 287.541 requests:

| Umbral | Requests |
|---|---|
| > 500 ms | **0** |
| > 1000 ms | **0** |
| > 2000 ms | **0** |

Máxima observada: 426 ms.

**Esto NO significa que B15 esté resuelto.** Significa que está **enmascarado**:
el 65,93% de las peticiones fue cortada por el throttler antes de ejecutar
bcrypt, así que el pool nunca se saturó. En cuanto el tráfico de autenticación
crezca por encima de 5/min por IP —o cuando se despliegue con varios usuarios
detrás de NAT/proxy, donde el límite por IP deja de proteger— los picos
vuelven.

---

## 7. Recomendaciones

Estado real de cada una: **A aplicada**, **B evaluada**, **C descartada**.

### 7.1 APLICADO — pool de libuv dimensionado

1. **`UV_THREADPOOL_SIZE=8`** — aplicado en `src/config/threadpool.ts`, importado
   desde `src/main.ts` antes de `AppModule`. Medido: reduce el wall clock de
   1.890 ms a 1.055 ms bajo 32 bcrypt concurrentes, con event-loop lag estable en
   22-23 ms. Reversible: basta con setear la variable de entorno a otro valor
   (acotada a 16). Detalle de despliegue en §9.

### 7.2 DESCARTADO — bajar `BCRYPT_ROUNDS` de 12 a 10

2. **Bajar a 10 rondas.** **Descartado por evidencia, no descartado por criterio.**
   OWASP dice que bcrypt es aceptable con "work factor as large as performance
   will allow, **minimum 10**". Bajar de 12 a 10 no lo saca del estándar: lo
   acerca al piso, hace menos trabajo, y a cambio **sí** reduce la resistencia offline.
   Es la peor relación esfuerzo/beneficio de las tres opciones y empeora
   precisamente el problema que B15 intenta cerrar. No se hizo. (La única razón
   para considerarlo sería abaratar CPU en una máquina más chica que la actual,
   y eso se resuelve con argon2id.)

### 7.3 RECOMENDADO — migrar a argon2id (pendiente de aprobación)

3. **Migración a argon2id** según el plan de §4.4. Es la solución de fondo:
   elimina la causa en vez de amortiguarla. **Requiere aprobación de Jorge** por
   la dependencia nativa extra y por el ancho de columna del hash.

### 7.4 Sigue siendo útil después de A y B

4. **Cola de autenticación con concurrencia acotada** (semáforo de N). Convierte
   la degradación en espera ordenada en vez de estampida. Barato y ortogonal.

5. **Cache de verificación positiva** para sesiones ya autenticadas, con TTL
   corto. Elimina el hash del camino caliente en tráfico repetido.

6. **Medir el event loop lag en producción** (`perf_hooks.monitorEventLoopDelay`).
   Todo este diagnóstico se hizo por inferencia indirecta porque no había
   instrumentación; exponerlo en `/health` habría hecho la causa obvia en el
   primer gráfico. Es el hallazgo operativo más transferible de B15.

> **Nota:** el punto 5 de la versión anterior ("mover bcrypt a un worker pool
> dedicado") queda **superado** por argon2id: si argon2id no toca el thread pool
> de libuv (medido, §4.2), el aislamiento se logra sin mantener un pool propio.

---

## 8. Nota sobre "adversity, not condition"

Es el marco que mejor describe B15 y merece quedar registrado. Ninguna función
involucrada era lenta por sí misma:

- `bcrypt.compare` tarda ~236 ms **porque está diseñada** para ser lenta.
- `SELECT` sobre marketplace tarda ~2 ms porque el índice funciona.
- El pool de 4 threads es el default **correcto** de libuv.

El defecto es la **interacción**: trabajo CPU-bound de alta latencia conocida
compitiendo por CPU con un event loop sensible a la latencia. Ninguna de las tres
piezas tiene un bug; el sistema completo sí tiene un problema. Corregir una sola
pieza —agrandar el pool, migrar el algoritmo— lo mitiga; solo sacar el trabajo
CPU-bound del event loop lo resuelve.

---

## 9. Despliegue: cómo queda el pool en producción

### 9.1 Qué se implementó

`src/config/threadpool.ts` setea `process.env.UV_THREADPOOL_SIZE` **antes** de
cualquier otra importación, y `src/main.ts` lo importa en la **primera línea**
del archivo, antes de `@nestjs/core` y antes de `AppModule`. Ese orden es
obligatorio: si el módulo se cargara después, libuv ya habría leído el valor
anterior y el ajuste no tendría efecto.

Comportamiento:

| Entrada | Resultado | Log |
|---|---|---|
| sin variable | **8** (default) | `[B15] thread pool de libuv configurado en 8 threads` |
| `UV_THREADPOOL_SIZE=12` | 12 | `[B15] UV_THREADPOOL_SIZE=12` |
| `UV_THREADPOOL_SIZE=32` | acotado a **16** | `[B15] UV_THREADPOOL_SIZE=32 supera el máximo recomendado (16); acotando.` |
| `UV_THREADPOOL_SIZE=abc` / `0` / `-3` | cae al default 8 | warning |

### 9.2 Railway

El backend se despliega como servicio Node (`npm run start` → `node dist/main`).
**No hace falta configurar nada en Railway**: el default de 8 viaja en el
código. Para cambiarlo sin desplegar, agregar la variable de entorno
`UV_THREADPOOL_SIZE` en el panel del servicio (Service → Variables) y redeploy.

Vale la pena dejarlo explícito igual, aunque sea redundante: hace que el valor
sea visible en la configuración del servicio y no solo en el código.

> **Railway y `nixpacks`/Docker:** `UV_THREADPOOL_SIZE` es una variable de
> entorno normal, no un flag de build. No interactúa con el build step.

### 9.3 Ajuste por hardware

El 8 se calibró para **8 cores lógicos**. En otro hardware:

- **≤ 4 vCPU:** dejar 8. Los threads esperan más que calculan; bcrypt es
  predominantemente CPU-bound, así que 4-8 threads es el rango sano.
- **16 vCPU o más:** 8 sigue siendo una buena apuesta, pero conviene repetir
  `b15-threadpool-bench.js` con el número de cores real antes de subir. El
  criterio no es "más threads = mejor": es "más threads hasta donde el wall clock
  deja de mejorar" (§3.5).

### 9.4 Rollback

`UV_THREADPOOL_SIZE=4` en el entorno devuelve el comportamiento original
(libuv default) sin tocar código ni desplegar. Como el valor está acotado a 16,
no hay forma de que un typo en la variable deje el pool en un valor que rompa el
proceso.

---

## 10. Reproducir

```powershell
# Instancia con pool ampliado (el default ya es 8)
$env:PORT=3002
node dist\main.js

# Sonda HTTP (descartable, no reemplaza gws-load-test.js)
k6 run tests/simulation/b15-sonda.js

# Banco directo: dimensionar el pool (§3.5)
$env:UV_THREADPOOL_SIZE=4
node tests\simulation\b15-threadpool-bench.js 32

# Banco directo: bcrypt vs argon2id (§4.3)
node tests\simulation\b15-algoritmo-bench.js 24 argon2id

# Prueba de contención argon2id vs thread pool (§4.2)
node tests\simulation\b15-contencion-bench.js 32
```

Las sondas quedaron versionadas a propósito: sin ellas el diagnóstico de B15 no
es reproducible, y los números de este documento no serían verificables por un
tercero.

> **Todos los bancos de §3.5 y §4 son sintéticos**: miden el hash en aislamiento,
> sin HTTP ni base de datos, para aislar la variable. No sustituyen una prueba de
> carga end-to-end, que B12 impide generar sobre `/auth/login` (§3.4).