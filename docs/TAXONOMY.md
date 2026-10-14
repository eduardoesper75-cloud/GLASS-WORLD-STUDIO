# Taxonomía técnica

El núcleo conceptual de GWS clasifica las técnicas del vidrio en **tres pilares operativos**.

| Pilar | `id` | Prefijo de ID | Alcance |
| --- | --- | --- | --- |
| Trabajo en Horno | `hot-kiln` | `hk` | Vitrofusión, programación de horno, conformado, recocido. |
| Trabajo a la Llama | `flame` | `fl` | Soplete, control de llama, familias de vidrio. |
| Trabajo en Frío | `cold-working` | `cw` | Corte, desbaste, pulido, grabado, arenado, ensamblado. |

## Jerarquía base (v0.1.0)

```text
hot-kiln
├── hot-kiln-fusing            (Vitrofusión)
│   ├── hot-kiln-full-fuse
│   └── hot-kiln-tack-fuse
├── hot-kiln-slumping
├── hot-kiln-casting
├── hot-kiln-firing-schedules
└── hot-kiln-annealing

flame
└── flame-torchworking
    ├── flame-flame-control
    ├── flame-borosilicate
    └── flame-soda-lime

cold-working
├── cold-working-cutting
├── cold-working-grinding
├── cold-working-polishing
├── cold-working-engraving
├── cold-working-sandblasting
└── cold-working-assembly
```

La fuente de verdad vive en `packages/taxonomy/data/` (un archivo por pilar).

## Reglas

1. **`id` kebab-case, único y estable.** Nunca se renombra: las Fichas lo referencian. Para deprecar, se retira del árbol pero se conserva el registro histórico.
2. **Un nodo pertenece a un único pilar.** Un `parentId` debe ser del mismo pilar.
3. **Sin ciclos.** La jerarquía es un árbol (o bosque) por pilar.
4. **Bilingüe.** Todo nodo y pilar declaran `name.es` y `name.en`.
5. **`aliases`** captura sinónimos del dominio (p. ej. `pyrex`, `COE 104`) para búsqueda.

## Validación

```bash
pnpm validate:taxonomy
```

Comprueba esquema + integridad referencial. Ver `packages/taxonomy/README.md`.

## Relación con las Fichas de Curaduría

- `CurationCard.category` → pilar (obligatorio).
- `CurationCard.subcategory` → nodo de taxonomía (opcional).
- `CurationCard.timestamps[].technique` → nodo de taxonomía (opcional).

`pnpm validate:cards` verifica que toda referencia de taxonomía usada en una ficha exista.
