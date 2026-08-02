import { IsIn, IsString } from 'class-validator';
import { GALAXY_IDS } from '../../foundation/galaxies.const';

/** Períodos de pago anticipado con descuento de fidelización. */
export const LOYALTY_PERIODS = [1, 3, 6, 12] as const;
export type LoyaltyPeriod = (typeof LOYALTY_PERIODS)[number];

/** Descuentos oficiales de fidelización (Orden Maestra §3): sobre el
 * total acumulado del período. Política comercial → cambiarla exige
 * 'change_subscription_pricing' (elevación), no editar a mano. */
export const LOYALTY_DISCOUNTS_PERCENT: Record<number, number> = {
  1: 0,
  3: 10,
  6: 15,
  12: 20,
};

/**
 * GWS · DTO — Cotización de plan por galaxia y período.
 * quote = precio mensual × meses × (1 − descuento). SOLO exhibición:
 * no abre ninguna transacción de pago (Payment_Vault lo hará, §3.1).
 */
export class QuoteSubscriptionDto {
  @IsString()
  @IsIn(GALAXY_IDS)
  galaxy: string;

  @IsIn([1, 3, 6, 12])
  months: number;
}
