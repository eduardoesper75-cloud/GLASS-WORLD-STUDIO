import { IsIn, IsString } from 'class-validator';
import { GALAXY_IDS } from '../galaxies.const';

/**
 * GWS · DTO — Solicitud de cupo de fundación
 * ------------------------------------------------------------
 * galaxy se valida contra GALAXY_IDS (whitelist dura en el DTO, no
 * en el service): un id desconocido no llega nunca a consultar DB.
 * El ValidationPipe global (whitelist + forbidNonWhitelisted) rechaza
 * cualquier campo extra.
 */
export class ClaimFoundingSlotDto {
  @IsString()
  @IsIn(GALAXY_IDS)
  galaxy: string;
}
