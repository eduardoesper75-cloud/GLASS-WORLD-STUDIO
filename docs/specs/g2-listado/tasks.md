# TASKS — G2 Listado de Productos

> **ESTADO: PENDIENTE DE APROBACIÓN DE JORGE.** Generado 2026-10-06 (PASO 5.4).
> Pre: `spec.md` aprobado (5.2) + `plan.md` aprobado.
> Orden lineal (R9 SDD). Cada task: precondición → acción → verificación.
> Sin precondición o verificación, la task no existe (DREAM-TEAM task-breaker).

## Fase 0 — Backend

### T1 — Migración y entity `products`
- **Pre:** `plan.md` aprobado; conexión a Postgres OK (dev local).
- **Act:** crear entity `Product` (`src/g2-products/`) + migración con columnas de `plan.md` (D1, D2, D5) + índices en `category`, `brand`, `price`.
- **Ver:** `npm run migration:run` aplica sin error; `npm run migration:show` la lista.

### T2 — Seed de prueba
- **Pre:** T1 aplicada.
- **Act:** seed de ≥40 productos coherentes con el vidrio (crisoles, hornos, herramientas, marcos), distribuidos en ≥4 categorías y ≥5 marcas. Contenido `[S]` (no dictado).
- **Ver:** query manual `SELECT count(*) FROM products` ≥ 40.

### T3 — DTOs y service de listado
- **Pre:** T2.
- **Act:** `ListProductsQueryDto` (category?, brand?, price_min?, price_max?, page=1, limit=20 con `@Max(100)`) + `G2ProductsService.list()` con filtros opcionales, `ORDER BY id ASC`, `LIMIT/OFFSET`, `COUNT(*)` total (D3, D4). Precios con `decimal.js` (D2).
- **Ver:** unit tests del service pasan (filtros solos y combinados, rango de precio, límites de página).

### T4 — Controller `GET /api/g2/products`
- **Pre:** T3.
- **Act:** controller con validación (400 en params inválidos), respuesta `{items,total,page,pageSize}` (D3, D10).
- **Ver:** tests e2e del endpoint: 200 happy path, 400 inválidos, paginación pág.1/pág.2 sin solape.

### T5 — Tests backend ≥8
- **Pre:** T4.
- **Act:** consolidar suite: filtros por categoría, por marca, rango precio, combinados, paginación (límite 20), página vacía, 400 `limit>100`, 400 `page<1` (D9: un concepto por test, CF-240).
- **Ver:** `npm test` (raíz) verde con ≥8 tests nuevos; ningún test existente roto.

## Fase 1 — Frontend

### T6 — Página `/g2` con identidad G2
- **Pre:** T5; T4 corriendo en :3001.
- **Act:** `apps/web/app/g2/page.tsx` + grid de tarjetas; tokens G2 (`#4A90E2`, `bg-base #030712`, cards `#0a0f1e`) siguiendo `design-system/` y `gws-vetas-de-luz` (D11); fetch vía `API_URL` existente (D12).
- **Ver:** `npm run build` en `apps/web` pasa; la página renderiza 20 productos.

### T7 — Sidebar de filtros
- **Pre:** T6.
- **Act:** `FiltersSidebar` con categoría (select), precio (min/max), marca; `<aside>` + grid (D6); estado en URL search params.
- **Ver:** filtrar cambia el listado sin recarga completa; URL refleja el filtro.

### T8 — Paginación y estados de carga
- **Pre:** T7.
- **Act:** `Pagination` (20/pág., prev/next) + `LoadingState` con feedback inmediato (D7); `aria-label` en tarjetas nombre+precio y roles de grid (D13).
- **Ver:** paginar 1→2 sin duplicados ni huecos; skeleton visible durante fetch; `npm run lint` limpio.

### T9 — Tests frontend
- **Pre:** T8.
- **Act:** tests unitarios de componentes (render de filtros, cambio de página, a11y de tarjeta) bajo `apps/web/**/__tests__/`.
- **Ver:** `npm test` en `apps/web` verde.

## Fase 2 — Verificación final

### T10 — Batería completa
- **Pre:** T9.
- **Act:** correr en orden: `npm test` (raíz), `cd apps/web && npm run build && npm run typecheck && npm test && npm run lint`.
- **Ver:** todo verde; registrar salida real (PNA `[V]`).

### T11 — Lighthouse y carga (CA5/CA6)
- **Pre:** T10.
- **Act:** Lighthouse en `/g2` (producción local).
- **Ver:** Score >90 y carga <3 s. Si falla → PC2 (parar, reportar a Jorge), no maquillar.

### T12 — Documentación
- **Pre:** T11.
- **Act:** `docs/specs/g2-listado/README.md` con estado del sprint; entradas de memoria `[V]/[I]/[S]`.
- **Ver:** README existe y refleja estado real.

## Reglas transversales

- Commit manual solo con OK de Jorge (5.9 / reglas permanentes). Nada se pushea.
- Builders consultan `gws.research.*` antes de implementar; sin hallazgo → `[S] "sin referencia"`.
- 3 tasks fallidas seguidas → PARAR sprint (PC2), EPG-1 PASO 7, reportar.
