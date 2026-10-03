import {
  IsString,
  IsIn,
  IsOptional,
  IsUrl,
  IsObject,
  Length,
  MaxLength,
} from 'class-validator';
import {
  DOC_KINDS,
  LEGAL_TERMS_VERSION,
  SPAM_RULES,
} from '../vault.const';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const SPAN = {
  MIN_TITLE: SPAM_RULES.minTitleChars,
  MAX_TITLE: SPAM_RULES.maxTitleChars,
  MIN_SUMMARY: SPAM_RULES.minSummaryChars,
  MAX_SUMMARY: SPAM_RULES.maxSummaryChars,
};

/**
 * GWS · CreateVaultDocumentDto — Alta de documento (curación)
 * ------------------------------------------------------------
 * language: uno de los 7 idiomas soportados (iso 639-1).
 * metadata: jsonb libre; la validación de claves requeridas POR HOJA
 * (REQUIRED_METADATA_BY_CATEGORY) corre en el service, no en el DTO,
 * porque depende de la categoría destino (categoryCode).
 * content: cuerpo del documento (fase MVP, sin object-storage todavía).
 * acceptedTermsVersion: debe coincidir EXACTO con la versión vigente de
 * las cláusulas safe-harbor (es+en) — si cambian los términos, vencen
 * los uploads previos.
 */
export class CreateVaultDocumentDto {
  @ApiProperty({ description: 'Código de categoría (validación de claves requeridas en el service)', maxLength: 16, example: 'normas-tecnicas' })
  @IsString()
  @MaxLength(16)
  categoryCode: string;

  @ApiProperty({ description: 'Título (anti-spam: rango de caracteres)', example: 'Norma IRAM 12345 — vidrios' })
  @IsString()
  @Length(SPAN.MIN_TITLE, SPAN.MAX_TITLE)
  title: string;

  @ApiProperty({ description: 'Resumen/abstract' })
  @IsString()
  @Length(SPAN.MIN_SUMMARY, SPAN.MAX_SUMMARY)
  summary: string;

  @ApiProperty({ enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh'], example: 'es' })
  @IsString()
  @IsIn(['en', 'es', 'fr', 'de', 'it', 'pt', 'zh'])
  language: string;

  @ApiProperty({ description: 'Tipo de documento', example: 'regulatory' })
  @IsString()
  @IsIn(DOC_KINDS as unknown as string[])
  docKind: string;

  @ApiPropertyOptional({ type: 'object', description: 'Metadatos libres (validación por categoría en el service)' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'URL de la fuente original' })
  @IsOptional()
  @IsUrl()
  sourceUrl?: string;

  @ApiPropertyOptional({ description: 'Cuerpo del documento (fase MVP, sin object-storage)' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'Tipo de archivo (ej: pdf)', maxLength: 64 })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  fileType?: string;

  @ApiProperty({ description: `Debe coincidir con la versión vigente de cláusulas safe-harbor (${LEGAL_TERMS_VERSION})`, example: LEGAL_TERMS_VERSION })
  @IsString()
  @IsIn([LEGAL_TERMS_VERSION])
  acceptedTermsVersion: string;
}
