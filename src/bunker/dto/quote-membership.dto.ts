import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import {
  SETTLEMENT_CURRENCIES,
  SETTLEMENT_PAYMENT_METHODS,
} from '../../settlement/settlement.const';

/**
 * GWS · Cotización de membresía pro del Búnker
 * ------------------------------------------------------------
 * Honorarios transparentes: USD 50/mes × plan, con fidelización por pago
 * anticipado (3m=10%, 6m=15%, 12m=20%). Doble estándar soberano: el usuario
 * elige con un clic si paga en USD (tarjeta) o USDT (TRC-20/Polygon) —
 * settlement 1:1. El cobro real es del Payment_Vault (§3.1).
 */
export class QuoteMembershipDto {
  @IsInt()
  @Min(1)
  @Max(12)
  planMonths: number;

  @IsOptional()
  @IsIn(SETTLEMENT_CURRENCIES, {
    message: `settlementCurrency debe ser uno de: ${SETTLEMENT_CURRENCIES.join(', ')}`,
  })
  settlementCurrency?: 'USD' | 'USDT';

  @IsOptional()
  @IsIn(SETTLEMENT_PAYMENT_METHODS, {
    message: `paymentMethod debe ser uno de: ${SETTLEMENT_PAYMENT_METHODS.join(', ')}`,
  })
  paymentMethod?: 'card_usd' | 'usdt_trc20' | 'usdt_polygon';
}
