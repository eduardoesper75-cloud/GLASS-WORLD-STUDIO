import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  Length,
  IsInt,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ProductCategoryTier } from '../marketplace.enums';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * GWS · DTO de consulta del catálogo público (GET /marketplace/products)
 * ------------------------------------------------------------
 * Validación estricta de TODOS los query params — antes, un
 * categoryTier inválido (ej. "loco") llegaba directo a la query de
 * TypeORM y generaba un error de base de datos; acá se rechaza con
 * 400 en la capa de DTO, sin tocar la DB. La lista blanca de
 * forbidNonWhitelisted descarta cualquier query param desconocido.
 */
export class ListProductsQueryDto {
  @ApiPropertyOptional({ enum: ProductCategoryTier, description: 'Filtro por categoría/galaxia' })
  @IsOptional()
  @IsEnum(ProductCategoryTier)
  categoryTier?: ProductCategoryTier;

  @ApiPropertyOptional({ example: 'AR', description: 'ISO 3166-1 alpha-2 del país del vendedor' })
  @IsOptional()
  @IsString()
  @Length(2, 2, { message: 'countryCode debe ser ISO 3166-1 alpha-2 (ej: AR)' })
  countryCode?: string;

  /** Búsqueda por texto libre sobre nombre y descripción (ILIKE). */
  @ApiPropertyOptional({ description: 'Búsqueda libre sobre nombre y descripción' })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'search no puede superar 200 caracteres' })
  search?: string;

  /**
   * Filtro técnico: JSON válido con las claves/valores que el producto
   * debe CONTENER en technicalSpecs (ej. {"coe":96}). Se transforma de
   * string a objeto acá, con error claro si el cliente manda JSON roto.
   */
  @ApiPropertyOptional({ type: 'object', description: 'JSON con claves que technicalSpecs debe contener (ej: {"coe":96})', example: { coe: 96 } })
  @IsOptional()
  @Transform(({ value }) => {
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
      throw new Error('specs debe ser un JSON válido, ej: {"coe":96}');
    }
  })
  specs?: Record<string, unknown>;

  /** Rango de COE — Coeficiente de Expansión Térmica (x10^-7/°C).
   * Filtra sobre la columna tipada products.coe, no sobre el JSONB. */
  @ApiPropertyOptional({ description: 'COE mínimo', minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  coeMin?: number;

  @ApiPropertyOptional({ description: 'COE máximo', minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  coeMax?: number;

  /** Rango de temperatura de fusión/trabajo (°C). products.fusionTemperatureC. */
  @ApiPropertyOptional({ description: 'Temp. fusión mín (ºC)', minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  fusionTempMin?: number;

  @ApiPropertyOptional({ description: 'Temp. fusión máx (ºC)', minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  fusionTempMax?: number;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100, { message: 'limit no puede superar 100' })
  limit?: number;
}
