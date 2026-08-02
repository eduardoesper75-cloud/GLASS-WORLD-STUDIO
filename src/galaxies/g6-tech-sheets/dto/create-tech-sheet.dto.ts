import {
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { G6_TECH_FAMILIES, G6TechFamily } from '../g6-tech-sheets.const';

/**
 * GWS · Alta de ficha técnica (Galaxia 6)
 * ------------------------------------------------------------
 * Dos vías (la orden las define):
 *   · templateSlug  → AUTOPREDICTOR: se copia la ficha oficial precargada.
 *   · manualSpecs   → FALLBACK MANUAL: piezas de autor / exóticas; el
 *                     formulario limpio del comerciante.
 * Si llega templateSlug, la ficha sale del template (source='autocomplete').
 * Si llega manualSpecs (sin templateSlug), la ficha es manual.
 */
export class CreateTechSheetDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  productName: string;

  @IsOptional()
  @IsIn(G6_TECH_FAMILIES, {
    message: `family debe ser uno de: ${G6_TECH_FAMILIES.join(', ')}`,
  })
  family?: G6TechFamily;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  templateSlug?: string;

  @IsOptional()
  @IsObject()
  manualSpecs?: Record<string, unknown>;

  @IsOptional()
  @IsUUID()
  productId?: string;
}
