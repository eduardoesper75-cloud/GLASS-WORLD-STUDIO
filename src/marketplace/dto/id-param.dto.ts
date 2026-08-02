import { IsUUID } from 'class-validator';

/** Validación de ids UUID en rutas — rechaza con 400 cualquier id que
 * no sea un UUID v4 antes de tocar la base de datos. */
export class IdParamDto {
  @IsUUID('4', { message: 'id debe ser un UUID v4 válido' })
  id: string;
}
