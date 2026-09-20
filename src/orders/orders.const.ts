/**
 * GWS · Orden — máquina de estados y constantes del checkout (P0)
 * ------------------------------------------------------------
 * ADR-003 (máquina de estados): los saltos válidos se validan en
 * OrdersService.transition, nunca en la BD — la columna es un enum
 * simple y el control finito vive en el service.
 *
 *   Order:     PENDING → CONFIRMED → SHIPPED → DELIVERED
 *                       ↘ CANCELLED (solo desde PENDING, sin pago capturado)
 *   Payment:   PENDING → CAPTURED | REFUNDED | FAILED
 *   Shipment:  PENDING → SHIPPED → DELIVERED
 *
 * Nota dentro de la plataforma (§3.6): las entregas y el pago real
 * van por Payment_Vault / escrow; aquí solo se registra el estado.
 */
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  CAPTURED = 'captured',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}

export enum ShipmentStatus {
  PENDING = 'pending',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
}

/** Métodos de pago soportados (mismos valores que el settlement de GWS). */
export const ORDER_PAYMENT_METHODS = ['card_usd', 'usdt_trc20', 'usdt_polygon'] as const;

/**
 * Transiciones válidas de Order. PENDING es el único estado del que se
 * puede CANCELLAR (no hay fondos capturados todavía). Si en el futuro se
 * cancela una order ya CONFIRMED/pagada, se requerirá refund del
 * Payment_Vault — se agrega aquí como transición explícita con esa nota.
 */
export const ORDER_ALLOWED_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.SHIPPED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};