import { IsArray, IsString, MaxLength, MinLength, ArrayMaxSize } from 'class-validator';

/**
 * GWS · Reclamo del comprador sobre una retención escrow
 * ------------------------------------------------------------
 * Un reclamo explícito CONGELA la liberación automática (la retención pasa a
 * CLAIMED) y la resuelve admin + elevación ('manage_escrow_disputes'). El
 * motivo queda auditable y puede acompañarse de evidencias (URLs HTTPS de
 * imagen/video validadas por el allowlist soberano de multimedia).
 */
export class ClaimEscrowDto {
  @IsString()
  @MinLength(20, {
    message: 'Explicá el motivo del reclamo (mínimo 20 caracteres)',
  })
  @MaxLength(2000)
  reason: string;

  /** Evidencias: URL HTTPS de imagen/video (hasta 5), validadas en el service. */
  @IsArray()
  @ArrayMaxSize(5)
  evidenceRefs?: string[];
}
