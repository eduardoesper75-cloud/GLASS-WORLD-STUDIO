import { IsBoolean } from 'class-validator';

/**
 * GWS · G1 — Otorga/revoca el rol comercial MAESTRO sobre la CUENTA
 * vinculada a un perfil de maestro. granted=true habilita gestionar el
 * catálogo de autor (endpoints @Roles(MAESTRO)); granted=false revoca y
 * restaura SUBSCRIBER. Solo Jorge (admin + sesión elevada).
 */
export class SetMaestroRoleDto {
  @IsBoolean()
  granted: boolean;
}
