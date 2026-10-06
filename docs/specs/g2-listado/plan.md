# PLAN — G2 Listado de Productos

> **ESTADO: PENDIENTE DE APROBACIÓN DE JORGE.** Generado 2026-10-06 (PASO 5.3).
> Fuente: ORDEN MAESTRA #024, BLOQUE 5. Spec aprobado por Jorge (PASO 5.2 OK).
> Doctrina GWS v1 adherida. EPG-1 adherido. PNA v1 adherido.
> Regla: sin cita CF no se construye (R8 SDD). Sin CF aplicable → `[S]` + candidata.

## Premisa

`spec.md` (aprobado) define CA1–CA6. Este plan traduce cada decisión a
arquitectura, datos, endpoints y componentes, citando CF por decisión.

## Decisiones (cada una con CF o `[S]`)

| # | Decisión | Fuente |
|---|---|---|
| D1 | Productos en tabla PostgreSQL `products` (relacional, no JSON suelto) | **CF-52** — datos interconectados → base de datos relacional |
| D2 | Precio almacenado en `NUMERIC` y manejado con `decimal.js` en backend | Regla permanente de dinero #013/CF (repo). `[S]`: no se buscó CF-XXX específica de decimal — candidata |
| D3 | Endpoint `GET /api/g2/products` con query params opcionales (`category`, `brand`, `price_min`, `price_max`, `page`, `limit`) — uso correcto por defecto, defaults seguros (`limit=20`, `page=1`) | **CF-104** (fácil de usar correctamente, difícil de usar mal) + **CF-39** (diseñar API pensando en lo que cambiará sin romper clientes: params opcionales, respuesta con `items/total/page/pageSize`) |
| D4 | Paginación `LIMIT/OFFSET` con `ORDER BY id ASC` determinista | Investigación `gws.research.logic.10` (Spree: OFFSET duplica/filtra filas sin ORDER BY determinista, #2851; Saleor usa cursor) + `[S]` CF: no hay CF de paginación — candidata. Offset es suficiente para el alcance mínimo de Sprint 1 (#024 escala); cursor queda anotado como futuro |
| D5 | Índices en columnas de filtro (`category`, `brand`, `price`) | `[S]` — recomendación de escala de #024, sin CF-XXX. Candidata |
| D6 | Filtros en sidebar izquierdo (`<aside>`), grid a la derecha | Investigación `gws.research.design.6` (bigcommerce/cornerstone `faceted-search`) + **CF-10** (no diseñar la interfaz desde la propia intuición) |
| D7 | Estados de carga visibles + feedback inmediato al filtrar/paginar | **CF-169** (el usuario no espera: percepción de velocidad) |
| D8 | No cachear en Sprint 1; optimizar solo con medidas (Lighthouse CA5) | **CF-77** (optimizar solo sobre medidas) |
| D9 | Tests de comportamiento (≥8), un concepto por test, escritos para fallar | **CF-06**, **CF-240**, **CF-150** |
| D10 | Errores de API tipados (400 params inválidos, 404 recurso, 500 envuelto) — errores son datos | **CF-32**, **CF-162**, **CF-265** |
| D11 | Identidad cromática G2 (`#4A90E2`, fondo foto de mesa de taller) via design tokens existentes + `gws-vetas-de-luz` | Doctrina GWS v1 §3/§5 + skill `gws-vetas-de-luz`. Conflicto hex→escalar a Jorge |
| D12 | Llamada frontend → backend con el patrón ya existente `API_URL` (`apps/web/lib/api.ts`, default `http://localhost:3001`) | `[V]` verificado en `apps/web/lib/api.ts:15` — sin inventar config nueva |
| D13 | Accesibilidad: `aria-label` en tarjetas (nombre+precio), roles explícitos en grid | Investigación `gws.research.design.8/.9` (cornerstone PR #1875, woocommerce c17497e) |

## Arquitectura

```
POSTGRES (products)
   └─ src/g2-products/            [NestJS, backend-builder]
        ├─ g2-products.entity.ts
        ├─ dto/ (query + response)
        ├─ g2-products.service.ts   (filtros, paginación, count total)
        ├─ g2-products.controller.ts (GET /api/g2/products)
        └─ *.spec.ts                (≥8 tests)
              │ API_URL (lib/api.ts)
APPS/web/app/g2/                 [Next.js, frontend-builder]
   ├─ page.tsx                    (server component + fetch)
   └─ components/ (ProductCard, FiltersSidebar, Pagination, LoadingState)
```

## Modelos de datos

Tabla `products` (migración TypeORM):

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | orden estable de paginación (D4) |
| `name` | varchar | |
| `category` | varchar + índice (D5) | |
| `brand` | varchar + índice (D5) | |
| `price` | `NUMERIC(12,2)` (D2) | decimal.js en lógica de negocio |
| `image_url` | varchar nullable | `[S]` — no dictado; fotos G2 son de producto |
| `created_at` | timestamptz | |

Seed de prueba: coherente con el vidrio (crisoles, hornos, herramientas) — `[S]`
(sin fuente; contenido no dictado, marcar `[S]` en implementation).

## Endpoints

`GET /api/g2/products?category=&brand=&price_min=&price_max=&page=&limit=`

- 200: `{ items: Product[], total: number, page: number, pageSize: number }`
- 400: params inválidos (no numéricos, `limit>100`, `page<1`) → error tipado (D10)
- Validación con DTO + class-validator (patrón NestJS existente del repo).

## Componentes frontend (identidad G2)

| Componente | Responsabilidad | CF/Research |
|---|---|---|
| `app/g2/page.tsx` | fetch + orquestación | D12 |
| `FiltersSidebar` | categoría, precio (min/max), marca | D6 (CF-10) |
| `ProductCard` | nombre, precio (decimal formateado), marca | D13 a11y |
| `Pagination` | 20/pág., control prev/next + numerada | D4 (CF-169) |
| `LoadingState` | skeletons/feedback inmediato | D7 (CF-169) |
| Tokens | `bg #030712`, cards `#0a0f1e`, acento `#4A90E2` | D11 |

## Fases

- **Fase 0 — Backend:** migración `products` + seed + entity/DTO/service/controller.
- **Fase 1 — Tests backend:** ≥8 tests (filtros, rango precio, paginación, 400, límites).
- **Fase 2 — Frontend:** `/g2` con grid, identidad G2, estados de carga.
- **Fase 3 — Filtros + paginación:** wiring a endpoint, URL state.
- **Fase 4 — Verificación:** `npm test` (raíz ≥ backend), `cd apps/web && npm run build && npm run typecheck && npm test && npm run lint`, Lighthouse >90 en `/g2` (CA5), carga <3 s (CA6).

## Riesgos

| Riesgo | Mitigación |
|---|---|
| OFFSET con datos que cambian → filas duplicadas/faltantes | D4 ORDER BY determinista; anotar cursor para futuro |
| Sin índices, filtros lentos con datos crecientes | D5 índices; CF-77 medir antes de más |
| Hex `#4A90E2` vs hue 200° declarado (~212° real) | Nota en `DOCTRINA-GWS.md`; escalar a Jorge si hay conflicto con tokens |
| Lighthouse <90 por imágenes de fondo | `next/image`, `fetchpriority` en hero (research design.4: no `background-image` en LCP) |

## Notas PNA

- `[V]` CF citadas leídas de `CODIGO-DE-FUEGO.md` en esta sesión (CF-06, CF-10, CF-32, CF-39, CF-52, CF-77, CF-104, CF-150, CF-162, CF-169, CF-240, CF-265).
- `[V]` 30 hallazgos de investigación en memoria `gws.research.{arch,logic,design}` (10 c/u).
- `[S]` D2 (CF decimal), D4/D5 (CF paginación/índices) — candidatas a Código de Fuego.
- Fase de investigación de escala (arch) NO se aplica a Sprint 1 (alcance mínimo #024).

**PRÓXIMO PASO:** aprobación de Jorge → `tasks.md` (task-breaker).
