import { IsBoolean } from 'class-validator';

/** Pausar/reanudar una cartelera (solo admin + elevación). */
export class ToggleBillboardDto {
  @IsBoolean()
  active: boolean;
}
