import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ORDER_PAYMENT_METHODS } from '../orders.const';

class CreateOrderItemDto {
  @ApiProperty({ example: 'a1b2c3d4-0000-4000-8000-000000000001', description: 'UUID del producto' })
  @IsUUID()
  productId: string;

  /** Variante opcional del producto (SKU propio). */
  @ApiProperty({ description: 'UUID de la variante (SKU) — opcional' })
  @IsOptional()
  @IsUUID()
  variantId?: string;

  @ApiProperty({ example: 3, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderAddressDto {
  @ApiProperty({ example: 'Eduardo Esper', minLength: 1, maxLength: 120 })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  fullName: string;

  @ApiProperty({ example: 'Av. Belgrano Sur 1234', minLength: 1, maxLength: 255 })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  line1: string;

  @ApiPropertyOptional({ example: 'Piso 5, depto B', description: 'Complemento de dirección' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  line2?: string;

  @ApiProperty({ example: 'Santiago del Estero', minLength: 1, maxLength: 120 })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  city: string;

  @ApiPropertyOptional({ example: 'Santiago del Estero', maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  region?: string;

  @ApiProperty({ example: '4200', minLength: 1, maxLength: 20 })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  postalCode: string;

  /** ISO 3166-1 alpha-2 (ej: "AR", "US"). */
  @ApiProperty({ example: 'AR', description: 'ISO 3166-1 alpha-2' })
  @IsString()
  @Matches(/^[A-Z]{2}$/, { message: 'countryCode debe ser ISO 3166-1 alpha-2 (ej: AR)' })
  countryCode: string;

  @ApiPropertyOptional({ example: '+5493855551234', maxLength: 30 })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;
}

/**
 * GWS · CreateOrderDto — entrada del checkout (P0)
 * ------------------------------------------------------------
 * El checkout se resuelve SIEMPRE contra precios de la BD (snapshot al
 * momento de la orden), nunca contra montos que envíe el cliente. El
 * comprador autenticado viene del JWT (buyerId), no del body.
 *
 * ADR-001: `idempotencyKey` obligatoria; reintentar con la misma key
 * devuelve la MISMA orden (no la duplica).
 */
export class CreateOrderDto {
  @ApiProperty({ description: 'Clave idempotente (ADR-001): reintentar con la misma key devuelve la MISMA orden', minLength: 8, maxLength: 64, example: 'chk-20260922-abc12345' })
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  idempotencyKey: string;

  @ApiProperty({ type: [CreateOrderItemDto], description: 'Líneas de la orden (mínimo 1)' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ApiProperty({ type: CreateOrderAddressDto, description: 'Dirección de facturación/envío' })
  @IsObject()
  @ValidateNested()
  @Type(() => CreateOrderAddressDto)
  address: CreateOrderAddressDto;

  @ApiProperty({ enum: ORDER_PAYMENT_METHODS, description: 'Método de pago permitido' })
  @IsIn(ORDER_PAYMENT_METHODS, {
    message: `paymentMethod debe ser uno de: ${ORDER_PAYMENT_METHODS.join(', ')}`,
  })
  paymentMethod: (typeof ORDER_PAYMENT_METHODS)[number];
}