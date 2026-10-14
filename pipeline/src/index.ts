import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateCuratedCards } from './validate-cards.js';

/**
 * Raíz del repositorio. Resuelve tanto en `src/` (tsx) como en `dist/` (build):
 * en ambos casos `../..` desde el archivo actual es la raíz del monorepo.
 */
const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const CURATED_DIR = join(REPO_ROOT, 'data', 'curated');

const USAGE = `GWS Pipeline — automatización de datos y curaduría

Uso: pipeline <comando>

Comandos:
  validate-cards   Valida las Fichas de Curaduría de data/curated contra el esquema y la taxonomía.

Pendiente (roadmap de la capa 3):
  ingest:drive     Ingesta desde Google Drive / Docs REST API.
  ingest:youtube   Ingesta de metadatos/capítulos desde YouTube Data API v3.
  sync:web         Sincronización de fichas publicadas hacia la capa de presentación.
`;

function runValidateCards(): number {
  const report = validateCuratedCards(CURATED_DIR);

  if (report.errors.length > 0) {
    process.stderr.write(`✖ ${report.errors.length} error(es) en ${report.filesChecked} ficha(s):\n`);
    for (const error of report.errors) {
      process.stderr.write(`  - ${error}\n`);
    }
    return 1;
  }

  process.stdout.write(`✔ ${report.filesChecked} ficha(s) válida(s) en ${report.directory}.\n`);
  return 0;
}

function main(argv: readonly string[]): number {
  const [command] = argv;

  switch (command) {
    case 'validate-cards':
      return runValidateCards();
    case undefined:
      process.stdout.write(USAGE);
      return 0;
    default:
      process.stderr.write(`Comando desconocido: ${command}\n\n${USAGE}`);
      return 1;
  }
}

process.exitCode = main(process.argv.slice(2));
