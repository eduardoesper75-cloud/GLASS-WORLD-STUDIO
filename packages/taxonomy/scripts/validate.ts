/**
 * Valida la taxonomía base (Zod + integridad referencial).
 * Uso: `pnpm --filter @gws/taxonomy validate`
 * Salida con código 1 si hay cualquier error: apto para CI.
 */
import { checkTaxonomyIntegrity, loadTaxonomy } from '../src/index.js';

const taxonomy = loadTaxonomy();
const errors = checkTaxonomyIntegrity(taxonomy);

if (errors.length > 0) {
  process.stderr.write(`✖ Taxonomía inválida (${errors.length} error/es):\n`);
  for (const error of errors) {
    process.stderr.write(`  - ${error}\n`);
  }
  process.exit(1);
}

process.stdout.write(
  `✔ Taxonomía v${taxonomy.version} válida: ${taxonomy.pillars.length} pilares, ${taxonomy.nodes.length} nodos.\n`,
);
