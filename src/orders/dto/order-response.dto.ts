import { OrderStatus, PaymentStatus, ShipmentStatus } from '../orders.const';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class OrderItemResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() productId: string;
  @ApiProperty({ nullable: true }) variantId: string | null;
  @ApiProperty() productName: string;
  @ApiProperty() quantity: number;
  @ApiProperty({ description: 'Importe unitario en centavos de la moneda de la orden' }) unitAmount: number;
  @ApiProperty({ description: 'Total de la línea en centavos' }) lineTotal: number;
}

class AddressResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() fullName: string;
  @ApiProperty() line1: string;
  @ApiProperty({ nullable: true }) line2: string | null;
  @ApiProperty() city: string;
  @ApiProperty({ nullable: true }) region: string | null;
  @ApiProperty() postalCode: string;
  @ApiProperty({ example: 'AR' }) countryCode: string;
  @ApiProperty({ nullable: true }) phone: string | null;
}

export class PaymentResponseDto {
  @ApiProperty() id: string;
  @ApiProperty({ enum: PaymentStatus }) status: PaymentStatus;
  @ApiProperty() amount: number;
  @ApiProperty({ example: 'USD' }) currency: string;
  @ApiProperty() paymentMethod: string;
  @ApiProperty() createdAt: Date;
}

export class OrderResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() buyerId: string;
  @ApiProperty({ enum: OrderStatus }) status: OrderStatus;
  @ApiProperty({ description: 'Subtotal en centavos' }) subtotal: number;
  @ApiProperty({ description: 'Envío en centavos' }) shippingTotal: number;
  @ApiProperty({ description: 'Impuestos en centavos' }) taxTotal: number;
  @ApiProperty({ description: 'Total en centavos' }) total: number;
  @ApiProperty({ example: 'USD' }) currency: string;
  @ApiProperty({ type: AddressResponseDto, nullable: true }) address: AddressResponseDto | null;
  @ApiProperty({ type: [OrderItemResponseDto] }) items: OrderItemResponseDto[];
  @ApiProperty({ type: [PaymentResponseDto] }) payments: PaymentResponseDto[];
  @ApiPropertyOptional({ enum: ShipmentStatus, nullable: true }) shipmentStatus?: ShipmentStatus | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

export class OrderListResponseDto {
  @ApiProperty({ type: [OrderResponseDto] }) items: OrderResponseDto[];
  @ApiProperty() total: number;
}