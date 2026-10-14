import { z } from 'zod';
import { pillarIdSchema, type PillarId } from './pillars.js';
import { ID_PATTERN } from './taxonomy.js';

// =====================================================================
// Ficha de Curaduría (Curation Card)
// ---------------------------------------------------------------------
// Esquema estandarizado que TODA unidad de contenido procesada por el
// pipeline debe respetar:
//   ID · Title · Category · Source_URL · Timestamps · Metadata
// =====================================================================

/** Prefijos cortos por pilar usados en el ID canónico (`gws-hk-0001`). */
export const PILLAR_ID_PREFIX = {
  'hot-kiln': 'hk',
  flame: 'fl',
  'cold-working': 'cw',
} as const satisfies Record<PillarId, string>;

/** ID canónico: `gws-<prefijo-pilar>-<4 dígitos>`. Ej.: `gws-hk-0001`. */
export const CURATION_CARD_ID_PATTERN = /^gws-(hk|fl|cw)-\d{4}$/;

export const curationStatusSchema = z.enum(['draft', 'review', 'published', 'archived']);

export const sourcePlatformSchema = z.enum([
  'youtube',
  'google-drive',
  'google-docs',
  'web',
]);

/** Marca temporal estructurada de un proceso clave dentro del recurso. */
export const timestampSchema = z.object({
  /** Etiqueta legible del hito. Ej.: "Meseta de fusión completa". */
  label: z.string().min(1).max(160),
  /** Segundo exacto dentro del recurso origen. */
  seconds: z.number().int().nonnegative(),
  /** Nodo de taxonomía asociado (opcional). */
  technique: z.string().regex(ID_PATTERN).optional(),
  notes: z.string().max(500).optional(),
});

/** Metadatos curatoriales: etiquetas, descripción contextualizada y CTA. */
export const curationMetadataSchema = z.object({
  tags: z.array(z.string().min(1)).min(1, 'se requiere al menos una etiqueta'),
  /** Descripción contextualizada (no es la descripción cruda del origen). */
  description: z.string().min(1).max(2000),
  /** Llamada a la acción orientada a conversión / formación. */
  cta: z.string().min(1).max(300),
});

export const curationCardSchema = z.object({
  id: z
    .string()
    .regex(CURATION_CARD_ID_PATTERN, 'ID inválido: se espera gws-<hk|fl|cw>-####'),
  /** Título SEO/curatorial normalizado. */
  title: z.string().min(3).max(200),
  /** Pilar técnico (Hot-Kiln, Flame, Cold-Working). */
  category: pillarIdSchema,
  /** Nodo de taxonomía más específico (opcional). */
  subcategory: z.string().regex(ID_PATTERN).optional(),
  /** Enlace canónico al recurso original. */
  sourceUrl: z.string().url(),
  sourcePlatform: sourcePlatformSchema,
  language: z.string().min(2).max(5).default('es'),
  timestamps: z.array(timestampSchema).default([]),
  metadata: curationMetadataSchema,
  status: curationStatusSchema.default('draft'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CurationStatus = z.infer<typeof curationStatusSchema>;
export type SourcePlatform = z.infer<typeof sourcePlatformSchema>;
export type CurationTimestamp = z.infer<typeof timestampSchema>;
export type CurationMetadata = z.infer<typeof curationMetadataSchema>;
export type CurationCard = z.infer<typeof curationCardSchema>;

/**
 * Valida un objeto desconocido y devuelve una Ficha tipada.
 * @throws {z.ZodError} si el objeto no cumple el esquema.
 */
export function parseCurationCard(input: unknown): CurationCard {
  return curationCardSchema.parse(input);
}

/** Variante segura que no lanza excepciones. */
export function safeParseCurationCard(input: unknown) {
  return curationCardSchema.safeParse(input);
}

/** Deriva el prefijo de pilar esperado en el ID a partir de la categoría. */
export function expectedIdPrefix(category: PillarId): string {
  return PILLAR_ID_PREFIX[category];
}

/** Comprueba que el ID declarado corresponda al pilar de la ficha. */
export function isIdConsistentWithCategory(card: Pick<CurationCard, 'id' | 'category'>): boolean {
  return card.id.startsWith(`gws-${PILLAR_ID_PREFIX[card.category]}-`);
}
