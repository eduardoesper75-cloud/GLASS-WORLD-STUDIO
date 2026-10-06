import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ProductCategoryTier } from '../../marketplace/marketplace.enums';

/**
 * GWS · DTO de query de listado G2 (spec g2-listado, CA2/CA3)
 * ------------------------------------------------------------
 * Endpoint público (sin guard). whitelist + forbidNonWhitelisted del
 * ValidationPipe global convierten cualquier parámetro no declarado
 * en 400 — parámetros desconocidos no se ignoran en silencio.
 *
 * `page`/`limit` llegan como string desde la querystring y @Type
 * los numéricos convierte antes de validar. `limit` está acotado a
 * 100 como en /marketplace/products (consistencia CF-39).
 */
export class G2ListProductsQueryDto {
  @ApiPropertyOptional({ enum: ProductCategoryTier, description: 'Categoría/galaxia' })
  @IsOptional()
  @IsEnum(ProductCategoryTier)
  category?: ProductCategoryTier;

  @ApiPropertyOptional({ example: 'Sintec', description: 'Marca comercial (coincidencia exacta)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  brand?: string;

  @ApiPropertyOptional({ example: 5, minimum: 0, description: 'Precio unitario USD mínimo (inclusivo)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price_min?: number;

  @ApiPropertyOptional({ example: 500, minimum: 0, description: 'Precio unitario USD máximo (inclusivo)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price_max?: number;

  @ApiPropertyOptional({ default: 1, minimum: 1, description: 'Página (1-based)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'page debe ser >= 1' })
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100, description: 'Tamaño de página (máx 100)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'limit debe ser >= 1' })
  @Max(100, { message: 'limit no puede superar 100' })
  limit?: number = 20;
}
