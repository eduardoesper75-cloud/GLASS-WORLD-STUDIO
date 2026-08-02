import {
  IsString,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsObject,
  IsUrl,
  Min,
  Length,
  ValidateIf,
} from 'class-validator';
import { ProductCategoryTier, UnitOfMeasure } from '../marketplace.enums';
import { IsGwsMediaArray } from '../../common/media/gws-media.validator';
import type { GwsMediaItem } from '../../common/media/gws-media.const';

/**
 * GWS · DTO de actualización de producto (PATCH /marketplace/products/:id)
 * ------------------------------------------------------------
 * Todos los campos opcionales: PATCH permite actualizar solo lo que se
 * manda. La validación de specs obligatorias por categoría la repite el
 * service (igual que en create) para no admitir un cambio que deje al
 * producto sin los campos técnicos mínimos de su categoría.
 */
export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ProductCategoryTier)
  categoryTier?: ProductCategoryTier;

  @IsOptional()
  @IsObject()
  technicalSpecs?: Record<string, unknown>;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  unitPrice?: number;

  @IsOptional()
  @IsEnum(UnitOfMeasure)
  unitOfMeasure?: UnitOfMeasure;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumOrderQuantity?: number;

  @IsOptional()
  @IsBoolean()
  requiresMsds?: boolean;

  @ValidateIf((o) => o.requiresMsds === true)
  @IsOptional()
  @IsUrl({}, { message: 'msdsUrl debe ser una URL válida' })
  msdsUrl?: string;

  @IsOptional()
  @IsString()
  @Length(2, 2)
  sellerCountryCode?: string;

  @IsOptional()
  @IsString()
  sellerRegion?: string;

  @IsOptional()
  @IsGwsMediaArray()
  media?: GwsMediaItem[];

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
