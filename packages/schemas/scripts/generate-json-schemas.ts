/**
 * Genera los JSON Schema derivados de los esquemas Zod (fuente de verdad única).
 * Uso: `pnpm --filter @gws/schemas generate`
 * Salida: `packages/schemas/schemas/*.schema.json`
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { zodToJsonSchema } from 'zod-to-json-schema';

import { curationCardSchema } from '../src/curation-card.js';
import { taxonomySchema } from '../src/taxonomy.js';

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'schemas');
mkdirSync(outDir, { recursive: true });

const targets = [
  { file: 'curation-card.schema.json', schema: curationCardSchema },
  { file: 'taxonomy.schema.json', schema: taxonomySchema },
] as const;

for (const { file, schema } of targets) {
  const json = zodToJsonSchema(schema, { name: undefined, target: 'jsonSchema7' });
  const outPath = join(outDir, file);
  writeFileSync(outPath, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
  process.stdout.write(`✔ generado ${outPath}\n`);
}
