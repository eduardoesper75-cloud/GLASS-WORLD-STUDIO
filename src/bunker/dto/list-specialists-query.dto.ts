import { IsOptional, IsString, Length, MaxLength, MinLength, IsIn } from 'class-validator';
import { BUNKER_SPECIALTIES } from '../bunker.const';

/** Filtros públicos del directorio de especialistas del Búnker. */
export class ListSpecialistsQueryDto {
  @IsOptional()
  @IsString()
  @Length(2, 2)
  countryCode?: string;

  @IsOptional()
  @IsString()
  @IsIn(BUNKER_SPECIALTIES as unknown as string[])
  specialty?: string;
}
