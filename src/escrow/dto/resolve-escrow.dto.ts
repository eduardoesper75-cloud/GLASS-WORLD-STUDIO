import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * GWS · Resolución de un reclamo escrow (solo admin + elevación)
 * ------------------------------------------------------------
 * 'release' → los fondos retenidos se liberan al vendedor.
 * 'refund'  → los fondos se devuelven al comprador.
 * La decisión queda en el audit log (inmutable). El movimiento real de
 * fondos lo ejecuta el Payment_Vault (§3.1).
 */
export class ResolveEscrowDto {
  @IsIn(['release', 'refund'], {
    message: 'decision debe ser "release" o "refund"',
  })
  decision: 'release' | 'refund';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
