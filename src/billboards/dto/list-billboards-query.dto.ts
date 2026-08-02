import { IsIn, IsOptional } from 'class-validator';
import { BILLBOARD_GALAXIES } from '../billboards.const';

/** Filtro de consulta de carteleras/disponibilidad por galaxia. */
export class ListBillboardsQueryDto {
  @IsOptional()
  @IsIn(BILLBOARD_GALAXIES as unknown as string[])
  galaxy?: string;
}
