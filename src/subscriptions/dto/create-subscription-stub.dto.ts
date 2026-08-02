import { IsDateString, IsIn, IsString } from 'class-validator';
import { GALAXY_IDS } from '../../foundation/galaxies.const';

/**
 * GWS · DTO — Crear registro de suscripción (STUB, sin pago)
 * ------------------------------------------------------------
 * SOLO para desarrollo/testing del GalaxyAccessGuard. En producción
 * esta fila la crea el Payment_Vault al confirmar el cobro — este
 * endpoint no existe en producción y no toca ningún dato financiero.
 * Exige rol ADMIN (JwtAuthGuard + RolesGuard). No mueve plata.
 */
export class CreateSubscriptionStubDto {
  @IsString()
  @IsIn(GALAXY_IDS)
  galaxy: string;

  @IsIn([1, 3, 6, 12])
  months: number;

  /** Hasta cuándo la membresía es válida (ISO 8601). */
  @IsDateString()
  paidThrough: string;
}
