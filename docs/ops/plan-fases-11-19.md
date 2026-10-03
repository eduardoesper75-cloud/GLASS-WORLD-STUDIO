# GWS · Plan de fases 11 a 19

> Fecha de creación: 2026-10-02
> Autor del documento: sesión IA (Claude), bajo ~/.opencode multi-agente
> Jerarquía: este documento **complementa** a `docs/ops/estado-maestro.md`.
> Si hay contradicción entre ambos, manda `estado-maestro.md`.
> Reglas duras que ninguna fase puede violar: `CLAUDE.md` §3 (Gobernanza) y
> §5 (Convenciones). Este plan no las reemplaza, las hereda.

---

## 0. Estado de partida (verificado 2026-10-02)

| Dato | Valor | Fuente |
|---|---|---|
| Último commit | `cb3367f` — `[fase-10] feat(api): OpenAPI/Swagger con 60+ endpoints documentados + /api/docs` | `git log` |
| Fases completadas | 0–9 | `docs/ops/estado-maestro.md` |
| Fase 10 | Completada y pusheada 2026-10-02 (Swagger en `/api/docs`) | commit `cb3367f` |
| Backend | 20 módulos, 16 migraciones, 26 tests | `package.json`, `jest` |
| Frontend | Next.js 14.2 en `apps/web`, 19 tests, i18n 7 idiomas | `apps/web` |
| Build | `npm run build` exit 0 | ejecutado 2026-10-02 |
| Tests | 4 suites / 26 tests, todos verdes | ejecutado 2026-10-02 |
| Deploy | Nunca ejecutado. `README.md:7`: "No corrió en ningún servidor todavía" | `README.md` |

---

## 1. Nota sobre respaldo bibliográfico — **SIN RESPALDO BIBLIOGRÁFICO**

Las instrucciones operativas exigen buscar el fundamento en la biblioteca
antes de improvisar. Se auditó la máquina:

- **No existe una "Biblioteca GWS" de 40+ libros.** Búsqueda exhaustiva en
  `C:` y `F:` (únicas unidades montadas; `D:` no existe).
- Carpetas `biblioteca` / `libros` / `books` / `formacion` / `catedrica` /
  `catalogo`: **0 resultados**. Archivos `.epub` / `.mobi` / `.azw3`: **0**.
- Hay **~13 PDFs con contenido de libro real**, todos sueltos en
  `F:\Downloads\` sin organizar, y **todos son textos introductorios** de
  programación y frameworks web: *Lógica de Programación*,
  *Fundamentos de la Programación* (Luis Hernández Yáñez),
  *Introducción a la Programación* (Javier Pino Herrera, Patricia Martínez
  Moreno), *Programación Web del Frontend al Backend* (Ricardo Javier
  Celárraga), *Django 3 por ejemplos*, *97 cosas que todo programador
  debería saber*.
- **Ninguno trata** arquitectura de software a escala, priorización de
  roadmap, CI/CD, seguridadOwasp ni despliegue.

**Consecuencia para este documento:** el ordenamiento de fases 11→19 **no
tiene respaldo bibliográfico**. Se apoya exclusivamente en fuentes internas
del proyecto, citadas textualmente en cada sección:

- `CLAUDE.md` §1 (tabla de Galaxias y su estado real)
- `CLAUDE.md` §1 **"Regla de alcance"**
- `CLAUDE.md` §3.4 (flujo de despliegue obligatorio)
- `CLAUDE.md` §3.5 (RBAC en capas)
- `docs/ops/estado-maestro.md` (bloqueos abiertos)
- `docs/ops/pendientes-bloqueados-codespace.md` (registro de deuda técnica)
- `docs/database/gap-analysis.md` (gaps P0 de esquema, autor `architect`)

No se cita ninguna fuente externa porque no se halló ninguna que corresponda.
**No inventar citas.**

---

## 2. FASE 11 — Simulación de carga (k6)

**Por qué ahora:** hasta acá el backend solo se validó con 26 tests unitarios
y de integración contra PostgreSQL local. No hay **ninguna** medición de
comportamiento bajo carga. `estado-maestro.md:13` declara "Bloqueos: ninguno",
lo cual es cierto en lo técnico pero no en lo operativo: no se sabe si el
sistema aguanta 100 usuarios simultáneos, y sin ese dato no hay forma seria de
dimensionar la infraestructura de las fases 12 y 18.

**Alcance:**
- Escenarios de usuario: registro/login, listado de catálogo G2, creación de
  orden (`POST /orders` con `Idempotency-Key`), consulta de órdenes,
  cancelación.
- Ejecución contra el backend real (`http://localhost:3001`), no contra mocks.
- Métricas a capturar: latencia p50/p95/p99, throughput (req/s), tasa de
  error por endpoint, saturación de conexiones del pool TypeORM, y efecto
  sobre el `ThrottlerGuard` (`@nestjs/throttler`).
- Dosdeo: 50 usuarios / 5 min como smoke, 200 usuarios / 15 min como carga
  sostenida.

**Criterio de salida:** p95 < 300 ms en endpoints de lectura y < 800 ms en
`POST /orders`, tasa de error < 0,5 %, y un documento
`docs/ops/carga-informe-YYYY-MM-DD.md` con los números. Si un endpoint no
cumple, **se abre una entrada en
`docs/ops/pendientes-bloqueados-codespace.md` con el número medido**, no se
opina al aire.

**Conflicto a resolver antes de empezar:** k6 no está en el stack declarado en
`DAT-GWS.md` §Infraestructura. **SIN RESPALDO BIBLIOGRÁFICO** para la elección
de k6 sobre alternatives (autocannon, Artillery). Se elige por ser el estándar
más extendido en el ecosistema NestJS; si Jorge prefiere otro, se cambia.

---

## 3. FASE 12 — Docker + docker-compose

**Por qué ahora:** `CLAUDE.md` §4 declara "Contenedores obligatorios
(Docker/Kubernetes) — **CONFIRMADO** por Jorge como requisito innegociable del
proveedor de hosting elegido". Hoy eso no está cumplido: existe un
`docker-compose.yml` con `postgres:16-alpine`, pero **no hay Dockerfile para
backend ni frontend**. Además, el registro de bloqueos
`pendientes-bloqueados-codespace.md` marca el ítem **P1 (E2E de migraciones)
como bloqueado por "Docker caído en el entorno principal"** — o sea, esta fase
desbloquea deuda técnica ya registrada, no es trabajo nuevo.

**Alcance:**
- `Dockerfile` backend multi-stage sobre alpine, con build de TypeScript,
  `prune` de devDependencies y usuario no-root en runtime.
- `Dockerfile` frontend multi-stage (`next build`) servido por nginx, con
  rewrite a `/api/gateway/[...path]` hacia el backend.
- `docker-compose.yml` ampliado: PostgreSQL 16 + Redis (cache para el radar de
  proximidad G2 y para sesiones) + backend + frontend.
- Verificar `docker-compose up --build` de punta a punta, con migrations
  aplicadas y seed E2E (`seed.seller@gwe2e.dev`, de `estado-maestro.md:12`).

**Criterio de salida:** stack levanta limpio en una máquina sin Node instalado.
Al cerrarse, el ítem **P1** del registro de bloqueos queda pagado o
reformulado con evidencia.

**Deuda relacionada:** `README.md:32` admite que hoy se usa
`synchronize: true` en lugar de migraciones versionadas. Dockerizar sin
arreglar esto congela la deuda; **recomendación**: migrar a migraciones
versionadas antes del deploy de la FASE 18.

---

## 4. FASE 13 — Galaxias restantes (frontend)

**Por qué ahora:** `CLAUDE.md` §1 marca el estado real por Galaxia — G1
"Prototipado", G2 "Prototipado", G3 "Prototipado", G6 "Prototipado",
G4 y G5 **"Reservado"**. El frontend `apps/web` cubre hoy `/`, `/intro`,
`/umbral`, `/login`, `/register`, `/plans`, `/dashboard`, `/checkout`,
`/orders`, `/orders/[id]` y `/galaxies/g2`. **No existe ninguna página de
G1, G3, G4, G5 ni G6.**

### ⚠ CONFLICTO EXPLÍCITO — `CLAUDE.md` §6

El encargo original de esta fase incluía construir **G4 (Institución: papers,
museos)** y **G5 (Industria: maquinaria, licitaciones)**. Eso **contradice
directamente** `CLAUDE.md` §1:

> **"Regla de alcance**: no construir G4/G5 en profundidad hasta tener contenido
> real que mostrar. Un espacio vacío con estética linda es peor que un espacio
> que dice honestamente 'próimamente' — genera expectativas falsas."

Además el `gap-analysis.md` del `architect` (2026-09-18) confirma que **G3 no
tiene entidades de posts, hilos, comentarios ni canales** — o sea, no hay
ni siquiera modelo de datos. Construir su frontend ahora sería exactamente el
"espacio vacío con estética linda" que la regla prohíbe.

**Este documento NO autoriza construir G4/G5.** Propuesta ajustada:

| Sub-fase | Contenido | Justificación |
|---|---|---|
| 13.1 | G1 Maestros: perfiles, portafolios, catálogo de cursos/talleres/libros | G1 ya está "Prototipado" en backend; falta la superficie de usuario |
| 13.2 | G3 Comunidad: **primero el modelo de datos** (posts/hilos/comentarios/canales) + backend, después frontend | cierra el gap **P0-04** del gap-analysis |
| 13.3 | G6 Ingeniería: repuestos, fichas técnicas, MSDS | ya existe el wizard de horno en backend |
| 13.4 | G4 y G5: **solo un estado "Próximamente" honesto**, sin contenido inventado | Regla de alcance §1 |

**Restricciones no negociables:**
- Todo frontend nuevo importa `design-system/gws-design-tokens.css`
  (fuente única de verdad, `CLAUDE.md` §2). Nada de glassmorphism
  reinventado por componente.
- Textos de UI en español; los 7 idiomas ya cargados en FASE 1-8 deben
  ampliarse por clave, no por archivos paralelos.
- El chat de G3 queda bajo el filtro anti-fuga
  (`src/community/anti-leak/contact-leak-filter.ts`) sin excepciones
  (`CLAUDE.md` §3.6).

**Criterio de salida:** cada página nueva con test, i18n en los 7 idiomas y
tokens importados del design system.

---

## 5. FASE 14 — Satélites

**Por qué ahora:** `CLAUDE.md` §1 lista el **Satélite de Licitación 72hs** como
"Prototipado (visual)" y el **Radar Oferta/Demanda + Motor Predictivo** como
"**Conceptual**" — es decir, no existe en código. Son transversales: dependen
de que G1/G2/G3 tengan contenido real, de ahí que vaya después de la FASE 13.

**Alcance, por satélite:**
- **Bóveda del Conocimiento** — es el único lugar donde `DAT-GWS.md` §Datos
  justifica almacenamiento documental/vectorial para RAG, y sólo para esta
  entidad (`CLAUDE.md` §4). Nunca para datos transaccionales.
- **Radar Oferta/Demanda** — depende del gap **P0-02** del gap-analysis:
  `users` no tiene `countryCode` ni `region`, así que hoy la agrupación por
  proximidad **es sólo in-memory**. Sin esas columnas no hay radar; agregar la
  dimensión país/región (gap **P0-03**) es prerrequisito, no opcional.
- **Rincón del Usado** — segunda mano; hereda el filtro anti-fuga aplicado a
  descripciones de listings de G2, hoy pendiente de extensión.
- **Ingeniería Predictiva** — curvas de recocido y cálculos de horno;
  reutiliza lo existente de G6.
- **Servicios Técnicos** — prestadores de servicio técnico; nueva entidad de
  roles.

**Criterio de salida:** cada satélite con entidad, endpoints OpenAPI
documentados (manteniendo el estándar de la FASE 10) y test. **Un satélite
por vez**, no los cinco juntos.

---

## 6. FASE 15 — Ciberseguridad completa

**Por qué ahora:** es la fase que más bloquea a la 17 y la 18, y varias de
sus piezas ya están identificadas como faltantes en el propio repo.

**Deuda ya registrada que esta fase paga:**
- `README.md:32` admite explícitamente como **omisión deliberada**: rate
  limiting en `/auth/login` y `/auth/register` (**aunque `@nestjs/throttler`
  ya está instalado y sin uso efectivo ahí**), verificación real de email, y
  el **endpoint de setup de TOTP** — que es un problema de seguridad real:
  `AuthService.elevate()` exige TOTP pero no existe el flujo que genera el
  secreto ni el QR. La elevación de privilegio de `CLAUDE.md` §3.5 no se
  puede completar hoy.
- `src/auth/auth.service.ts:28`:
  `const CURRENT_PRIVACY_VERSION = 'draft-v1-pendiente-revision-legal';`
  — un string de placeholder **en el código de auth**.
- `docs/ops/estado-maestro.md:23-26` escala **9 findings de `npm audit`** en
  el toolchain frontend, pendientes de decisión de Jorge.

**Alcance:**
- Auditoría OWASP Top 10 con reporte fechado; el filtro anti-fuga se trata
  como control ya existente a preservar, no a reinventar.
- 2FA (TOTP) completo: setup con secreto + QR, verificación, y auditoría de
  cada elevación conforme a §3.5 (log inmutable, ventana de 20–30 min,
  notificación por canal distinto).
- Rotación de tokens y política de invalidación.
- Headers de seguridad y endurecimiento de CORS (hoy `main.ts` usa
  `origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000'` con fallback
  permisivo).
- **Rate limiting real** en auth y en los endpoints de escritura de G2.

**Restricción dura — `CLAUDE.md` §3.1:** esta fase **no** incluye tocar
`Payment_Vault` ni credenciales de tesorería. Endurecer el perímetro de
autenticación sí; acercarse a la caja de pagos, no. Revisión OWASP con
herramientas de terceros debe correr en modo `viewer` (rol de menor privilegio
de §3.5).

**Criterio de salida:** reporte OWASP fechado, `npm audit` triado con Jorge,
endpoint TOTP funcionando con test.

---

## 7. FASE 16 — CI/CD con GitHub Actions

**Por qué ahora:** `CLAUDE.md` §3.4 define el flujo **obligatorio**:
"desarrollo → staging (entorno idéntico con datos de prueba) → validación →
despliegue progresivo (canary) → producción completa", más feature flags por
Galaxia y mecanismo de rollback definido antes de aplicar cualquier cambio.
**Hoy no hay nada de eso implementado**: hoy `origin/main` es producción y
cualquier merge es un deploy sin etapas ni rollback.

**Alcance:**
- Workflow de **test + build en cada push y PR**: `npm ci`, `npm run build`,
  `npm test` (backend 26 tests) y `npm test` de `apps/web` (19 tests), con
  PostgreSQL como servicio (health-check) para que los tests de integración
  corran de verdad y no se salten.
- Workflow de **deploy en merge a `main`**, con ambiente `staging` antes de
  `production`.
- Cache de `node_modules`/pnpm y matriz de versiones de Node.
- Secrets vía GitHub Secrets — **nunca** en el repo (regla ya reforzada en
  `.gitignore` el 2026-10-02).

**Criterio de salida:** rama `main` protegida, badge de CI verde, staging
desplegándose en cada merge, y documentado el mecanismo de rollback
(requisito explícito de §3.4: "si no se puede responder '¿cómo se revierte
esto?', no se aplica el cambio").

---

## 8. FASE 17 — Pagos en sandbox

**Por qué ahora:** es la última dependencia dura del lanzamiento. Sin un
procesador de pagos probado, las fases 18 y 19 no tienen sentido.

**Bloqueos de partida, todos registrados:**
- `CLAUDE.md` §4: "**PENDIENTE DE CONFIRMACIÓN**" del procesador definitivo —
  nombra Mercado Pago para Argentina y Stripe/dLocal para internacional.
- `CLAUDE.md` §4 y §3.1: preferencia por **checkout alojado por el
  procesador** para minimizar alcance de cumplimiento PCI-DSS; "el backend de
  GWS no debe manejar números de tarjeta en ningún caso".
- `pendientes-bloqueados-codespace.md` ítem **P5**: adaptador USDT en
  producción (TRC-20/Polygon) bloqueado porque `Payment_Vault` es
  inalterable por IA. **Esa parte queda fuera del alcance de cualquier agente.**
- `pendientes-bloqueados-codespace.md` ítem **P6**: auto-release de escrow
  programado bloqueado por "no hay infraestructura de cron/jobs en el backend
  actual" — la FASE 12 (Redis + compose) y la FASE 16 (CI/CD) le dan el
  mecanismo.

**Alcance:**
- MercadoPago sandbox (preferido para lanzamiento en Argentina), Stripe
  sandbox (internacional), PayPal sandbox.
- **Settlement Engine**: cierre de órdenes y reparto de comisión, con
  redondeo decimal correcto — ver `F:\Desktop\DOC-GWS\004-decimal-rounding.md`
  (decisión de diseño ya escrita) y `001-idempotency-key.md`.
- Idempotencia estricta en el webhook de confirmación de pago, apoyada en el
  `Idempotency-Key` que ya usa `POST /orders`.

**Restricción dura — `CLAUDE.md` §3.1 y §3.5:**
- Cero cambios autónomos de tarifas, comisiones o términos de suscripción.
  Todo cambio de este tipo: agente prepara → notifica a Jorge → Jorge confirma
  explícitamente **en el momento** → se ejecuta. Pre-aprobado en abstracto no
  cuenta.
- `Payment_Vault` no se toca. Toda integración se desarrolla **alrededor** de
  él.

**Criterio de salida:** un ciclo completo de compra en sandbox, con escrow
creado, liberado y liquidado, y el ítem **P6** resuelto o con infraestructura
documentada.

---

## 9. FASE 18 — Deploy a producción

**Estado:** explícitamente **en espera de aprobación de Jorge**
(`estado-maestro.md:13`: "deploy FASE 18 aguarda aprobación de Jorge").
Esta fase no se ejecuta en modo autónomo. Se documenta, no se dispara.

**Prerrequisitos que deben cumplirse antes de pedir la aprobación:**
1. Fases 11, 12, 15, 16 y 17 cerradas.
2. `CLAUDE.md` §4 completo: los 5 puntos "PENDIENTE DE CONFIRMACIÓN"
   resueltos (hosting, gestor de secretos, procesador de pagos, observabilidad,
   alcance geográfico GDPR vs. Ley 25.326).
3. `CLAUDE.md` §3.4 respetado: canary + rollback documentado.
4. Ítem P5 de `pendientes-bloqueados-codespace.md` resuelto **por Jorge**, no
   por un agente.

**Nota de coherencia:** el encargo original propone Railway (backend) +
Vercel (frontend) + Neon (DB). Eso **contradice** `CLAUDE.md` §4, que fija
**AWS como plataforma obligatoria** con contenedores obligatorios
("CONFIRMADO por Jorge como requisito innegociable"). Railway/Vercel/Neon no
son AWS ni contenedores. **Este documento planifica AWS**, siguiendo la regla
del proyecto; la propuesta Railway/Vercel queda registrada acá como alternativa
**a confirmar explícitamente por Jorge**, porque el económico del proyecto
(Railway/Vercel tienen planes gratuitos) puede ser la razón real del desvío.
No se ejecuta ninguna de las dos hasta que Jorge decida.

**Criterio de salida:** backend y frontend en producción con HTTPS, health
check verde, migraciones aplicadas, variables de entorno configuradas por
secret manager, y observabilidad activa.

---

## 10. FASE 19 — Lanzamiento

**Alcance:**
- Migración de los datos iniciales reales (catálogo G2, perfiles G1, también
  de los gaps P0 del esquema que sigan abiertos).
- Verificación final end-to-end contra producción.
- Onboarding de los primeros usuarios, con el canal **dentro** de la
  plataforma (`CLAUDE.md` §3.6 — el chat interno es la única vía; prohibido
  integrar WhatsApp/email/redes como vía de negociación).
- Cierre de los ítems P2, P3 y P4 del registro de bloqueos (tracking de
  carteleras, SLA de Búnker, scraping G6 — este último con revisión de
  derechos de contenido y curaduría humana, no automatizado).

**Criterio de salida:** primer usuario completando el ciclo
registro → compra → entrega → escrow liberado sin intervención manual de
soporte.

---

## 11. Resumen de la secuencia y sus dependencias

```
11 Carga (k6) ──┐
12 Docker ──────┼──► 15 Seguridad ──► 16 CI/CD ──┐
13 Galaxias ─────┤                                 ├──► 18 Deploy ──► 19 Lanzamiento
14 Satélites ────┘                                 └──► 17 Pagos ──┘   (aprobación de Jorge)
```

- **13 antes de 14**: los satélites consumen contenido de las Galaxias.
- **15 antes de 17**: no se abre un canal de pago sobre un perímetro sin 2FA
  funcional.
- **16 antes de 18**: sin canary ni rollback no hay despliegue conforme a
  §3.4.
- **11 antes de 12**: dockerizar después de conocer la carga real dimensiona
  mal los contenedores.
- **18 y 19 no se ejecutan en modo autónomo**, bajo ninguna circunstancia.

---

## 12. Bloqueos que este plan NO resuelve solo

| # | Bloqueo | Quién lo resuelve |
|---|---|---|
| B1 | Aprobación de deploy (FASE 18) | Jorge |
| B2 | 9 findings de `npm audit` del toolchain frontend | Jorge |
| B3 | SLA de Búnker (ítem P3: 48h/5d · 24h/72h · 4h remoto) | Jorge |
| B4 | Los 5 ADR "PENDIENTE DE CONFIRMACIÓN" de `CLAUDE.md` §4 | Jorge |
| B5 | Proveedor de hosting: AWS (§4) vs Railway/Vercel/Neon (§9) | Jorge |
| B6 | `Payment_Vault` y adaptador USDT producción (ítem P5) | Jorge, con elevación + 2FA — **nunca un agente** |
| B7 | Revisión legal de `CURRENT_PRIVACY_VERSION` y alcance GDPR/Ley 25.326 | Jorge + asesoría legal |
| B8 | Curaduría humana para scraping G6 (ítem P4) | Jorge |

---

## 13. Próximo paso inmediato

**FASE 11 — Simulación de carga con k6.** Es la única de la lista que no
requiere ninguna decisión de Jorge para arrancar, no toca `Payment_Vault`, no
toca infra de producción, y produce el dato que hoy falta para dimensionar todo
lo demás.

Antes de arrancarla hay que cerrar **B5** (¿AWS o Railway/Vercel/Neon?),
porque el resultado de la carga define el dimensionado y esa decisión cambia la
respuesta.
