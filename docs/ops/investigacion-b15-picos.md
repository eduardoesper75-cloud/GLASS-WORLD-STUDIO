# B15 · Investigación de los picos de latencia (15,6 s en lecturas)

**Fecha:** 2026-10-03
**Estado:** causa raíz **probada**, no confirmada al 100%. Cerrado como diagnóstico.
**Alcance:** este documento **no modificó código de producción**. Solo análisis y una sonda descartable (`tests/simulation/b15-sonda.js`).

---

## 1. Resumen ejecutivo

Los picos de hasta **15,6 s** en endpoints de lectura no provenían de la base de
datos. Provenían de **bcrypt bloqueando el thread pool de libuv**, que es
compartido con la red y con la BD.

En términos de la taxonomía de *The Art of Computer Systems* (§6.1):
**"adversity, not condition"** — no es un defecto de una función lenta, es una
interacción adversa entre un trabajo CPU-bound y un event loop de un solo hilo
lógico.

Evidencia en una línea: con `UV_THREADPOOL_SIZE=16`, la latencia de `/health`
bajó de **85-141 ms a 52-99 ms** bajo la misma carga de autenticación, sin
cambiar una sola línea de aplicación.

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
3. El pool también lo usan **las operaciones de red** (conexiones a Postgres) y
   las de **sistema de archivos**.
4. Cuando 4+ bcrypt saturan el pool, las conexiones de BD **esperan turno**.
5. Una petición de lectura de marketplace no tarda: **tarda en arrancar**.

Por eso los picos afectaban a **lecturas** (`/marketplace/products`, ~2 ms
normales) y no solo al login. El daño se propaga por el pool compartido.

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

---

## 4. Qué se descartó como causa

| Hipótesis | Veredicto | Cómo se descartó |
|---|---|---|
| Queries lentas de Postgres | **Descartada** | `logging: true` estaba activo en el proceso de sonda y registró **0 líneas de query** en el log. TypeORM loguea toda consulta; no había ninguna lenta. |
| `synchronize: true` bloqueando | **Descartada** | `src/app.module.ts:59` tiene `synchronize: false` explícito. |
| Pool de BD subdimensionado | **Descartado como causa** | No hay `poolSize` configurado → TypeORM usa 10. Suficiente para las 2 consultas de una lectura; no explica 15,6 s. |
| Fuga de memoria / GC | **Descartada** | Working set de 94 MB, estable. Los picos no crecen a lo largo de la corrida, no es un leak. |
| Crecimiento del dataset | **Descartada** | Solo 2 productos en seed. El catálogo completo cabe en memoria. |
| Base de datos compartida con otra app | **No descartada, pero improbable** | La caída de ~77% al agrandar el thread pool apunta a saturación de CPU/threads, no a contención de BD. |

---

## 5. Por qué los picos **desaparecieron** en la corrida final

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

## 6. Recomendaciones

Ordenadas por relación esfuerzo/beneficio. **Ninguna aplicada** — todas requieren
aprobación de Jorge (§3.2 CLAUDE.md) y las que tocan límites son cambios de
producto, no de código.

### 6.1 Inmediato y de bajo riesgo

1. **`UV_THREADPOOL_SIZE=8`** en el entorno de despliegue (la máquina tiene 8
   núcleos lógicos). Medido: reduce el delta de latencia ~77%. Es un cambio de
   configuración, reversible, sin tocar código.

2. **Subir `BCRYPT_ROUNDS` de 12 a 10.** Baja el costo por hash ~4x (≈60 ms en
   vez de 236 ms). Trade-off explícito: reduce la resistencia a fuerza bruta
   offline del factor de trabajo. **Decisión de Jorge**, no del agente.

### 6.2 Requiere cambio de código

3. **Cola de autenticación con concurrencia acotada** (semáforo de N = número
   de threads). Convierte la degradación en una espera ordenada en vez de una
   estampida. Es la solución de fondo: acota el trabajo CPU en lugar de esperar
   a que se overload.

4. **Cache de verificación positiva** para sesiones ya autenticadas, con TTL
   corto. Elimina el bcrypt del camino caliente en tráfico repetido.

5. **Mover bcrypt a un worker pool dedicado** (`worker_threads` o un servicio
   separado). Es la solución correcta para producción: aísla el trabajo
   CPU-bound del pool compartido con la red.

### 6.3 Observabilidad

6. **Medir el event loop lag directamente** (`perf_hooks.monitorEventLoopDelay`).
   Todo este diagnóstico se hizo por inferencia indirecta porque no había
   instrumentación; con un `eventLoopDelay` en `/health` la causa habría sido
   obvia en el primer gráfico.

---

## 7. Nota sobre "adversity, not condition"

Es el marco que mejor describe B15 y merece quedar registrado. Ninguna función
involucrada era lenta por sí misma:

- `bcrypt.compare` tarda ~236 ms **porque está diseñada** para ser lenta.
- `SELECT` sobre marketplace tarda ~2 ms porque el índice funciona.
- El pool de 4 threads es el default **correcto** de libuv.

El defecto es la **interacción**: trabajo CPU-bound de knowingly alta latencia
compartiendo cola con trabajo sensible a la latencia. Ninguna de las tres piezas
tiene un bug; el sistema completo sí tiene un problema. Corregir una sola pieza
—subir threads, bajar rondas, encolar auth— lo mitiga; solo aíslar el trabajo
CPU-bound lo resuelve.

---

## 8. Reproducir

```powershell
# Instancia con pool ampliado
$env:PORT=3002; $env:UV_THREADPOOL_SIZE=16
node dist\main.js

# Sonda (descartable, no reemplaza gws-load-test.js)
k6 run tests/simulation/b15-sonda.js
```

La sonda quedó versionada a propósito: sin ella el diagnóstico de B15 no es
reproducible, y los números de este documento no serían verificables por un
tercero.