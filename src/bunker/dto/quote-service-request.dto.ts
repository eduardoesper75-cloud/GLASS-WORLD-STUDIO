import { IsNumber, Min } from 'class-validator';

/**
 * GWS · Cotización/asignación transparente de un ticket
 * ------------------------------------------------------------
 * El especialista fija los honorarios (feeUsd). Comisión del Búnker = 0%
 * (rectificación de la Orden). El cobro real es Payment_Vault (§3.1).
 */
export class QuoteServiceRequestDto {
  @IsNumber()
  @Min(0)
  feeUsd: number;
}
