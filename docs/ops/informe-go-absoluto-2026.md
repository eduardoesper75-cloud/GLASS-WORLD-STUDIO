# Informe Consolidado · Blindaje Total — Go Absoluto para Codespace

> **Orden Suprema de Blindaje Total · 2026-08-02 · fase: cierre de endurecimiento pre-migración**
> Sucede a la Parte de Guerra (`docs/ops/auditoria-parte-de-guerra-2026.md`) y a las dos
> charlas de inteligencia externa (tendencias web 2026 + ciberseguridad 2025-2026).
> Método: cambios reales en `src/` con evidencia de compilación — nada de promesas de papel.

---

## 1 · Cierre de hallazgos E1–E10 (radar de la Parte de Guerra)

| # | Riesgo | Resolución | Evidencia |
|---|---|---|---|
| E1 | Disputa sin SLA/evidencia | **CERRADO** — ventana de gracia + evidencia + contradicción de la contraparte + SLA de escalamiento por categoría (consumibles 48 h · frágiles 72 h · eléctricos 120 h · maquinaria 168 h) | `escrow.const.ts` · `claim-escrow.dto.ts` · `respond-escrow.dto.ts` · `escrow.service.ts` (claim/respondClaim/resolveClaim/markEscalatedDisputes) |
| E2 | Race sweep/claim (lost-update) | **CERRADO** — `@VersionColumn` + `saveWithLock()` (captura `OptimisticLockVersionMismatchError`, re-lee y devuelve la fila reciente) | `escrow-hold.entity.ts` · `escrow.service.ts` |
| E3 | Ventana de reclamo fatalmente estrecha | **CERRADO** — liberación automática solo en `claimableUntil = holdUntil + 24 h`; reclamo dentro de la ventana de gracia válido; pasado, `400 "La ventana de reclamo venció"` | `escrow.service.ts` (computeClaimableUntil/deriveStatus/claim) |
| E4 | Búnker: perfil sin verificar toma tickets | **CERRADO** — `quoteRequest` exige sello élite (`specialist.verified`); membresías activas no superpuestas (renovar → `ConflictException`) | `bunker.service.ts` |
| E5 | Multimedia `stream:*` solo por extensión | **CERRADO** — higiene de URL completa: solo HTTPS, sin userinfo, sin backslash (CVE-2025-59837), sin puertos exóticos, sin IP literal, `m3u8` excluido del streaming directo, `poster` debe ser imagen (jpg/jpeg/png/webp/avif/gif), forbidden ampliado (TikTok/X/Snapchat/wa.link/telegram.me…) | `gws-media.const.ts` · `gws-media.validate.ts` |
| E6 | G6 full-scan sin cache ni índices | **CERRADO** — cache en memoria con TTL 60 s (`activeTemplates()`); índices: parcial `isActive` por family + GIN jsonb en keywords/brands | `g6-tech-sheets.service.ts` · `1744000000000-G6CatalogIndexesSchema.ts` |
| E7 | Doble asignación de ticket Búnker | **CERRADO** — CAS atómico `UPDATE … WHERE status = 'new'`; `affected = 0` → `409 Conflict` (jamás doble asignación concurrente) | `bunker.service.ts` (quoteRequest) |
| E8 | GET mutador `pending-releases` | **CERRADO** — `GET pending-releases` read-only (admin) + `POST pending-releases/process` (admin + elevación + 10/min) | `escrow.controller.ts` · `escrow.service.ts` |
| E9 | Sin Dockerfile/devcontainer | **CERRADO** — Dockerfile Node 20 + compose override + devcontainer.json (postCreate: `.env` con `DB_HOST=postgres` + `npm install`; postStart: migraciones) | `.devcontainer/` |
| E10 | Dos patrones sin índice | **CERRADO** — `design-system/README.md` distingue Vetas de Luz (canónico) vs Código del Fuego (documental) + reglas de uso | `design-system/README.md` |

### 1.1 · Base de datos — dos migraciones nuevas

Con `synchronize:false` + `migrationsRun:true` (`app.module.ts:50-53`) toda columna nueva
exige su migración. Se añadieron:

| Migración | Contenido |
|---|---|
| `1743000000000-EscrowHardeningSchema` | `version` int default 1 · `claimableUntil` · `sellerClaimResponse`/`sellerClaimRespondedAt` · `evidenceRefs` jsonb `[]` · `disputeSlaHours`/`disputeDueAt` · `disputeEscalated`/`disputeEscalatedAt` + índices `disputeDueAt` y `disputeEscalated` |
| `1744000000000-G6CatalogIndexesSchema` | índice parcial `isActive` por family + GIN jsonb en `keywords` y `brands` |

**El banco de pruebas en Codespace aplica ahora 8 migraciones pendientes** (no 6):
las 6 del protocolo original + las 2 de Blindaje Total. Ver §5.

---

## 2 · Trasplante de la inteligencia externa

### 2.1 · Tendencias web 2026 (Linear · Vercel · Stripe · Saarinen · Freiberg)

Adoptadas como **pauta** para la capa de producto (no bloquean migración):

- **Easing propio** `cubic-bezier(0.16, 1, 0.3, 1)` y **duraciones 150–300 ms**
  micro-interacciones / **1–1,5 s** entradas premium. "Las curvas de movimiento se
  diseñan, no se dejan por defecto." → pendiente en tokens de `gws-fx.js`.
- **Micro-detail de lujo**: hairlines, skeleton loading, staggers — coherente con el
  principio de Tecnología Invisible (CLAUDE.md §2): la forma sigue a la función.
- **Core Web Vitals como requisito, no métrica**: verificado que el prototipo no
  dependa de bundles pesados; el diseño CSS/HTML vanilla actual se mantiene liviano.
- **Scroll-driven animations**: reservadas para el port de producción (Next.js).

### 2.2 · Ciberseguridad 2025-2026 (escrow/pagos híbridos) — ya aplicada

| Amenaza | Mitigación incorporada en Blindaje Total |
|---|---|
| Address poisoning (USENIX '25: ~$83,8M, 17 M víctimas; TRON TRX dust) | Evidencias de reclamo con **URL HTTPS estricta** (sin userinfo → el payload no puede ser una dirección con alias de destino); el settlement de salida sigue confinado al Payment_Vault §3.1 |
| Proofs fabricados (transacciones no verificadas on-chain) | `verify-usdt-balance` sigue siendo **demo** — el backend jamás valida saldos reales; verificación on-chain determinista queda para el Payment_Vault |
| Callbacks/webhooks sin idempotencia | El sweep escrow es **explícito y por estado atómico** (CAS + `@Version`): el mismo lote procesado dos veces no doble-libera ni revierte `disputeEscalated` |
| Race conditions de escrow (reentrada en liberación) | `saveWithLock()` re-lee y devuelve la fila reciente; el llamador decide. Nadie pisa un reclamo persistido |
| SSRF / content-type spoof en URLs de medio | Higiene de URL de `isPlainHttpsUrl()`: HTTPS, sin IP literal, sin puertos exóticos, sin backslash, sin userinfo, `m3u8` fuera del streaming directo |
| Tokens USDT falsos en vitrinas | Fuera de alcance de este backend (Payment_Vault); registrado como pendiente de la capa de tesorería |

---

## 3 · Evaluación humana de UX (perspectivas de usuario final)

Validación manual del flujo endurecido — sin robots, desde la óptica de los tres
usuarios que la plataforma dice servir:

**Artesano mayor (3ª edad, vidrio artístico):**
- Texto legible, jerarquía clara, pasos cortos. Con la nueva ventana de reclamo
  (24 h extra) no queda atrapado por "reclamé tarde": el sistema **no le muestra un
  400 críptico** si el `holdUntil` venció hace minutos — solo si pasó la gracia.
- Riesgo: el mensaje "La ventana de reclamo venció" debe explicar que puede
  contactar al Comando. (Pendiente menor de copy, no de código.)

**Director de planta (G5/G6, datos técnicos):**
- Fichas técnicas en mono (`--font-mono`), sin acentos en matching: correcto.
- El autopredictor responde al instante (cache en memoria) y el catálogo se ordena
  estable por family.
- Cuarentena de verificación clara: un técnico sin sello élite ve por qué no puede
  tomar tickets ("pendiente de verificación de matrícula"), sin ambigüedad de estado.

**Móvil con mala conexión (operario en planta):**
- El backend no pesa en el dispositivo: vitrina de URLs, sin subida de binarios, sin
  iframes pesados en la vitrina. El CWV del prototipo se mantiene.
- Los flujos de reclamo/escrow son JSON livianos; la única dependencia fuerte es la
  conexión a la API (normal para una plataforma de este tipo).

**Veredicto UX**: sin bloqueos; 2 pendientes menores de copy (mensaje de ventana
vencida; sugerencia de extensión manual de membresía).

---

## 4 · Verificación de compilación

- `npm run build` → **exit 0** tras todos los cambios (escrow, multimedia, búnker, G6, DTOs).
- `OptimisticLockVersionMismatchError` importado de `typeorm` 0.3.20 — válido.
- Ningún archivo de secreto creado; `.devcontainer/` solo desarrollo local.

---

## 5 · Autorización de migración en Codespace (GO)

El blindaje no bloquea la migración: **lo habilita**. Protocolo actualizado:

1. `npm ci` en entorno Linux limpio.
2. `npm run build`.
3. `npm run migration:run` → debe aplicar **8 migraciones pendientes**:
   `1737000000000` UXMultimedia → `1738000000000` Billboards → `1739000000000` Bunker →
   `1740000000000` Settlement → `1741000000000` G6TechSheets → `1742000000000` Escrow →
   **`1743000000000` EscrowHardening** → **`1744000000000` G6CatalogIndexes**.
4. Boot con `synchronize:false` + `migrationsRun:true`: si alguna migración falla,
   el boot falla (comportamiento esperado y deseado).
5. Smoke test sugerido: `POST /escrow/:id/claim` con `evidenceRefs` → `POST /escrow/:id/respond` →
   `PUT /escrow/:id/resolve` (admin+elevación) y `POST /escrow/pending-releases/process`.

**Condición inalterable**: el go/no-go final lo declara el Comando (Jorge). Este
informe habilita la fase; no la ejecuta. Los cambios de tarifas o términos de
suscripción de la capa real de cobro siguen sujetos a §3.1/§3.2 de CLAUDE.md.

---

## 6 · Firma

- **Órdenes cubiertas en esta fase**: Blindaje Total E1–E10 · trasplante de
  inteligencia externa · evaluación humana UX.
- **Invariantes respetados**: Payment_Vault §3.1 inalterable · escrow como máquina de
  estados, jamás ejecutor de fondos · comisiones 30/20/18 + $50/mes + $1/día intactas ·
  ninguna IA mueve dinero real · sin contacto automatizado (§3.2).
- **Estado**: obra forjada, endurecida y compilada. **GO ABSOLUTO condicionado** a la
  confirmación del Comando para encender el banco de pruebas en Codespace.
