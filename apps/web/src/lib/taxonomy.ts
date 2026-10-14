import 'server-only';

import { createTaxonomyIndex } from '@gws/taxonomy';
import type { LocalizedText, PillarId, TaxonomyNode } from '@gws/schemas';

/**
 * Vista de un pilar lista para renderizar. Desacopla la UI del modelo de datos
 * del motor: si la taxonomía cambia de forma, solo se ajusta este módulo.
 */
export interface PillarView {
  id: PillarId;
  name: LocalizedText;
  summary: LocalizedText;
  tags: readonly string[];
  /** Número total de nodos del pilar. */
  nodeCount: number;
  /** Nodos raíz: las técnicas de entrada al pilar. */
  highlights: readonly TaxonomyNode[];
}

export interface TaxonomyView {
  version: string;
  pillarCount: number;
  totalNodes: number;
  pillars: readonly PillarView[];
}

/**
 * Proyecta la taxonomía del motor en un modelo de presentación.
 * Se ejecuta en el servidor (build/prerender) y valida los datos de origen.
 */
export function getTaxonomyView(): TaxonomyView {
  const index = createTaxonomyIndex();
  const { taxonomy } = index;

  const pillars: PillarView[] = taxonomy.pillars.map((pillar) => {
    const nodes = index.byPillar.get(pillar.id) ?? [];
    return {
      id: pillar.id,
      name: pillar.name,
      summary: pillar.summary,
      tags: pillar.tags,
      nodeCount: nodes.length,
      highlights: index.roots(pillar.id),
    };
  });

  return {
    version: taxonomy.version,
    pillarCount: pillars.length,
    totalNodes: taxonomy.nodes.length,
    pillars,
  };
}
