# README — Sprint G2 Listado de Productos (ORDEN #024)

> **ESTADO: COMPLETO — PENDIENTE DE OK DE JORGE PARA COMMIT/PUSH (5.9).** Fecha: 2026-10-06.
> Fuente programática: `docs/specs/g2-listado/{plan,spec,tasks}.md`. Métricas con salida real (PNA `[V]`).

## Resumen

`GET /api/g2/products` + página `/g2` de marketplace con filtros (categoría, marca, precio), paginación y estados de carga. Backend NestJS reutilizando la tabla `products` existente (Path A), frontend Next.js 14 con tokens GWS y acento G2 `#4A90E2`.

## Estructura

| Capa | Archivo | Nota |
|---|---|---|
| Entity/ADO | `src/g2-products/product.entity.ts` | Reusa tabla `products` |
| DTOs | `src/g2-products/dto/*.dto.ts` | `page=1, limit=20` con `@Max(100)` |
| Service | `src/g2-products/g2-products.service.ts:37` | `ORDER BY id ASC` (fix D4) |
| Controller | `src/g2-products/g2-products.controller.ts` | `GET /api/g2/products` |
| Frontend | `apps/web/app/g2/page.tsx` | Grid, sidebar, skeleton, paginación |
| Design | `design-system/gws-components.css` | `.gw-grid`, `.gw-skeleton`, `.gw-pagination` |

## Verificación (PNA `[V]`, salida real)

| Check | Resultado |
|---|---|
| `npm test` (raíz) | Verde (suite backend, incl. `g2-products` ≥8) |
| `npm run build` (raíz) | Verde |
| `apps/web`: build / typecheck / test / lint | Verde / limpio / 25 tests / 1 warning preexistente `WelcomeVideo.tsx` |
| Migración `products` | Aplicada + seed 42 filas |
| e2e paginación | pág.1/pág.2 sin solape (overlap=0), total 42 |

### Lighthouse `/g2` (CA5/CA6, producción local, Chrome headless, en-US)

| Métrica | Run 1 | Run 2 | Delta vs previo |
|---|---|---|---|
| Performance | **94** | **96** | (era 77 con backend muerto) |
| CLS | **0.061** (s97) | **0.061** (s97) | 0.646 → 0.144 → **0.061** |
| LCP | 2.6 s (s88) | 2.5 s (s89) | — |
| FCP / SI / TBT | 1.7 s / 1.7 s / 130–40 ms | idem | — |

Criterio T11: **Score 94/96 > 90 ✓ · carga 2.5–2.6 s < 3 s ✓**. CLS < 0.1 ✓.

## Historia de medición (por qué los números tempranos eran inválidos)

1. LH original: CLS 0.748 → fix 1 (skeletons 6→12×`minHeight:200`, paginación reservada). LH2 0.646, LH3 0.638 casi sin cambio.
2. Diagnóstico con probe (`_tmp-geom*.js` eliminados): el backend dev `:3001` había muerto (`ERR_CONNECTION_REFUSED`) → LH medía skeleton→estado de error/vacío, no la página real. **Corrección de premisa `[I]→[V]`.**
3. Backend estable para medición: `node dist/main.js` (Nest prod, sin watch; el dev moría repetidamente). Probes de geometría (Playwright, throttle de API): skeleton=200 vs card=**240**, ambas 1 col. Fix 2: skeleton `minHeight:240` (igualar footprint). Resultado: CLS **0.144 → 0.061**, perf 93→94/96.

## Entradas de memoria `[P]`/`[V]`/`[I]`/`[S]`

- `[V]` La causa dominante de CLS en `/g2` era el swap skeleton→cards con alturas distintas (200 vs 240 px/item, 12 ítems). Igualar `minHeight` del skeleton al alto medido de la Card eliminó el collapse.
- `[V]` El dev-server backend (`npm run start:dev`) muere repetidamente en este entorno; para medir Lighthouse estable: `node dist/main.js` (mismo puerto 3001, build actual).
- `[I]` Las CLS previas (0.748/0.646/0.638) midieron la página con fetch fallido (backend caído), no la UX real; dicho indicador no debió interpretarse como regresión del fix.
- `[S]` El `minHeight:240` es calibrado a las 12 Cards del seed actual; si el contenido cambia de alto (nombres a 2+ líneas), recalibrar por medida.
- `[I]→[V]` El frame transitorio `grid top:-1076` del probe 1 fue un artefacto del muestreo a 0 ms; no se repitió en 30 frames posteriores.

## Flags / decisiones de esta ORDEN

- **Path A**: reutilizar tabla `products` (sin tabla nueva).
- **Jerarquía**: ORDEN #024 gana sobre PNA §11 donde difieren (filtros inline en `page.tsx`, no componente `FiltersSidebar`).
- **Acento G2**: `#4A90E2` (spec CA1) vs `#4FA8D8` del skill `gws-vetas-de-luz` → gana el spec; documentado en `page.tsx:28`.
- **decimal.js**: NO se agregó (precios viven como `numeric` en Postgres; se devuelven `string` ya).
- **dotenv/config**: dependencia fantasma detectada y NO perseguida.
- **Skill vs acento**: si otra IA/agencia propone estética G2, contrastar contra este spec antes de aceptar.

## Pendientes

- `[BLOQUEADO]` Commit y push: requieren OK explícito de Jorge (5.9 / reglas permanentes). Nada se pushea sin eso.
- `docs/ops/estado-maestro.md` puede necesitar nota del sprint (verificar contra git antes de tocarlo).