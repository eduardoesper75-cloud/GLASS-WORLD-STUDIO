# Glass World Studio (GWS)

> Plataforma de infraestructura de datos, curaduría técnica y ecosistema B2B/C2C para la industria global del vidrio artístico e industrial.

Arquitectura **modular, agnóstica y cloud-native**: una capa de interfaz orientada a comunidad/educación sobre un motor de gestión de activos, taxonomía técnica y base de conocimiento contextualizada.

- **Arquitectura y capas:** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- **Taxonomía:** [`docs/TAXONOMY.md`](docs/TAXONOMY.md)
- **Contribución:** [`CONTRIBUTING.md`](CONTRIBUTING.md)

---

## Las 4 capas

```text
1. Presentación / UI          apps/web
2. Motor de Curaduría         packages/taxonomy · packages/schemas
3. Pipeline de Automatización pipeline
4. Datos y Almacenamiento     data/ · Google Cloud / Drive & Docs
```

## Estructura del repositorio

```text
.
├── apps/
│   └── web/                  # Next.js: cliente web / dashboard
├── packages/
│   ├── schemas/              # Esquemas y tipos canónicos (Zod + TS)
│   └── taxonomy/             # Taxonomía base de los 3 pilares + loader
├── pipeline/                 # Ingesta, formateo, validación y sync
├── data/
│   ├── curated/              # Fichas de Curaduría (versionadas)
│   └── raw/                  # Volcados de ingesta (no versionados)
├── docs/                     # Arquitectura y taxonomía
├── .env.example              # Variables de entorno de referencia
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## Requisitos

- **Node.js ≥ 20**
- **pnpm ≥ 9** (`corepack enable` lo habilita)
- **Git**

## Puesta en marcha

```bash
# 1. Habilitar pnpm (si no lo tienes)
corepack enable

# 2. Instalar dependencias de todo el monorepo
pnpm install

# 3. Configurar entorno
cp .env.example .env      # en Windows: Copy-Item .env.example .env

# 4. Compilar los paquetes del motor
pnpm build
```

## Comandos de la raíz

| Comando | Descripción |
| --- | --- |
| `pnpm build` | Compila todos los paquetes (orden topológico). |
| `pnpm build:engine` | Compila solo el motor (`@gws/schemas` + `@gws/taxonomy`). |
| `pnpm typecheck` | Verificación de tipos en todo el monorepo. |
| `pnpm clean` | Limpia artefactos de build. |
| `pnpm generate:schemas` | Deriva los JSON Schema desde Zod. |
| `pnpm validate:taxonomy` | Valida la taxonomía (esquema + integridad). |
| `pnpm validate:cards` | Valida las Fichas de Curaduría de `data/curated`. |
| `pnpm dev:web` | Arranca la capa de presentación. |
| `pnpm pipeline` | Ejecuta el pipeline (ver comandos disponibles). |

## La Ficha de Curaduría

Esquema estandarizado que **toda** unidad de contenido procesada debe respetar:

```jsonc
{
  "id": "gws-hk-0001",                 // ID único · prefijo por pilar (hk|fl|cw)
  "title": "…",                        // Título SEO/curatorial normalizado
  "category": "hot-kiln",              // Pilar técnico
  "subcategory": "hot-kiln-full-fuse", // Nodo de taxonomía (opcional)
  "resourcePath": "/recursos/gws-hk-0001", // Ruta interna del contenido en GWS
  "language": "es",
  "timestamps": [                      // Marcas temporales de procesos clave
    { "label": "…", "seconds": 480, "technique": "hot-kiln-full-fuse" }
  ],
  "metadata": {                        // Etiquetas, descripción, CTA
    "tags": ["full-fuse"],
    "description": "…",
    "cta": "…"
  },
  "status": "draft",                   // draft | review | published | archived
  "createdAt": "2026-01-15T10:00:00.000Z",
  "updatedAt": "2026-01-15T10:00:00.000Z"
}
```

Definición canónica: `packages/schemas/src/curation-card.ts`. Ejemplo real: `data/curated/gws-hk-0001.json`.

## Variables de entorno

Todas las claves se declaran y validan en `packages/schemas/src/env.ts` (vía Zod) y se documentan en `.env.example`:

- **Google Cloud / Drive & Docs REST API** — `GOOGLE_DRIVE_FOLDER_ID`, credenciales de service account.
- **Web** — `NEXT_PUBLIC_API_BASE_URL`.

`.env` está en `.gitignore`. **Nunca** versiones credenciales.

## Estado

Scaffold inicial (v0.1.0): esquemas, taxonomía y estructura de capas listos; sin lógica de negocio ni integraciones de API todavía. Ver el roadmap en `docs/ARCHITECTURE.md`.
