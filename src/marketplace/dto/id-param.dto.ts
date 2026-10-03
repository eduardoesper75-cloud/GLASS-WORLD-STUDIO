import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/** Validación de ids UUID en rutas — rechaza con 400 cualquier id que
 * no sea un UUID v4 antes de tocar la base de datos. */
export class IdParamDto {
  @ApiProperty({ example: 'a1b2c3d4-0000-4000-8000-000000000000', description: 'UUID v4 del recurso' })
  @IsUUID('4', { message: 'id debe ser un UUID v4 válido' })
  id: string;
}
