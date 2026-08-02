import { IsBoolean } from 'class-validator';

/**
 * GWS · G1 — Sello de confianza "verificado" del perfil de maestro.
 * Solo Jorge (admin + sesión elevada, ver controller) puede marcarlo.
 * verified NO es el rol MAESTRO: un maestro no verificado sigue siendo
 * visible y vendible; verified es el sello de identidad/obra.
 */
export class SetMasterVerificationDto {
  @IsBoolean()
  verified: boolean;
}
