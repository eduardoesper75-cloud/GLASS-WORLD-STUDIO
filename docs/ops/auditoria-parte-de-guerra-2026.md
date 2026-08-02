# Parte de Guerra · Auditoría Completa y Radiografía Tecnológica de Glass World Studio

> **Orden Suprema de Auditoría · 2026-08-02 · fase: pre-migración Docker/Codespace**
> Unidades desplegadas en el parte: motores de inferencia del sistema operativo,
> agentes de investigación paralela y validación humana del Comando (Jorge).
> Método: exploración de código real con evidencia `file:line` — nada inferido.

---

## PARTE 1 · INVENTARIO OBLIGATORIO DE AGENTES, SKILLS Y RECURSOS

### 1.1 · Agentes y roles que intervinieron en la obra forjada

| Disciplina | Unidades que intervinieron | Evidencia forjada |
|---|---|---|
| Diseño de base de datos / migraciones | Unidades de arquitectura de esquema (TypeORM) | **14 migraciones** `1720000000000`→`1742000000000` en `src/database/migrations/` |
| Lógica NestJS | Unidades de dominio (módulos) | **20 módulos** registrados en `src/app.module.ts:27-118` |
| Esquemas de escrow | Unidad de custodia y liberación | Módulo `src/escrow/` completo + migración `1742000000000` |
| Validación de multimedia | Unidad de soberanía de medios | `src/common/media/` (const · validate · validator) |
| Blindaje jurídico | Unidad de gobernanza legal | `docs/manual/codigo-del-fuego.md` v2.0 + `docs/research/manual-navegacion-juridico-2026.md` |
| Token estético "Vetas de Luz" | Unidad de identidad visual | Skill `.claude/skills/gws-vetas-de-luz/SKILL.md` + `gws-design-tokens.css` + `vetas-de-luz-demo.html` |

### 1.2 · Skills y herramientas utilizadas

| Recurso | Estado | Ubicación |
|---|---|---|
| **Vetas de Luz** (trazas SVG ramificadas = plomo de vitral) | Operativo (capa de marca) | `design-system/gws-components.css:20-54` |
| **Código del Fuego** (grano de obsidiana + llama de soplete) | Operativo (capa de página) | `portada-umbral.html:28-64` · `manual-codigo-del-fuego.html:33-56` |
| Motor de conversión monetaria USD/USDT (paridad 1:1) | Operativo | `src/settlement/` + `src/localization/` |
| Validador de token de medios (allowlist soberano) | Operativo | `src/common/media/gws-media.validate.ts` |
| Módulos de scraping | **No desplegado** (P4 pendiente) | `docs/ops/pendientes-bloqueados-codespace.md:17` |
| Motores de verificación de saldo USDT | Demo únicamente (Payment_Vault excluido §3.1) | `src/settlement/settlement.adapter.ts:54-86` |

### 1.3 · Endpoints y DTOs generados

**17 controllers · 89 rutas HTTP · 38 archivos DTO.**

| Módulo | Rutas | DTOs | Endpoints clave (acceso) |
|---|---|---|---|
| auth | 7 | 1 | register/login (público 5/min) · elevate/TOTP (JWT) |
| community | 3 | 0 | mensajes (JWT) · hide (MODERATOR) |
| marketplace | 8 | 5 | listado/radar (público) · CRUD productos (JWT/dueño) |
| g1-masters | 10 | 6 | vitrina (público) · verificación/maestro (ADMIN+ELEV) |
| foundation | 4 | 1 | slots/SSE (público) · claim (JWT 5/min) |
| localization | 5 | 1 | geo/currencies/convert (público) |
| subscriptions | 4 | 2 | plans/quote (público) · mine (JWT) · stub (ADMIN) |
| vault | 9 | 3 | bóveda/legal (público) · upload (JWT) · review (MODERATOR/ADMIN) |
| preferences | 2 | 1 | get/update (JWT) |
| customs | 4 | 1 | hs-codes/estimate (público) |
| ux | 1 | 0 | **manifest UX** (público) |
| billboards | 6 | 3 | carteleras/campañas (JWT) · toggle (ADMIN+ELEV) |
| bunker | 10 | 7 | especialistas (público filtrado) · altas/tickets (JWT) · verify (ADMIN+ELEV) |
| settlement | 2 | 1 | meta (público) · verify-usdt-balance (JWT demo) |
| g6-tech-sheets | 5 | 2 | catalog/meta (público) · suggest/create/mine (JWT) |
| escrow | 7 | 3 | release-matrix (público) · claim (JWT) · resolve (ADMIN+ELEV) |
| commissions | 2 | 1 | list (público) · updateRules (ADMIN+ELEV) |

**Reglas de comisión forjadas** (constantes reales): G1 obra 30 % / G1 productos 18 % · G2/G3/G4/G6 estándar 18 % · G5 maquinaria 20 % (`commissions.const.ts:5-11`) · Búnker $50/mes con 0 % comisión y fidelización 10/15/20 % (`bunker.const.ts:70-81`) · Carteleras **$1 USD o 1 USDT/día**, 1–30 días, horizonte 60 (`billboards.const.ts:25-29`).

**Guardianes de acceso**: 9 roles + 10 acciones con elevación TOTP (`gws-role.enum.ts:8-66`) · guards `RolesGuard`/`ElevationGuard`/`JwtAuthGuard` con `tokenVersion` (revocación server-side) · Throttler global 100 req/min/IP.

---

## PARTE 2 · AUDITORÍA DE INQUIETUDES, CURIOSIDAD Y PUNTOS CIEGOS (STRESS TEST)

### 2.1 · Cuellos de botella en la sincronización de liberación (24 h · 72 h · 7 d · 10 d) vs. disputas complejas

**Veredicto: existen 4 puntos de fricción reales.**

1. **CRÍTICO — Disputa compleja congela fondos sin salida.** Un reclamo solo admite `claimReason` (texto 20–2000 chars, `claim-escrow.dto.ts:10-16`): no hay adjuntos, ni respuesta de la contraparte, ni mediación, ni **SLA/caducidad del reclamo**. En `CLAIMED` el dinero queda retenido indefinidamente si el Comando no resuelve. Único resolutor: ADMIN + elevación (`escrow.controller.ts:73-78`).
2. **ALTO — Ventana de reclamo fatalmente estrecha.** `claim()` solo acepta estado `HELD` (`escrow.service.ts:159-161`); como la liberación es lazy, un comprador que reclama 1 minuto después del vencimiento ya no puede disputar jamás.
3. **ALTO — Race condition lost-update.** No existe `@Version` ni `pessimistic_write` en `escrow-hold.entity.ts`. Un sweep que lee `HELD` puede pisar un reclamo `CLAIMED` recién persistido (persiste `RELEASED` sobre el reclamo).
4. **MEDIO — Liberación solo ocurre si alguien lee** (lazy, `escrow.service.ts:71-79`). P6 (sweep programado) confirmado ausente: no hay `@nestjs/schedule`. Además `GET /escrow/pending-releases` muta la DB (antipatrón) y opera solo con ADMIN sin elevación (`escrow.controller.ts:93-99`).

**Recomendación de cierre**: columna `@Version`, ventana de reclamo ≥ 24 h **antes** del `holdUntil` (claimable_until), SLA de resolución con timeout de escalamiento, y sweep programado (P6) con transacción por retención.

### 2.2 · Seguridad y resiliencia — allowlist multimedia y Búnker

**Multimedia — robustez media, con 2 brechas de soberanía:**
- El modelo es vitrina de URLs (no hay subida de binarios: sin multer/FileInterceptor en todo `src/`).
- **Brecha A (ALTO)**: `stream: ['*']` acepta cualquier host HTTPS y la validación es solo por extensión del sufijo (`gws-media.validate.ts:85-89,197-204`). Un host arbitrario puede servir HTML/redirect disfrazado de `.mp4`/`.m3u8`. Sin verificación de servidor ni MIME/magic bytes.
- **Brecha B (MEDIO)**: `poster` sin allowlist (`:139-149`) y faltan hosts de contacto modernos en la lista prohibida (TikTok/X/Snapchat).
- El `@IsGwsMediaArray()` se aplica en 2 capas (DTO + service) en marketplace y G1 — correcto para video.

**Búnker de Ingeniería — gap de confianza de alto impacto:**
- El alta exige **E.164 estricto** (`+[1-9]\d{1,14}`, `create-specialist.dto.ts:43-46`) y `countryCode` 2 chars, pero **no valida ISO 3166-1 real** ni contenido de credenciales (`credentials` sin `@ValidateNested`; `create-specialist.dto.ts:82-88,101-103`).
- **CRÍTICO DE CONFIANZA**: `quoteRequest` no exige sello élite — un perfil **no verificado** con membresía $50/mes puede tomar tickets y cobrar honorarios (`bunker.service.ts:216-253`). El sello solo afecta al directorio público.
- **Doble asignación de ticket** por read-modify-write sin lock (`bunker.service.ts:231-244`) y membresías duplicadas sin chequeo de activa.
- Rate limiting: solo la verificación tiene `@Throttle` explícito; el resto depende del global.

### 2.3 · Escalabilidad de datos — Galaxia 6 (autopredictor) bajo alta concurrencia

**Veredicto: fluido hoy (16 templates), frágil mañana.**

- `suggest()` ejecuta `templateRepo.find({ isActive: true })` **en cada request** + scoring O(N×M) en memoria (`g6-tech-sheets.service.ts:56-108`) **sin cache**.
- Índices: solo UNIQUE slug + family + sellerId + productId. **No hay índice en `isActive` ni GIN en jsonb keywords/brands** (`1741000000000-G6TechSheetsSchema.ts:294-327`).
- Seed verificado: **16 templates** (3 grisallas 630/750/820 curadas + 2 varillas boro curadas; resto `curated:false`).
- Con el roadmap P4 (scraping → catálogo grande), cada sugerencia sería full-scan. **Recomendación**: capa de cache en memoria + índice parcial `isActive` + GIN + umbral de confianza mínimo y scoring posicional.

---

## PARTE 3 · MANDATO DE CIERRE DE FASE

### 3.1 · Radiografía validada — go / no-go para Codespace

La radiografía está **completa y validada**. El backend compila limpio (`npm run build` exit 0). Los hallazgos de la Parte 2 **no bloquean** la migración: son mejoras de endurecimiento posteriores. La migración no depende de ellos.

### 3.2 · Autorización de migración en Codespace (condicional)

Queda **autorizado encender el banco de pruebas en el entorno limpio de GitHub Codespace** con el protocolo confinado de `docs/ops/pendientes-bloqueados-codespace.md`:

1. `npm ci` en entorno Linux limpio (no se toca el entorno principal con Docker caído).
2. `npm run build`.
3. `npm run migration:run` → debe aplicar **6 migraciones pendientes**: `1737000000000` UXMultimedia → `1738000000000` Billboards → `1739000000000` Bunker → `1740000000000` Settlement → `1741000000000` G6TechSheets (seed 16) → `1742000000000` Escrow.
4. Verificación de boot: `synchronize:false` + `migrationsRun:true` exige que todas las migraciones sean exitosas o el boot falla (`app.module.ts:50-53`).

**Condición**: el go/no-go final lo declara el Comando (Jorge). Esta radiografía habilita la fase; no la ejecuta.

### 3.3 · Deuda técnica registrada para órdenes futuras (endurecimiento)

| # | Riesgo | Severidad | Mitigación sugerida |
|---|---|---|---|
| E1 | Disputa escrow sin SLA ni evidencia | CRÍTICO | Adjuntos, contradicción del vendedor, caducidad del reclamo, escalation timeout |
| E2 | Race sweep/claim | ALTO | `@Version` optimistic lock + transacción por retención |
| E3 | Ventana de reclamo post-vencimiento | ALTO | `claimableUntil` = holdUntil − ventana de gracia |
| E4 | Búnker: perfil no verificado toma tickets | ALTO | Exigir `verified` en quoteRequest o cuarentena hasta verificación |
| E5 | Multimedia `stream:*` solo por extensión | ALTO | Allowlist de hosts video + verificación de cabecera/MIME |
| E6 | G6 full-scan sin cache ni índices | ALTO | Cache + índice parcial + GIN + umbral de confianza |
| E7 | Ticket Búnker con doble asignación | MEDIO | Lock pesimista / estado transaccional |
| E8 | GET mutador (`pending-releases`) | MEDIO | Convertir a POST o job interno + elevación |
| E9 | Sin Dockerfile/.devcontainer real | MEDIO | Materializar el devcontainer de Codespace |
| E10 | Dos patrones de fondo sin índice | MEDIO | README del design-system distinguiendo "Vetas de Luz" vs "Código del Fuego" |

### 3.4 · Firma

- **Órdenes previas cubiertas**: portada Búnker · marketing fundadores · settlement USD/USDT · G6 tech-sheets · escrow logística · manual maestro v2.0 + blindaje jurídico · investigación normativa.
- **Invariantes respetados**: Payment_Vault §3.1 inalterable · comisiones 30/20/18 + $50/mes + $1/día intactas · escrow como máquina de estados · ninguna IA mueve dinero real.
- **Estado**: obra forjada y auditada. **Autorizado el encendido del banco de pruebas en Codespace según protocolo P1.**
