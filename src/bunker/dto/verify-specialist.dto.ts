import { IsBoolean } from 'class-validator';

/**
 * GWS · Verificación de especialista del Búnker (sello de cartera élite)
 * ------------------------------------------------------------
 * SOLO admin + elevación ('verify_bunker_specialist'): es una decisión de
 * confianza técnica — Jorge decide quién entra a la cartera verificada.
 */
export class VerifySpecialistDto {
  @IsBoolean()
  verified: boolean;
}
