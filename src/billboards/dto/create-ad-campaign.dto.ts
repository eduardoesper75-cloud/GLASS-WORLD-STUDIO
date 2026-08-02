import {
  IsString,
  IsInt,
  IsUUID,
  IsOptional,
  IsIn,
  MinLength,
  MaxLength,
  Min,
  Max,
  Matches,
} from 'class-validator';
import {
  SETTLEMENT_CURRENCIES,
  SETTLEMENT_PAYMENT_METHODS,
} from '../../settlement/settlement.const';
import { AD_MAX_DAYS, AD_MIN_DAYS } from '../billboards.const';

/**
 * GWS · Alta de campaña publicitaria
 * ------------------------------------------------------------
 * targetUrl es UNA RUTA INTERNA de GWS (soberanía §3.6): el clic de la
 * cartelera lleva al producto/catálogo/perfil DENTRO de la plataforma.
 * Se rechaza cualquier URL externa (http://, //, ://, www, mailto).
 *
 * Settlement: tarifa plana USD 1,00 o 1 USDT por día activo — el anunciante
 * elige la moneda con un clic (paridad 1:1). Cobro real = Payment_Vault.
 */
export class CreateAdCampaignDto {
  @IsUUID()
  billboardId: string;

  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title: string;

  @IsString()
  @MaxLength(500)
  @Matches(/^\/[^:\s]*$/, {
    message:
      'targetUrl debe ser una ruta interna de GWS que empieza con "/" ' +
      '(sin http://, sin ://, sin www, sin mailto) — soberanía §3.6',
  })
  targetUrl: string;

  /** Fecha de entrada al aire deseada (YYYY-MM-DD). */
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'startDate debe tener formato YYYY-MM-DD',
  })
  startDate: string;

  /** Días de publicidad activa (1..30), tarifa USD 1/día. */
  @IsInt()
  @Min(AD_MIN_DAYS)
  @Max(AD_MAX_DAYS)
  daysActive: number;

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
