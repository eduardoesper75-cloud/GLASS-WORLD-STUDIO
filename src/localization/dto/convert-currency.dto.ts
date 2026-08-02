import { IsIn, IsNumber, IsString, Max, Min } from 'class-validator';
import { SUPPORTED_CURRENCIES, CurrencyCode } from '../currency.const';

/**
 * GWS · DTO — Conversión de moneda para exhibición
 * ------------------------------------------------------------
 * Validación estricta: amount numérico en [0, 1e9] y from/to dentro
 * de la whitelist de monedas soportadas. El ValidationPipe global
 * (whitelist + forbidNonWhitelisted) rechaza campos extra.
 *
 * Es SOLO visual: el backend no mueve ni guarda plata acá (la
 * liquidación real es de Payment_Vault — CLAUDE.md §3.1).
 */
export class ConvertCurrencyDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(1_000_000_000)
  amount: number;

  @IsString()
  @IsIn(SUPPORTED_CURRENCIES)
  from: CurrencyCode;

  @IsString()
  @IsIn(SUPPORTED_CURRENCIES)
  to: CurrencyCode;
}
