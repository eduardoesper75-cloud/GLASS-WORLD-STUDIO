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

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

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
  @IsObject()
  technicalSpecs: Record<string, unknown>;

  @IsNumber()
  @Min(0.01)
  unitPrice: number;

  @IsEnum(UnitOfMeasure)
  unitOfMeasure: UnitOfMeasure;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumOrderQuantity?: number;

  @IsBoolean()
  requiresMsds: boolean;

  @ValidateIf((o) => o.requiresMsds === true)
  @IsUrl({}, { message: 'msdsUrl debe ser una URL válida' })
  msdsUrl?: string;

  @IsString()
  @Length(2, 2)
  sellerCountryCode: string;

  @IsOptional()
  @IsString()
  sellerRegion?: string;

  /** Demostración técnica en video (máquina pesada de G5, corte por agua).
   * Allowlist soberana — nunca canales de contacto (§3.6). */
  @IsOptional()
  @IsGwsMediaArray()
  media?: GwsMediaItem[];
}
