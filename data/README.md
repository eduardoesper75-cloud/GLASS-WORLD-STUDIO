# data

Capa de datos de GWS. Separa el material **crudo** del material **curado**.

```text
data/
├── raw/        # Descargas y volcados de ingesta (Drive, YouTube). NO se versiona.
└── curated/    # Fichas de Curaduría normalizadas (*.json). SÍ se versiona.
```

## Flujo

```text
Google Drive / Docs ─┐
YouTube Data API ────┼─▶ pipeline (ingesta) ─▶ data/raw ─▶ formateo ─▶ data/curated ─▶ UI / distribución
Datos manuales ──────┘
```

## Fichas curadas

Cada archivo de `data/curated/` es **una** Ficha de Curaduría conforme a `@gws/schemas`:

```bash
pnpm validate:cards   # valida esquema + coherencia con la taxonomía
```

El nombre de archivo recomendado es `<id>.json` (p. ej. `gws-hk-0001.json`).

> `data/raw/` está en `.gitignore` por su tamaño y naturaleza efímera. Solo se versiona el resultado curado.
