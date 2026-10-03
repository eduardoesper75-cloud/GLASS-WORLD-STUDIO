import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VAULT_REJECT_REASONS } from '../vault.enums';

/**
 * GWS · ReviewVaultDocumentDto — Decisión de curador
 * --------------------------------------------------
 * El documento se sube en under_review; solo el curador (moderador de
 * cualquier galaxia o admin) lo publica o lo rechaza. El rechazo exige
 * un reason code normalizado (DUPLICATE, INVALID_METADATA,
 * NUMERIC_INCONSISTENT, SPAM, UNVERIFIED_SOURCE) + nota de moderación.
 */
export class ReviewVaultDocumentDto {
  @ApiProperty({ enum: ['published', 'rejected'] })
  decision: 'published' | 'rejected';

  @ApiPropertyOptional({ enum: VAULT_REJECT_REASONS, description: 'Obligatorio si decision=rejected' })
  @IsOptional()
  @IsIn(VAULT_REJECT_REASONS as unknown as string[])
  rejectReason?: string;

  @ApiPropertyOptional({ description: 'Nota de moderación' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  moderationNote?: string;
}
