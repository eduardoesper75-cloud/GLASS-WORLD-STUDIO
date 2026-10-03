import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * GWS · Respuesta de la contraparte (vendedor) frente a un reclamo
 * ------------------------------------------------------------
 * Endurecimiento E1: el vendedor puede responder el reclamo del comprador con
 * su versión de los hechos (20–2000 caracteres). La respuesta queda auditable
 * y le da contexto real al Comando antes de resolver la disputa. No cambia el
 * estado: la retención sigue CLAIMED hasta resolución admin + elevación.
 */
export class RespondEscrowDto {
  @ApiProperty({ description: 'Versión del vendedor sobre los hechos (auditable)', minLength: 20, maxLength: 2000 })
  @IsString()
  @MinLength(20, {
    message: 'Explicá tu versión de los hechos (mínimo 20 caracteres)',
  })
  @MaxLength(2000)
  response: string;
}
