import {
  IsString,
  IsEnum,
  IsOptional,
  IsObject,
  IsIn,
  Min,
  IsBoolean,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MasterCatalogItemType, MASTER_CURRENCIES } from '../masters.enums';
import { IsGwsMediaArray } from '../../../common/media/gws-media.validator';
import type { GwsMediaItem } from '../../../common/media/gws-media.const';

/**
 * GWS · G1 — Alta de ítem en el catálogo de autor del maestro
 * ------------------------------------------------------------
 * Los detalles específicos del rubro viven en `details` (JSONB),
 * validados en el service según itemType (mismo patrón que
 * technicalSpecs en G2). Acá solo se valida lo común a todo ítem.
 */
export class CreateCatalogItemDto {
  @IsEnum(MasterCatalogItemType)
  itemType: MasterCatalogItemType;

  @IsString()
  @MinLength(3)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  /** Null = "a consultar" (común en líneas de autor con cotización a medida). */
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  price?: number;

  @IsOptional()
  @IsIn(MASTER_CURRENCIES)
  currency?: string;

  @IsOptional()
  @IsObject()
  details?: Record<string, unknown>;

  /** Multimedia de alto valor del ítem (masterclass en video). Allowlist
   * soberana de exhibición — jamás canales de contacto (§3.6). */
  @IsOptional()
  @IsGwsMediaArray()
  media?: GwsMediaItem[];

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
