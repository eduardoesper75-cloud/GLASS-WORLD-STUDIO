import { z } from 'zod';

// =====================================================================
// Pilares técnicos (raíz de la taxonomía)
// =====================================================================

export const PILLAR_IDS = ['hot-kiln', 'flame', 'cold-working'] as const;

export const pillarIdSchema = z.enum(PILLAR_IDS);

export type PillarId = z.infer<typeof pillarIdSchema>;

export const PILLAR_LABELS: Record<PillarId, { es: string; en: string }> = {
  'hot-kiln': { es: 'Trabajo en Horno', en: 'Hot-Kiln' },
  flame: { es: 'Trabajo a la Llama', en: 'Flame / Torchworking' },
  'cold-working': { es: 'Trabajo en Frío', en: 'Cold-Working' },
};

export function isPillarId(value: unknown): value is PillarId {
  return pillarIdSchema.safeParse(value).success;
}
