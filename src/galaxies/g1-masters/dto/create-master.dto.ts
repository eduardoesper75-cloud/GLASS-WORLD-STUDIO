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
} from 'class-validator';
import { IsGwsMediaArray } from '../../../common/media/gws-media.validator';
import type { GwsMediaItem } from '../../../common/media/gws-media.const';

/**
 * GWS · G1 — Alta de perfil de maestro/ícono
 * ------------------------------------------------------------
 * El perfil se cuelga de la cuenta autenticada (userId se toma del
 * token, NO del body — no se puede crear un maestro "en nombre de
 * otro"). Campos de identidad pública únicamente; el catálogo de
 * autor se gestiona aparte (MasterCatalogItem).
 */
export class CreateMasterDto {
  @IsString()
  @MinLength(3)
  headline: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsString()
  @Length(2, 2, { message: 'countryCode debe ser ISO 3166-1 alpha-2 (ej: AR)' })
  countryCode: string;

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

  /** Canal/demostraciones del maestro (sincronización con su YouTube).
   * Allowlist soberana — nunca canales de contacto (§3.6). */
  @IsOptional()
  @IsGwsMediaArray()
  media?: GwsMediaItem[];
}
