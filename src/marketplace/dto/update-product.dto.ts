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
import { ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiPropertyOptional({ example: 'Vidrio flotado incoloro 6mm' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ProductCategoryTier })
  @IsOptional()
  @IsEnum(ProductCategoryTier)
  categoryTier?: ProductCategoryTier;

  @ApiPropertyOptional({ example: 'Sintec', description: 'Marca comercial (filtro de catálogo G2)' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  brand?: string;

  @ApiPropertyOptional({ type: 'object', example: { coe: 76 } })
  @IsOptional()
  @IsObject()
  technicalSpecs?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 9.2, minimum: 0.01 })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  unitPrice?: number;

  @ApiPropertyOptional({ enum: UnitOfMeasure })
  @IsOptional()
  @IsEnum(UnitOfMeasure)
  unitOfMeasure?: UnitOfMeasure;

  @ApiPropertyOptional({ example: 10, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumOrderQuantity?: number;

  @ApiPropertyOptional({ description: '¿Requiere FDS/MSDS?' })
  @IsOptional()
  @IsBoolean()
  requiresMsds?: boolean;

  @ApiPropertyOptional({ description: 'URL FDS/MSDS si requiresMsds=true' })
  @ValidateIf((o) => o.requiresMsds === true)
  @IsOptional()
  @IsUrl({}, { message: 'msdsUrl debe ser una URL válida' })
  msdsUrl?: string;

  @ApiPropertyOptional({ example: 'AR', description: 'ISO 3166-1 alpha-2' })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  sellerCountryCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sellerRegion?: string;

  @ApiPropertyOptional({ type: 'array', items: { type: 'object' } })
  @IsOptional()
  @IsGwsMediaArray()
  media?: GwsMediaItem[];

  @ApiPropertyOptional({ description: 'Baja lógica del producto' })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
