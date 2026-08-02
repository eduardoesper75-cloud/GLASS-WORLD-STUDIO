import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import {
  ESCROW_CATEGORIES,
  ESCROW_MAX_AMOUNT,
  ESCROW_MIN_AMOUNT,
  ESCROW_SETTLEMENT_CURRENCIES,
  EscrowCategory,
} from '../escrow.const';
import { SETTLEMENT_PAYMENT_METHODS } from '../../settlement/settlement.const';

/**
 * GWS · Apertura de retención escrow (Escrow Inteligente)
 * ------------------------------------------------------------
 * El comprador retiene el pago (USD/USDT) al momento de la orden. La
 * categoría define las horas de liberación automática (24h/72h/7d/10d) y el
 * protocolo de embalaje certificado exigido al vendedor. El movimiento real
 * de fondos es del Payment_Vault (§3.1).
 */
export class CreateEscrowHoldDto {
  @IsUUID()
  sellerId: string;

  /** Referencia interna de la orden dentro de GWS (§3.6). */
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  orderRef: string;

  @IsIn(ESCROW_CATEGORIES, {
    message: `category debe ser uno de: ${ESCROW_CATEGORIES.join(', ')}`,
  })
  category: EscrowCategory;

  @IsNumber()
  @Min(ESCROW_MIN_AMOUNT)
  @Max(ESCROW_MAX_AMOUNT)
  amount: number;

  @IsOptional()
  @IsIn(ESCROW_SETTLEMENT_CURRENCIES, {
    message: `settlementCurrency debe ser uno de: ${ESCROW_SETTLEMENT_CURRENCIES.join(', ')}`,
  })
  settlementCurrency?: 'USD' | 'USDT';

  @IsOptional()
  @IsIn(SETTLEMENT_PAYMENT_METHODS, {
    message: `paymentMethod debe ser uno de: ${SETTLEMENT_PAYMENT_METHODS.join(', ')}`,
  })
  paymentMethod?: 'card_usd' | 'usdt_trc20' | 'usdt_polygon';
}
