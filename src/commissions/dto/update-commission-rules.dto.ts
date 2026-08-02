import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { G1_TRANSACTION_TYPES, PERCENT_MAX, PERCENT_MIN } from '../commissions.const';

/**
 * GWS · UpdateCommissionRuleDto
 * ------------------------------------------------------------
 * Edición de una regla de comisión. Requiere ADMIN + sesión elevada
 * ('edit_liquidation_rules', CLAUDE.md §3.1/§3.5). El tipo de transacción
 * es obligatorio en G1 (artwork_sale | product_line) y PROHIBIDO en el
 * resto de galaxias (regla global única).
 */
export class UpdateCommissionRuleDto {
  @Matches(/^G[1-6]$/, { message: 'galaxy debe ser G1..G6' })
  galaxy: string;

  @IsOptional()
  @IsIn([...G1_TRANSACTION_TYPES], {
    message: 'transactionType debe ser artwork_sale o product_line',
  })
  transactionType?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(PERCENT_MIN)
  @Max(PERCENT_MAX)
  percent: number;
}

export class UpdateCommissionRulesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => UpdateCommissionRuleDto)
  rules: UpdateCommissionRuleDto[];
}
