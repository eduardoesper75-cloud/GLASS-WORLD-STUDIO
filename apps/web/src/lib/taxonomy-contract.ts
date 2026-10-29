import type { LanguageCode } from '@/lib/i18n';

/**
 * DTO serializable de la taxonomía canónica. Este módulo no importa el motor,
 * `node:fs` ni `server-only`; puede ser consumido por componentes cliente.
 */
export interface TaxonomyNodeView {
  id: string;
  name: {
    es: string;
    en: string;
  };
  pillar: string;
  parentId: string | null;
  description: string;
  aliases: readonly string[];
  tags: readonly string[];
}

export interface PillarView {
  id: string;
  name: {
    es: string;
    en: string;
  };
  /** Etiquetas de presentación en los siete idiomas de la interfaz. */
  labels: Record<LanguageCode, string>;
  summary: {
    es: string;
    en: string;
  };
  tags: readonly string[];
  /** Número total de nodos del pilar. */
  nodeCount: number;
  /** Nodos raíz: las técnicas de entrada al pilar. */
  highlights: readonly TaxonomyNodeView[];
}

export interface SpecialtyView {
  id: string;
  pillar: string;
  /** Nombre canónico en es/en y etiquetas de presentación en los otros cinco idiomas. */
  name: Record<LanguageCode, string>;
}

export interface TaxonomyView {
  version: string;
  pillarCount: number;
  totalNodes: number;
  pillars: readonly PillarView[];
  specialties: readonly SpecialtyView[];
}

/**
 * Fallback lingüístico explícito para la UI: usa el idioma activo y, si por
 * alguna razón llegara vacío, cae a inglés y luego a español. La validación de
 * build exige los siete idiomas; este helper protege la renderización ante
 * datos incompletos inesperados.
 */
export function selectLocalizedLabel(
  labels: Partial<Record<LanguageCode, string>>,
  language: LanguageCode,
): string {
  return labels[language]?.trim() || labels.en?.trim() || labels.es?.trim() || '';
}
