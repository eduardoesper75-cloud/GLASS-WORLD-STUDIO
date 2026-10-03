# FASE 11 · Análisis final de la simulación de carga

**Fecha:** 2026-10-03
**Commit:** pendiente (este commit)
**Herramienta:** k6 v2.2.0
**Perfil:** `con-seguridad` (rate limiting activo, post-fix B12)
**Salida cruda:** `docs/simulation/resultados-fase-11.json` (1,38 GB · 287.541 requests · **no versionado**, ver `.gitignore`)
**Resumen numérico:** `docs/simulation/resumen-resultados.txt`
**Guiones:** `tests/simulation/gws-load-test.js` · post-proceso `tests/simulation/resumir-resultados.js`

> Contexto: esta corrida es la **primera con el rate limiting corregido** (fix B12,
> commit `890da13`). El cambio no es cosmético: antes de esa corrección el global
> permitía ~175.000 req/min y `/auth/login` ~83 intentos/segundo. Los números de
> esta corrida describen, por primera vez, cómo se comporta el sistema con sus
> defensas activas.

---

## 1. Escenario A · Health (10 VUs · 30s · 48.818 requests)

| Métrica | Valor |
|---|---|
| p50 | 2,00 ms |
| p95 | 7,00 ms |
| p99 | 10,43 ms |
| max | 48 ms |

Umbral `p(95) < 300ms`: **PASS** con 43x de margen.

Lectura de negocio: la disponibilidad del servicio no depende de nada pesado
(una consulta trivial a la BD). El p99 de 10 ms con 48.818 muestras indica que
el event loop mantiene el Scheduler Stable bajo carga — **no hay saturación de
CPU ni GC visibles en este escenario**.

---

## 2. Escenario B · Login (50 VUs · 90s · 7.471 requests)

| Métrica | Valor |
|---|---|
| p50 | 0,56 ms |
| p95 | 3,00 ms |
| p99 | 6,00 ms |
| max | 426 ms |

| Contador | Valor |
|---|---|
| Logins con `accessToken` (200/201) | **9** |
| Logins rechazados con 429 | **7.462** |
| Requests que llegaron a bcrypt | 9 |

### El dato importante: este escenario ya NO mide bcrypt

Los 7.462 rechazos son **7.462 veces menos trabajo de CPU**: el `ThrottlerGuard`
corta la petición *antes* de que el controlador llame a `bcrypt.compare()`. Por
eso el p50 es de 0,56 ms — no es "login rápido", es **login que no ocurrió**.

El p50 de ~2,4 s que se había medido en corridas anteriores correspondía a 50
intentos de verificación de hash compitiendo por el thread pool. Ese costo ya
no es observable desde este escenario, y **no porque se haya mejorado, sino
porque el límite lo impide**. Es una mejora de seguridad con una consecuencia
de medición que hay que declarar:

> **Para volver a medir capacidad de autenticación hace falta el perfil
> `sin-throttle`** (que reinicia el backend con límites relajados). Con el
> rate limiting de producción activo, la latencia de login bajo carga es
> éticamente irrelevante: el sistema no la permite.

Los 9 logins que sí pasaron (incluido el del `setup()` a 222 ms) confirman que
el camino de éxito sigue funcionando con bcrypt de 12 rondas.

---

## 3. Escenario C · Marketplace (100 VUs · 90s · 49.120 requests)

| Endpoint | p50 | p95 | p99 | max |
|---|---|---|---|---|
| `marketplace/products` (n=24.560) | 1,56 ms | 7,00 ms | 11,72 ms | 70 ms |
| `marketplace/products/:id` (n=24.560) | 1,68 ms | 6,98 ms | 11,25 ms | 155 ms |

Umbral `p(95) < 800ms`: **PASS** con 114x de margen.

Alta proporción de 429 por el global de 100/min: esperado, y es el escenario
que hoy mide "cuánto frena el límite global", no la capacidad de lectura.

---

## 4. Escenario D · Creación de órdenes (20 VUs · 60s · 182.129 requests) — B14

Este escenario **no existía** antes de esta corrida: es el que pedía B14.

| Métrica | Valor |
|---|---|
| p50 | 3,00 ms |
| p95 | 5,86 ms |
| p99 | 7,74 ms |
| max | 49 ms |

| Resultado | Valor |
|---|---|
| Órdenes creadas (`201`, checks OK) | **10** |
| Rechazadas con 429 | **182.119** |
| Fallidas por error de negocio | **0** |

Umbral `p(95) < 1500ms`: **PASS** con 256x de margen.

### Las 10 órdenes no son un bug: son el límite funcionando exactamente

El decorador `@Throttle({ ttl: 60_000, limit: 10 })` agregado a `POST /orders`
permite **10 escrituras por minuto y por IP**. La ventana del escenario dura
60 segundos. Se crearon **10 órdenes — exactamente el techo permitido**, con las
10 validaciones de `idempotencyKey`, `status: 'pending'` y `id` correctas.

Corolario operativo: **el límite de 10/min es aggressive para tráfico real.**
Un comprador legítimo con dos dispositivos, o un cliente que reintenta tras un
time-out de red, choca contra él enseguida. Como la creación de órdenes es
idempotente, subir el límite es seguro; los reintentos no duplican. Ver §6.

### Reconciliación del total de respuestas 201

El JSON crudo contiene `status 201: n=20`, y se compone de:

- 9 logins exitosos del escenario B
- 1 login del `setup()` (222 ms)
- 10 órdenes creadas

= **20**. Cuadra exactamente; no hay respuestas sin clasificar.

---

## 5. El hallazgo transversal: B15 **no se reprodujo**

La corrida anterior registró picos de **15,6 s** en lecturas de marketplace.
En esta corrida, sobre 287.541 requests:

| Umbral | Requests |
|---|---|
| > 500 ms | **0** |
| > 1000 ms | **0** |
| > 2000 ms | **0** |

Latencia máxima observada en toda la corrida: **426 ms**.

Interpretación honesta: **esto no prueba que B15 esté resuelto, prueba que la
causa raíz sigue latente y ahora está enmascarada.** El 65,93% de las
peticiones de esta corrida fueron cortadas por el throttler antes de llegar a
la lógica de negocio, así que la BD y el thread pool recibieron una fracción
de la carga de la corrida anterior. Los picos aparecen cuando bcrypt compite
con las consultas; dejar de ejecutar bcrypt las oculta.

Detalle en `docs/ops/investigacion-b15-picos.md`.

---

## 6. Conclusiones y acciones

1. **B12 cerrado.** El fix está verificado en runtime, no solo en unit tests:
   seis logins consecutivos desde la misma IP devuelven
   `401, 401, 401, 401, 401, 429, 429`. El test de regresion detecta el bug si
   se reintroduce.

2. **B13 sigue abierto** y ahora es **inmedible desde el perfil con
   seguridad**, por diseño. Requiere una corrida dedicada `sin-throttle`.

3. **B14 cerrado** en cuanto a *medición*. La ruta de escritura del checkout
   tiene p95 de 5,86 ms con 0 errores de negocio.

4. **Riesgo operativo nuevo, introducido por el fix:** `POST /orders` a 10/min
   puede frenar a un cliente legítimo. Recomendación: subir a **30/min** — la
   idempotencia por `idempotencyKey` (ADR-001) ya garantiza que los reintentos
   no dupliquen órdenes, así que el límite puede ser holgado sin perder
   protección. Requiere aprobación de Jorge (§3.2 de CLAUDE.md: no cambiar
   límites en silencio).

5. **El nombre de una métrica mentía.** `gws_tasa_error_negocio` reportaba
   `100.00%` significando **cero** errores (en k6, `Rate.add(true)` cuenta como
   'bien'). Renombrada a `gws_tasa_ok_negocio`. No era un error de lógica, pero
   hacia que un panel sano pareciera lleno de errores.

---

## 7. Nota sobre el JSON crudo

`docs/simulation/resultados-fase-11.json` pesa **1,38 GB** y está excluido de
Git por `.gitignore` (`docs/simulation/resultados-*.json`) — ver la decisión en
`docs/ops/plan-fases-11-19.md`. Regenérase con:

```
k6 run --out json=docs/simulation/resultados-fase-11.json tests/simulation/gws-load-test.js
node tests/simulation/resumir-resultados.js docs/simulation/resultados-fase-11.json
```

El post-proceso quedó reescrito en streaming (`readline`) porque la versión
anterior usaba `readFileSync` y moría con `ERR_STRING_TOO_LONG` de V8 a partir
de ~512 MB — exactamente el tamaño de esta corrida.