import { z } from 'zod';
import { pillarIdSchema } from './pillars.js';

// =====================================================================
// Taxonomía técnica de GWS
// ---------------------------------------------------------------------
// Modelo relacional plano: cada nodo apunta a su padre vía `parentId`
// (null = raíz). El pilar (`pillar`) determina la capa de presentación.
// =====================================================================

export const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const localizedTextSchema = z.object({
  es: z.string().min(1),
  en: z.string().min(1),
});

export const pillarSchema = z.object({
  id: pillarIdSchema,
  name: localizedTextSchema,
  summary: localizedTextSchema,
  tags: z.array(z.string().min(1)).default([]),
});

export const taxonomyNodeSchema = z.object({
  id: z.string().regex(ID_PATTERN, 'id debe ser kebab-case en minúsculas'),
  name: localizedTextSchema,
  pillar: pillarIdSchema,
  parentId: z.string().regex(ID_PATTERN).nullable().default(null),
  description: z.string().min(1),
  aliases: z.array(z.string().min(1)).default([]),
  tags: z.array(z.string().min(1)).default([]),
});

export const taxonomySchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  pillars: z.array(pillarSchema).min(1),
  nodes: z.array(taxonomyNodeSchema),
});

/** Archivo fuente por pilar: `packages/taxonomy/data/<pilar>.json`. */
export const taxonomyNodeListSchema = z.array(taxonomyNodeSchema);

export const pillarsFileSchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  pillars: z.array(pillarSchema).min(1),
});

export type LocalizedText = z.infer<typeof localizedTextSchema>;
export type Pillar = z.infer<typeof pillarSchema>;
export type TaxonomyNode = z.infer<typeof taxonomyNodeSchema>;
export type Taxonomy = z.infer<typeof taxonomySchema>;
