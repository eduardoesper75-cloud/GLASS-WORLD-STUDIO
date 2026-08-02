import { IsString, MaxLength, MinLength } from 'class-validator';

/**
 * GWS · Autopredictor de ficha técnica (Galaxia 6)
 * ------------------------------------------------------------
 * El comerciante escribe el nombre del producto masivo y el sistema
 * detecta la referencia por patrones de catálogo, devolviendo la ficha
 * técnica oficial precargada (autocompletado). Fricción cero.
 */
export class SuggestTechSheetDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  productName: string;
}
