/**
 * GWS · Suscripciones — Estados de una suscripción de usuario
 * ------------------------------------------------------------
 * active   : vigente, el guard la reconoce como membresía de acceso.
 * expired  : venció (paidThrough < now); el guard deja de reconocerla.
 * cancelled: anulada; no vuelve a ser activa sin una nueva transacción.
 *
 * El paso active↔expired es temporal y lo decide la fecha paidThrough,
 * no un job nocturno: el guard compara paidThrough > now en cada
 * request. Así la transición post-fundación es automática y sin
 * interrupciones de servidor (ver Orden Maestra §1).
 */
export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}
