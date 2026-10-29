import { checkTaxonomyIntegrity, createTaxonomyIndex } from '@gws/taxonomy';
import type { Pillar, PillarId, TaxonomyNode } from '@gws/schemas';

import { getMessage, type LanguageCode, type MessageKey } from '@/lib/i18n';
import {
  PRESENTATION_LANGUAGES,
  specialtyLabelOverlay,
  type SpecialtyLabels,
} from '@/lib/specialties';
import type {
  PillarView,
  SpecialtyView,
  TaxonomyNodeView,
  TaxonomyView,
} from '@/lib/taxonomy-contract';

const PILLAR_MESSAGE_KEYS = {
  'hot-kiln': 'pillarHotKiln',
  flame: 'pillarFlame',
  'cold-working': 'pillarColdWorking',
} satisfies Record<PillarId, MessageKey>;

function buildPillarLabels(pillar: Pillar): Record<LanguageCode, string> {
  const labels = {
    es: pillar.name.es,
    en: pillar.name.en,
  } as Record<LanguageCode, string>;

  for (const language of PRESENTATION_LANGUAGES) {
    labels[language] = getMessage(language, PILLAR_MESSAGE_KEYS[pillar.id]);
  }

  return labels;
}

function toNodeView(node: TaxonomyNode): TaxonomyNodeView {
  return {
    id: node.id,
    name: {
      es: node.name.es,
      en: node.name.en,
    },
    pillar: node.pillar,
    parentId: node.parentId,
    description: node.description,
    aliases: [...node.aliases],
    tags: [...node.tags],
  };
}

function buildSpecialties(nodes: readonly TaxonomyNode[]): SpecialtyView[] {
  const overlay: Record<string, SpecialtyLabels> = specialtyLabelOverlay;
  const canonicalIds = new Set(nodes.map((node) => node.id));
  const overlayIds = Object.keys(overlay);
  const missingIds = [...canonicalIds].filter((id) => !(id in overlay));
  const unexpectedIds = overlayIds.filter((id) => !canonicalIds.has(id));

  if (missingIds.length > 0 || unexpectedIds.length > 0) {
    throw new Error(
      `La capa de nombres no coincide con los IDs canónicos. Faltantes: ${
        missingIds.join(', ') || 'ninguno'
      }. Sobrantes: ${unexpectedIds.join(', ') || 'ninguno'}.`,
    );
  }

  return nodes.map((node) => {
    const labels = overlay[node.id];
    for (const language of PRESENTATION_LANGUAGES) {
      if (!labels[language]?.trim()) {
        throw new Error(`Falta la etiqueta "${language}" para el nodo canónico ${node.id}.`);
      }
    }

    return {
      id: node.id,
      pillar: node.pillar,
      name: {
        es: node.name.es,
        en: node.name.en,
        ...labels,
      },
    };
  });
}

function buildPillarView(
  index: ReturnType<typeof createTaxonomyIndex>,
  pillar: Pillar,
  labels: Record<LanguageCode, string>,
): PillarView {
  const nodes = index.byPillar.get(pillar.id) ?? [];

  return {
    id: pillar.id,
    name: {
      es: pillar.name.es,
      en: pillar.name.en,
    },
    labels,
    summary: {
      es: pillar.summary.es,
      en: pillar.summary.en,
    },
    tags: [...pillar.tags],
    nodeCount: nodes.length,
    highlights: index.roots(pillar.id).map(toNodeView),
  };
}

/**
 * Proyecta la taxonomía del motor en un modelo de presentación.
 * Debe importarse solo desde `taxonomy.ts`, que conserva la frontera
 * `server-only`, o desde la verificación server-side de build/CI.
 */
export function buildTaxonomyView(): TaxonomyView {
  const index = createTaxonomyIndex();
  const { taxonomy } = index;
  const integrityErrors = checkTaxonomyIntegrity(taxonomy);

  if (integrityErrors.length > 0) {
    throw new Error(`Taxonomía inválida: ${integrityErrors.join(' | ')}`);
  }

  const specialties = buildSpecialties(taxonomy.nodes);
  const pillars = taxonomy.pillars.map((pillar) =>
    buildPillarView(index, pillar, buildPillarLabels(pillar)),
  );

  return {
    version: taxonomy.version,
    pillarCount: pillars.length,
    totalNodes: taxonomy.nodes.length,
    pillars,
    specialties,
  };
}
