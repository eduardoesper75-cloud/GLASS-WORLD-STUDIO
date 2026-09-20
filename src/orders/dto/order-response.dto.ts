import { OrderStatus, PaymentStatus, ShipmentStatus } from '../orders.const';

class OrderItemResponseDto {
  id: string;
  productId: string;
  variantId: string | null;
  productName: string;
  quantity: number;
  unitAmount: number;
  lineTotal: number;
}

class AddressResponseDto {
  id: string;
  fullName: string;
  line1: string;
  line2: string | null;
  city: string;
  region: string | null;
  postalCode: string;
  countryCode: string;
  phone: string | null;
}

export class PaymentResponseDto {
  id: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  paymentMethod: string;
  createdAt: Date;
}

export class OrderResponseDto {
  id: string;
  buyerId: string;
  status: OrderStatus;
  subtotal: number;
  shippingTotal: number;
  taxTotal: number;
  total: number;
  currency: string;
  address: AddressResponseDto | null;
  items: OrderItemResponseDto[];
  payments: PaymentResponseDto[];
  shipmentStatus?: ShipmentStatus | null;
  createdAt: Date;
  updatedAt: Date;
}

export class OrderListResponseDto {
  items: OrderResponseDto[];
  total: number;
}