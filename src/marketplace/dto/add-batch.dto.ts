import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { UnitOfMeasure } from '../marketplace.enums';

/**
 * GWS · DTO de alta de lote (POST /marketplace/products/:id/batches)
 * ------------------------------------------------------------
 * Antes este DTO vivía inline en el controller y unitOfMeasure NO se
 * validaba contra el enum — cualquier string pasaba y fallaba recién
 * contra la base de datos. Ahora es un archivo con validación completa.
 */
export class AddBatchDto {
  @IsString()
  batchNumber: string;

  @IsNumber()
  @Min(0, { message: 'volumeAvailable no puede ser negativo' })
  volumeAvailable: number;

  @IsEnum(UnitOfMeasure)
  unitOfMeasure: UnitOfMeasure;

  @IsString()
  coaUrl: string;

  @IsOptional()
  @IsString()
  msdsUrl?: string;
}
