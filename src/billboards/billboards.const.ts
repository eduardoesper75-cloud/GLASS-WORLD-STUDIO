/**
 * GWS · Carteleras publicitarias dinámicas — constantes y políticas
 * ------------------------------------------------------------
 * Orden Suprema (Carteleras de oferta y demanda): cada Galaxia (G1, G2,
 * G4, G5, G6) tiene carteleras holográficas donde anunciantes publicitan
 * excedentes, nuevos productos, hornos o servicios técnicos.
 *
 * REGLAS CONFIRMADAS:
 *   - Tarifa plana: USD 1,00 o 1 USDT por día de publicidad activa
 *     (settlement nativo, paridad 1:1 — Orden Soberanía Financiera).
 *   - El anunciante elige libremente cuántos días (1..30).
 *   - Un clic sobre la cartelera redirige DENTRO de la plataforma
 *     (targetUrl interno — soberanía §3.6, jamás externa).
 *   - Ocupación: una campaña por cartelera a la vez; si está ocupada,
 *     fila de espera ordenada + fecha exacta de entrada al aire.
 *
 * El cobro real es del Payment_Vault (§3.1). Este módulo es display +
 * estado de reserva; billingStatus "due/paid" es base de liquidación
 * futura, NO mueve dinero.
 */

export const BILLBOARD_GALAXIES = ['g1', 'g2', 'g4', 'g5', 'g6'] as const;
export type BillboardGalaxy = (typeof BILLBOARD_GALAXIES)[number];

export const AD_BASE_RATE_USD_PER_DAY = 1;
export const AD_MIN_DAYS = 1;
export const AD_MAX_DAYS = 30;
/** Horizonte del calendario de disponibilidad (días). */
export const AD_AVAILABILITY_HORIZON_DAYS = 60;

export enum AdCampaignStatus {
  /** En fila de espera: la fecha pedida está ocupada; se encola en orden. */
  QUEUED = 'queued',
  /** Reservada; entra a rotación en startDate. */
  SCHEDULED = 'scheduled',
  /** Al aire ahora mismo. */
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum AdBillingStatus {
  DUE = 'due',
  PAID = 'paid',
}

export const BILLBOARD_SEED = [
  { galaxy: 'g1', slotKey: 'main', label: 'Cartelera Íconos y Maestros' },
  { galaxy: 'g2', slotKey: 'main', label: 'Cartelera Marketplace' },
  { galaxy: 'g4', slotKey: 'main', label: 'Cartelera Boro y Envases' },
  { galaxy: 'g5', slotKey: 'main', label: 'Cartelera Gran Industria' },
  { galaxy: 'g6', slotKey: 'main', label: 'Cartelera Ingeniería y Oficio' },
] as const;
