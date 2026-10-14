# @gws/taxonomy

Taxonomía técnica **base** de GWS y su cargador tipado. Es la capa sobre la que el motor de curaduría clasifica cada Ficha.

## Estructura de datos

```text
data/
├── pillars.json        # Metadatos de los 3 pilares (version, name es/en, summary)
├── hot-kiln.json       # Nodos del pilar Hot-Kiln
├── flame.json          # Nodos del pilar Flame
└── cold-working.json   # Nodos del pilar Cold-Working
```

Un nodo:

```jsonc
{
  "id": "hot-kiln-full-fuse",                 // kebab-case, único y global
  "name": { "es": "Full Fuse", "en": "Full Fuse" },
  "pillar": "hot-kiln",
  "parentId": "hot-kiln-fusing",              // null = raíz del pilar
  "description": "…",
  "aliases": ["full-fuse"],
  "tags": ["fusing", "full-fuse"]
}
```

## Uso

```ts
import { loadTaxonomy, createTaxonomyIndex } from '@gws/taxonomy';

const taxonomy = loadTaxonomy();               // valida contra @gws/schemas
const index = createTaxonomyIndex(taxonomy);

index.childrenOf('hot-kiln-fusing');           // -> [full-fuse, tack-fuse]
index.roots('cold-working');                   // -> nodos raíz del pilar
```

## Validación

```bash
pnpm --filter @gws/taxonomy validate
```

Comprueba el esquema Zod y la integridad referencial (IDs únicos, `parentId` existente, coherencia de pilar y ausencia de ciclos). Sale con código ≠ 0 si falla.

> La taxonomía es viva: añade nodos sin romper IDs existentes (los `id` son claves estables referenciadas por las Fichas).
