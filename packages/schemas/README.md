# @gws/schemas

Fuente de verdad **tipada** de Glass World Studio. Define, en Zod + TypeScript:

| Módulo | Contenido |
| --- | --- |
| `pillars` | Los 3 pilares técnicos: `hot-kiln`, `flame`, `cold-working`. |
| `taxonomy` | Nodo de taxonomía, pilar y documento de taxonomía. |
| `curation-card` | Esquema estandarizado de la **Ficha de Curatoría** (`ID · Title · Category · Source_URL · Timestamps · Metadata`). |
| `env` | Validación tipada de variables de entorno (Google Drive, YouTube, web). |

## Uso

```ts
import { parseCurationCard, taxonomySchema, parseEnv } from '@gws/schemas';

const card = parseCurationCard(raw);      // lanza ZodError si es inválida
const env = parseEnv();                   // valida process.env
```

## JSON Schema

Los JSON Schema se **derivan** de Zod (no se editan a mano):

```bash
pnpm --filter @gws/schemas build
pnpm --filter @gws/schemas generate
# -> packages/schemas/schemas/curation-card.schema.json
# -> packages/schemas/schemas/taxonomy.schema.json
```

Regla: si cambias un esquema aquí, regenera; nunca edites los `.schema.json` directamente.
