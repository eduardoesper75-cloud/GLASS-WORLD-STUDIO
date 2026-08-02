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

/** PATCH del ítem de catálogo — todos los campos opcionales. */
export class UpdateCatalogItemDto {
  @IsOptional()
  @IsEnum(MasterCatalogItemType)
  itemType?: MasterCatalogItemType;

  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

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

  @IsOptional()
  @IsGwsMediaArray()
  media?: GwsMediaItem[];

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
