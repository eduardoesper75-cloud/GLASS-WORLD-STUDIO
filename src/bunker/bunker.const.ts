/**
 * GWS · Búnker de Ingeniería Especializada y Servicio Técnico Global
 * ------------------------------------------------------------
 * Apartado soberano y transversal (mismo calibre que la Bóveda) que
 * conecta a dueños de plantas/talleres/fábricas con ingenieros
 * matriculados, mecánicos de precisión y especialistas en hornos,
 * templado, automatización y maquinaria pesada.
 *
 * MODELO FINANCIERO (RECTIFICACIÓN DE LA ORDEN):
 *   - CERO comisiones por intermediación en contratos cerrados por la red.
 *   - Membresía pro exclusiva para profesionales: USD 50/mes con
 *     fidelización 3m=10%, 6m=15%, 12m=20%.
 *   - El cobro real es del Payment_Vault (§3.1). Este módulo es display +
 *     estado (tickets, asignación, cotización transparente).
 *
 * GOBIERNO: la verificación de especialistas es decisión de confianza
 * técnica → SOLO admin + elevación ('verify_bunker_specialist').
 */

export const BUNKER_SPECIALTIES = [
  'hornos_industriales',
  'crisol',
  'templado',
  'vidrio_plano',
  'borosilicato',
  'automatizacion',
  'plc',
  'quemadores',
  'mecanica_precision',
  'maquinaria_pesada',
  'sistemas_termicos',
] as const;

export const BUNKER_MACHINE_TYPES = [
  'flat_glass',
  'borosilicate',
  'crucible_kiln',
  'cutting_table',
  'tempering',
  'annealing',
  'lehr',
  'other',
] as const;

export const BUNKER_URGENCIES = ['standard', 'urgent', 'critical'] as const;

/** Tipos de soporte ofertado por el especialista (alta/matriculación). */
export const BUNKER_SUPPORT_TYPES = [
  'remote_global',
  'regional_on_site',
  'plant_emergency',
] as const;

export enum BunkerRequestStatus {
  NEW = 'new',
  QUOTING = 'quoting',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CANCELLED = 'cancelled',
}

export enum BunkerMembershipStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

/** Membresía plana pro — USD 50/mes (rectificación de la Orden). */
export const BUNKER_MONTHLY_FEE_USD = 50;

/** CERO comisiones por intermediación en el Búnker. */
export const BUNKER_COMMISSION_PCT = 0;

/** Descuentos de fidelización por pago anticipado. */
export const BUNKER_FIDELITY_DISCOUNTS: Record<number, number> = {
  1: 0,
  3: 10,
  6: 15,
  12: 20,
};

export const BUNKER_PLAN_MONTHS = [1, 3, 6, 12] as const;
