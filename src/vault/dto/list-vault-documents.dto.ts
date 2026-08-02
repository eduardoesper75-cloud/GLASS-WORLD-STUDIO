import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

/**
 * GWS · ListVaultDocumentsQueryDto — Búsqueda pública de la Bóveda
 * ---------------------------------------------------------------
 * Solo expone documentos PUBLISHED. El filtro es laxo (contiene-búsqueda
 * en título/resumen + por categoría/idioma/tipo de documento) para la
 * fase MVP; la búsqueda vectorial (RAG) es infraestructura futura
 * (CLAUDE.md §4).
 */
export class ListVaultDocumentsQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(16)
  category?: string;

  @IsOptional()
  @IsIn(['en', 'es', 'fr', 'de', 'it', 'pt', 'zh'])
  language?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 12;
}
