import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * GWS · ListVaultDocumentsQueryDto — Búsqueda pública de la Bóveda
 * ---------------------------------------------------------------
 * Solo expone documentos PUBLISHED. El filtro es laxo (contiene-búsqueda
 * en título/resumen + por categoría/idioma/tipo de documento) para la
 * fase MVP; la búsqueda vectorial (RAG) es infraestructura futura
 * (CLAUDE.md §4).
 */
export class ListVaultDocumentsQueryDto {
  @ApiPropertyOptional({ description: 'Filtro por código de categoría', maxLength: 16 })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  category?: string;

  @ApiPropertyOptional({ enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh'] })
  @IsOptional()
  @IsIn(['en', 'es', 'fr', 'de', 'it', 'pt', 'zh'])
  language?: string;

  @ApiPropertyOptional({ description: 'Búsqueda libre en título/resumen' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 12, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 12;
}
