import { readdirSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';

import { curationCardSchema, isIdConsistentWithCategory } from '@gws/schemas';
import { createTaxonomyIndex } from '@gws/taxonomy';

export interface CardValidationReport {
  directory: string;
  filesChecked: number;
  errors: string[];
}

/**
 * Valida todas las Fichas de Curaduría (`*.json`) de un directorio contra el
 * esquema canónico (`@gws/schemas`) y la taxonomía vigente (`@gws/taxonomy`).
 *
 * Comprueba: forma del esquema, coherencia ID/pilar y existencia en taxonomía
 * de `subcategory` y de cada `timestamps[].technique`.
 */
export function validateCuratedCards(directory: string): CardValidationReport {
  const errors: string[] = [];
  const index = createTaxonomyIndex();

  const files = readdirSync(directory)
    .filter((name) => extname(name).toLowerCase() === '.json')
    .sort();

  for (const file of files) {
    const raw = JSON.parse(readFileSync(join(directory, file), 'utf8')) as unknown;
    const result = curationCardSchema.safeParse(raw);

    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push(`${file}: ${issue.path.join('.') || '(root)'} -> ${issue.message}`);
      }
      continue;
    }

    const card = result.data;

    if (!isIdConsistentWithCategory(card)) {
      errors.push(`${file}: el ID "${card.id}" no corresponde a la categoría "${card.category}".`);
    }

    if (card.subcategory && !index.byId.has(card.subcategory)) {
      errors.push(`${file}: subcategoría "${card.subcategory}" no existe en la taxonomía.`);
    }

    for (const [i, timestamp] of card.timestamps.entries()) {
      if (timestamp.technique && !index.byId.has(timestamp.technique)) {
        errors.push(
          `${file}: timestamps[${i}].technique "${timestamp.technique}" no existe en la taxonomía.`,
        );
      }
    }
  }

  return { directory, filesChecked: files.length, errors };
}
