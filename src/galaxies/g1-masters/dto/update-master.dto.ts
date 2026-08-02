import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  Length,
  MinLength,
  IsArray,
  ArrayMaxSize,
  IsUrl,
  IsBoolean,
} from 'class-validator';
import { IsGwsMediaArray } from '../../../common/media/gws-media.validator';
import type { GwsMediaItem } from '../../../common/media/gws-media.const';

/** Todos los campos opcionales: PATCH permite actualizar solo lo enviado. */
export class UpdateMasterDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  headline?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  @Length(2, 2, { message: 'countryCode debe ser ISO 3166-1 alpha-2 (ej: AR)' })
  countryCode?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  yearsOfExperience?: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @IsString({ each: true })
  specialties?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsUrl({}, { each: true })
  galleryImageUrls?: string[];

  @IsOptional()
  @IsGwsMediaArray()
  media?: GwsMediaItem[];

  /** Soft-delete del perfil (no borra la cuenta). */
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
