import { IsIn, IsNumber, IsOptional, Matches, Max, Min } from 'class-validator';
import { FREIGHT_MODES, SUPPORTED_PRODUCT_TYPES } from '../customs.const';

/**
 * GWS · EstimateCustomsDto
 * ------------------------------------------------------------
 * Entrada del motor de cotización aduanera (Orden Suprema de integración).
 * Valores en USD; la conversión a moneda local/USDT la hace el frontend.
 */
export class EstimateCustomsDto {
  /** Tipo de producto; 'custom' exige hsCode explícito. */
  @IsIn([...SUPPORTED_PRODUCT_TYPES], { message: 'productType no soportado' })
  productType: string;

  /** Código HS de 6 dígitos (ej. '7013.99'); opcional si productType mapea. */
  @IsOptional()
  @Matches(/^\d{4}\.\d{2}$/, { message: 'hsCode debe ser XXNN.NN (6 dígitos)' })
  hsCode?: string;

  /** Valor de la mercadería (FOB), USD. */
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(100_000_000)
  customsValueUsd: number;

  /** Peso bruto, kg. */
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(100_000)
  weightKg: number;

  /** Volumen, m³ (opcional; usado para peso facturable aéreo y LCL). */
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  @Max(1000)
  volumeCbm?: number;

  /** Flete en USD (si ya se conoce; si no, se estima por banda). */
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100_000_000)
  freightCostUsd?: number;

  /** Modo de transporte: 'air' | 'ocean'. */
  @IsIn([...FREIGHT_MODES], { message: 'mode debe ser air u ocean' })
  mode: 'air' | 'ocean';

  /** País de origen (ISO 3166-1 alpha-2). */
  @Matches(/^[A-Z]{2}$/, { message: 'originCountry debe ser ISO 3166-1 alpha-2' })
  originCountry: string;

  /** País de destino del comprador (ISO 3166-1 alpha-2). */
  @Matches(/^[A-Z]{2}$/, { message: 'destinationCountry debe ser ISO 3166-1 alpha-2' })
  destinationCountry: string;
}
