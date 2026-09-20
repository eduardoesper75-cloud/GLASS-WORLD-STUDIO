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
import { Type } from 'class-transformer';
import { ORDER_PAYMENT_METHODS } from '../orders.const';

class CreateOrderItemDto {
  @IsUUID()
  productId: string;

  /** Variante opcional del producto (SKU propio). */
  @IsOptional()
  @IsUUID()
  variantId?: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderAddressDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  fullName: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  line1: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  line2?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  city: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  region?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(20)
  postalCode: string;

  /** ISO 3166-1 alpha-2 (ej: "AR", "US"). */
  @IsString()
  @Matches(/^[A-Z]{2}$/, { message: 'countryCode debe ser ISO 3166-1 alpha-2 (ej: AR)' })
  countryCode: string;

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
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  idempotencyKey: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsObject()
  @ValidateNested()
  @Type(() => CreateOrderAddressDto)
  address: CreateOrderAddressDto;

  @IsIn(ORDER_PAYMENT_METHODS, {
    message: `paymentMethod debe ser uno de: ${ORDER_PAYMENT_METHODS.join(', ')}`,
  })
  paymentMethod: (typeof ORDER_PAYMENT_METHODS)[number];
}