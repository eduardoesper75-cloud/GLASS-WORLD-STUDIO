# Arquitectura — Glass World Studio

## Visión

GWS es una plataforma de **infraestructura de datos, curaduría técnica y ecosistema B2B/C2C** para la industria global del vidrio artístico e industrial. Arquitectura **modular, agnóstica y cloud-native**: la interfaz orientada a comunidad/educación se apoya en un motor subyacente de gestión de activos, taxonomía técnica y base de conocimiento contextualizada.

## Capas

```text
┌─────────────────────────────────────────────────────────┐
│              1. CAPA DE PRESENTACIÓN / UI               │
│  • Web Client / Dashboard (Next.js / React)             │
│                    apps/web                             │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│          2. MOTOR DE CURADURÍA Y TAXONOMÍA              │
│  • Pilares: Hot-Kiln · Flame · Cold-Working             │
│  • Fichas de Curaduría (esquema canónico)               │
│              packages/taxonomy · packages/schemas       │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│            3. PIPELINE DE AUTOMATIZACIÓN                │
│  • Ingesta, formateo y sincronización                    │
│                      pipeline                           │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│             4. CAPA DE DATOS Y ALMACENAMIENTO           │
│  • Google Cloud / Drive & Docs REST API                  │
│  • Repositorio local / control de versiones             │
│                        data                             │
└─────────────────────────────────────────────────────────┘
```

## Principio rector

**Soberanía operativa y arquitectura limpia.** Separación estricta entre:

1. la **capa de datos** (Google Cloud / Drive),
2. los **agentes de automatización** (pipeline),
3. la **interfaz de usuario** (apps/web).

Las flechas del diagrama son la única dirección de dependencia permitida: la UI depende del motor y de los datos; el pipeline depende de los datos; **nadie depende de la UI**.

## Mapa del repositorio

| Ruta | Capa | Responsabilidad |
| --- | --- | --- |
| `apps/web` | 1 · Presentación | Cliente web / dashboard (Next.js). |
| `packages/schemas` | 2 · Motor | Esquemas y tipos canónicos (Zod + TS). Fuente de verdad. |
| `packages/taxonomy` | 2 · Motor | Taxonomía base de los 3 pilares + cargador tipado. |
| `pipeline` | 3 · Automatización | Ingesta, formateo, validación y sincronización. |
| `data/curated` | 4 · Datos | Fichas de Curaduría normalizadas (versionadas). |
| `data/raw` | 4 · Datos | Volcados de ingesta (no versionados). |
| `docs` | — | Arquitectura y taxonomía. |

## Grafo de dependencias

```text
apps/web ──┐
           ├─▶ packages/taxonomy ─▶ packages/schemas
pipeline ──┘            └────────────────────▶ packages/schemas
```

- `packages/schemas` no depende de nadie (solo `zod`).
- `packages/taxonomy` depende de `schemas`.
- `pipeline` depende de `schemas` y `taxonomy`.
- Ningún paquete del motor importa código de `apps/web`.

## Decisiones (ADR resumidos)

| # | Decisión | Motivo |
| --- | --- | --- |
| 1 | TypeScript end-to-end | Un solo esquema tipado compartido entre motor, pipeline y UI; cero duplicación. |
| 2 | Zod como fuente de verdad | Validación en runtime + tipos en compile-time + JSON Schema derivado. |
| 3 | Monorepo con pnpm workspaces | Paquetes pequeños, límites de capa explícitos, builds topológicos. |
| 4 | Taxonomía en JSON por pilar | Revisable, diffeable y modular; un archivo por pilar. |
| 5 | Fichas curadas versionadas, `raw/` ignorado | El resultado curado es el activo; lo crudo es efímero y pesado. |
| 6 | CSV/PLACEHOLDER: sin ORM aún | La capa 4 es externa (Google). No introducir persistencia propia hasta que se requiera. |

## Roadmap por capa

- **Motor:** versionado de fichas, relaciones entre fichas, búsqueda/facetado por taxonomía.
- **Pipeline:** `ingest:drive`, `sync:web`; reintentos e idempotencia.
- **Datos:** integración de service account, convención de carpetas en Drive.
- **UI:** rutas `/taxonomia`, `/ficha/[id]`, `/dashboard`; SSR de fichas publicadas.
