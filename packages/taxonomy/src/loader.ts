import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  pillarsFileSchema,
  taxonomyNodeListSchema,
  taxonomySchema,
  type Pillar,
  type PillarId,
  type Taxonomy,
  type TaxonomyNode,
} from '@gws/schemas';

/**
 * Directorio de datos. Resuelve tanto en `src/` (tsx/tests) como en `dist/`
 * (build), porque en ambos casos el directorio padre es la raíz del paquete.
 */
const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');

/** Un archivo de nodos por pilar mantiene la taxonomía modular y revisable. */
const NODE_FILES = ['hot-kiln.json', 'flame.json', 'cold-working.json'] as const;

function readJson(file: string): unknown {
  return JSON.parse(readFileSync(join(DATA_DIR, file), 'utf8'));
}

let cached: Taxonomy | undefined;

/** Carga, valida y memoiza la taxonomía completa. */
export function loadTaxonomy(): Taxonomy {
  if (cached) {
    return cached;
  }
  const { version, pillars } = pillarsFileSchema.parse(readJson('pillars.json'));
  const nodes = NODE_FILES.flatMap((file) => taxonomyNodeListSchema.parse(readJson(file)));
  cached = taxonomySchema.parse({ version, pillars, nodes });
  return cached;
}

/** Reinicia la memoización (útil en tests que mutan los archivos de datos). */
export function resetTaxonomyCache(): void {
  cached = undefined;
}

/**
 * Verifica invariantes que el esquema por sí solo no cubre:
 * IDs únicos, referencias `parentId` válidas, coherencia de pilar y ciclos.
 */
export function checkTaxonomyIntegrity(taxonomy: Taxonomy): string[] {
  const errors: string[] = [];
  const byId = new Map<string, TaxonomyNode>();

  for (const node of taxonomy.nodes) {
    if (byId.has(node.id)) {
      errors.push(`ID duplicado: ${node.id}`);
    }
    byId.set(node.id, node);
  }

  const declaredPillars = new Set<PillarId>(taxonomy.pillars.map((p) => p.id));

  for (const node of taxonomy.nodes) {
    if (!declaredPillars.has(node.pillar)) {
      errors.push(`Pilar no declarado en el nodo ${node.id}: ${node.pillar}`);
    }
    if (node.parentId === null) {
      continue;
    }
    const parent = byId.get(node.parentId);
    if (!parent) {
      errors.push(`parentId inexistente en ${node.id}: ${node.parentId}`);
      continue;
    }
    if (parent.pillar !== node.pillar) {
      errors.push(`El nodo ${node.id} (${node.pillar}) no puede colgar de ${parent.id} (${parent.pillar})`);
    }
  }

  for (const node of taxonomy.nodes) {
    const seen = new Set<string>([node.id]);
    let current = node.parentId;
    while (current !== null) {
      if (seen.has(current)) {
        errors.push(`Ciclo detectado en la jerarquía de ${node.id}`);
        break;
      }
      seen.add(current);
      current = byId.get(current)?.parentId ?? null;
    }
  }

  return errors;
}

export interface TaxonomyIndex {
  readonly taxonomy: Taxonomy;
  readonly byId: ReadonlyMap<string, TaxonomyNode>;
  readonly byPillar: ReadonlyMap<PillarId, readonly TaxonomyNode[]>;
  childrenOf(parentId: string | null): TaxonomyNode[];
  roots(pillar?: PillarId): TaxonomyNode[];
  getPillar(id: PillarId): Pillar | undefined;
}

/** Construye índices en memoria para consultas O(1) sobre la taxonomía. */
export function createTaxonomyIndex(taxonomy: Taxonomy = loadTaxonomy()): TaxonomyIndex {
  const byId = new Map<string, TaxonomyNode>();
  const byPillar = new Map<PillarId, TaxonomyNode[]>();

  for (const node of taxonomy.nodes) {
    byId.set(node.id, node);
    const bucket = byPillar.get(node.pillar);
    if (bucket) {
      bucket.push(node);
    } else {
      byPillar.set(node.pillar, [node]);
    }
  }

  return {
    taxonomy,
    byId,
    byPillar,
    childrenOf(parentId) {
      return taxonomy.nodes.filter((node) => node.parentId === parentId);
    },
    roots(pillar) {
      return taxonomy.nodes.filter(
        (node) => node.parentId === null && (pillar === undefined || node.pillar === pillar),
      );
    },
    getPillar(id) {
      return taxonomy.pillars.find((pillar) => pillar.id === id);
    },
  };
}
