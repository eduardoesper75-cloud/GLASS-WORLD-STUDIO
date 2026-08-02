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
  @IsOptional()
  @IsEnum(ProductCategoryTier)
  categoryTier?: ProductCategoryTier;

  @IsOptional()
  @IsString()
  @Length(2, 2, { message: 'countryCode debe ser ISO 3166-1 alpha-2 (ej: AR)' })
  countryCode?: string;

  /** Búsqueda por texto libre sobre nombre y descripción (ILIKE). */
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'search no puede superar 200 caracteres' })
  search?: string;

  /**
   * Filtro técnico: JSON válido con las claves/valores que el producto
   * debe CONTENER en technicalSpecs (ej. {"coe":96}). Se transforma de
   * string a objeto acá, con error claro si el cliente manda JSON roto.
   */
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
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  coeMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  coeMax?: number;

  /** Rango de temperatura de fusión/trabajo (°C). products.fusionTemperatureC. */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  fusionTempMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  fusionTempMax?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100, { message: 'limit no puede superar 100' })
  limit?: number;
}
