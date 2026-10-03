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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsGwsMediaArray } from '../../common/media/gws-media.validator';
import type { GwsMediaItem } from '../../common/media/gws-media.const';

export class CreateProductDto {
  @ApiProperty({ example: 'Vidrio flotado incoloro 6mm', description: 'Nombre comercial' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Vidrio de arquitectura en hoja estándar, transmisión 89%.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ProductCategoryTier, description: 'Categoría/galaxia del producto' })
  @IsEnum(ProductCategoryTier)
  categoryTier: ProductCategoryTier;

  /**
   * Validación deliberadamente laxa a nivel de tipo (Record<string,
   * unknown>) porque las claves varían por categoría — pero el
   * MarketplaceService SÍ valida, antes de guardar, que las claves
   * mínimas esperadas por categoría estén presentes (ver
   * REQUIRED_SPECS_BY_TIER en marketplace.service.ts). Esto evita
   * el problema de un JSONB "todo vale" sin ninguna garantía.
   */
@ApiProperty({
    type: 'object',
    description: 'Especificaciones técnicas por categoría (claves mínimas validadas por servicio, ej: {"coe":76})',
    example: { coe: 76, thickness_mm: 6 },
  })
  @IsObject()
  technicalSpecs: Record<string, unknown>;

  @ApiProperty({ example: 8.5, description: 'Precio por unidad mayorista (USD)', minimum: 0.01 })
  @IsNumber()
  @Min(0.01)
  unitPrice: number;

  @ApiProperty({ enum: UnitOfMeasure, example: 'm2' })
  @IsEnum(UnitOfMeasure)
  unitOfMeasure: UnitOfMeasure;

  @ApiPropertyOptional({ example: 10, description: 'Pedido mínimo (MOQ)', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumOrderQuantity?: number;

  @ApiProperty({ description: '¿Requiere FDS/MSDS?' })
  @IsBoolean()
  requiresMsds: boolean;

  @ApiPropertyOptional({ description: 'URL de la FDS/MSDS — requerida si requiresMsds=true' })
  @ValidateIf((o) => o.requiresMsds === true)
  @IsUrl({}, { message: 'msdsUrl debe ser una URL válida' })
  msdsUrl?: string;

  @ApiProperty({ example: 'AR', description: 'ISO 3166-1 alpha-2 del país del vendedor' })
  @IsString()
  @Length(2, 2)
  sellerCountryCode: string;

  @ApiPropertyOptional({ example: 'Santiago del Estero' })
  @IsOptional()
  @IsString()
  sellerRegion?: string;

  /** Demostración técnica en video (máquina pesada de G5, corte por agua).
   * Allowlist soberano — nunca canales de contacto (§3.6). */
  @ApiPropertyOptional({
    type: 'array',
    description: 'Media (allowlist soberana: video/imágenes; nunca canales de contacto)',
    items: { type: 'object' },
  })
  @IsOptional()
  @IsGwsMediaArray()
  media?: GwsMediaItem[];
}
