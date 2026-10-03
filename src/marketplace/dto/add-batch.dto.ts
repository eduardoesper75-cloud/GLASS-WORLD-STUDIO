import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UnitOfMeasure } from '../marketplace.enums';

/**
 * GWS · DTO de alta de lote (POST /marketplace/products/:id/batches)
 * ------------------------------------------------------------
 * Antes este DTO vivía inline en el controller y unitOfMeasure NO se
 * validaba contra el enum — cualquier string pasaba y fallaba recién
 * contra la base de datos. Ahora es un archivo con validación completa.
 */
export class AddBatchDto {
  @ApiProperty({ example: 'L-2026-001', description: 'Número/clave del lote' })
  @IsString()
  batchNumber: string;

  @ApiProperty({ example: 120, description: 'Volumen disponible', minimum: 0 })
  @IsNumber()
  @Min(0, { message: 'volumeAvailable no puede ser negativo' })
  volumeAvailable: number;

  @ApiProperty({ enum: UnitOfMeasure, example: 'm2' })
  @IsEnum(UnitOfMeasure)
  unitOfMeasure: UnitOfMeasure;

  @ApiProperty({ example: 'https://cdn.gws.example/coa-l001.pdf', description: 'URL del certificado de análisis (COA)' })
  @IsString()
  coaUrl: string;

  @ApiPropertyOptional({ description: 'URL de la FDS/MSDS del lote' })
  @IsOptional()
  @IsString()
  msdsUrl?: string;
}
