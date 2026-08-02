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
  @IsString()
  @MaxLength(16)
  categoryCode: string;

  @IsString()
  @Length(SPAN.MIN_TITLE, SPAN.MAX_TITLE)
  title: string;

  @IsString()
  @Length(SPAN.MIN_SUMMARY, SPAN.MAX_SUMMARY)
  summary: string;

  @IsString()
  @IsIn(['en', 'es', 'fr', 'de', 'it', 'pt', 'zh'])
  language: string;

  @IsString()
  @IsIn(DOC_KINDS as unknown as string[])
  docKind: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsUrl()
  sourceUrl?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  fileType?: string;

  @IsString()
  @IsIn([LEGAL_TERMS_VERSION])
  acceptedTermsVersion: string;
}
