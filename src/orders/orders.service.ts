import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Payment } from './entities/payment.entity';
import { Address } from './entities/address.entity';
import { Product } from '../marketplace/product.entity';
import { ProductVariant } from '../marketplace/product-variant.entity';
import { User } from '../users/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { OrderStatus, PaymentStatus, ORDER_ALLOWED_TRANSITIONS } from './orders.const';

/**
 * GWS · OrdersService — Checkout y Órdenes (P0)
 * ------------------------------------------------------------
 * Funda la brecha transversal P0-01 (gap-analysis): products → orders →
 * escrow_holds.orderRef. Aquí se crea la orden, se congelan los precios
 * (snapshot del catálogo al comprar), se registra la intención de pago
 * (Payment Vault §3.1 ejecuta el dinero real) y se administra la máquina
 * de estados (ADR-003). El movimiento de fondos nunca ocurre acá.
 *
 * ADR-001 (idempotencia): idempotencyKey UNIQUE por orden. Un cliente que
 * reintenta (timeout, doble click, webhook retry) recupera la MISMA orden
 * en vez de duplicarla: si la key ya existe para el mismo comprador,
 * se devuelve la orden existente.
 * ADR-004 (montos): NUMERIC(19,4) + DecimalTransformer, nunca float crudo
 * en totales — se acumula en micro-unidades (10^4) y se redondea al final.
 */
@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private itemRepo: Repository<OrderItem>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Address) private addressRepo: Repository<Address>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(ProductVariant) private variantRepo: Repository<ProductVariant>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  /** Suma la línea por variante: COALESCE(variant.priceOverride, product.unitPrice). */
  private async resolveUnitAmount(
    productId: string,
    variantId: string | undefined,
  ): Promise<{ unitAmount: number; productName: string }> {
    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException(`Producto ${productId} no encontrado`);
    if (!product.active) throw new BadRequestException(`El producto ${productId} no está a la venta`);

    if (variantId) {
      const variant = await this.variantRepo.findOne({ where: { id: variantId } });
      if (!variant || variant.productId !== productId) {
        throw new NotFoundException(`Variante ${variantId} no encontrada para el producto`);
      }
      if (!variant.active) throw new BadRequestException(`La variante ${variantId} no está a la venta`);
      return {
        unitAmount: variant.priceOverride ?? product.unitPrice,
        productName: variant.name,
      };
    }
    return { unitAmount: product.unitPrice, productName: product.name };
  }

  /**
   * Crea la orden con estado PENDING. Idempotente (ADR-001): si
   * idempotencyKey ya está registrada para el mismo comprador, devuelve
   * la orden original (200 en vez de duplicarla). Precios SIEMPRE del
   * catálogo (nunca del cliente) — snapshot inmutable en order_items.
   */
  async create(buyerId: string, dto: CreateOrderDto): Promise<OrderResponseDto> {
    const existing = await this.orderRepo.findOne({
      where: { idempotencyKey: dto.idempotencyKey },
      relations: { items: true, address: true, payments: true, shipments: true },
    });
    if (existing) {
      if (existing.buyerId === buyerId) return this.toResponse(existing);
      throw new BadRequestException('La clave de idempotencia pertenece a otra cuenta');
    }

    const buyer = await this.userRepo.findOne({ where: { id: buyerId } });
    if (!buyer) throw new NotFoundException('Comprador no encontrado');

    const items: OrderItem[] = [];
    let subtotalMicro = 0;
    for (const dtoItem of dto.items) {
      const { unitAmount, productName } = await this.resolveUnitAmount(
        dtoItem.productId,
        dtoItem.variantId,
      );
      const lineMicro = Math.round(unitAmount * 1e4) * dtoItem.quantity;
      subtotalMicro += lineMicro;
      items.push(
        this.itemRepo.create({
          productId: dtoItem.productId,
          variantId: dtoItem.variantId ?? null,
          productName,
          unitAmount,
          quantity: dtoItem.quantity,
          lineTotal: lineMicro / 1e4,
        }),
      );
    }

    const address = await this.addressRepo.save(
      this.addressRepo.create({
        userId: buyerId,
        fullName: dto.address.fullName,
        line1: dto.address.line1,
        line2: dto.address.line2 ?? null,
        city: dto.address.city,
        region: dto.address.region ?? null,
        postalCode: dto.address.postalCode,
        countryCode: dto.address.countryCode,
        phone: dto.address.phone ?? null,
      }),
    );

    const subtotal = subtotalMicro / 1e4;
    const total = subtotal; // P0: sin envío ni impuestos aún (customs es dominio aparte).
    const order = await this.orderRepo.save(
      this.orderRepo.create({
        buyerId,
        buyerEmail: buyer.email,
        idempotencyKey: dto.idempotencyKey,
        status: OrderStatus.PENDING,
        addressId: address.id,
        subtotal,
        shippingTotal: 0,
        taxTotal: 0,
        total,
        currency: 'USD',
        items,
      }),
    );

    await this.paymentRepo.save(
      this.paymentRepo.create({
        orderId: order.id,
        userId: buyerId,
        idempotencyKey: dto.idempotencyKey,
        status: PaymentStatus.PENDING,
        amount: total,
        currency: 'USD',
        paymentMethod: dto.paymentMethod,
      }),
    );

    return this.findById(order.id, buyerId);
  }

  /** Orden por id — solo su dueño puede verla (309/security: no filtrar). */
  async findById(id: string, userId: string): Promise<OrderResponseDto> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: { items: true, address: true, payments: true, shipments: true },
    });
    if (!order || order.buyerId !== userId) throw new NotFoundException('Orden no encontrada');
    return this.toResponse(order);
  }

  /** Órdenes del comprador, más recientes primero. */
  async findByUser(userId: string): Promise<OrderResponseDto[]> {
    const orders = await this.orderRepo.find({
      where: { buyerId: userId },
      relations: { items: true, address: true, payments: true, shipments: true },
      order: { createdAt: 'DESC' },
    });
    return orders.map((o) => this.toResponse(o));
  }

  /**
   * Cancela la orden (ADR-003). Solo desde PENDING (sin fondos capturados):
   * si el pago ya entró al Payment_Vault, la cancelación requiere refund del
   * vault, fuera de este módulo. Marca los payments pendientes como FAILED
   * para que la intención de pago no se ejecute.
   */
  async cancel(orderId: string, userId: string): Promise<OrderResponseDto> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: { items: true, address: true, payments: true, shipments: true },
    });
    if (!order || order.buyerId !== userId) throw new NotFoundException('Orden no encontrada');

    const allowed = ORDER_ALLOWED_TRANSITIONS[order.status];
    if (!allowed.includes(OrderStatus.CANCELLED)) {
      throw new BadRequestException(
        `La orden en estado ${order.status} no se puede cancelar (solo PENDING, sin pago capturado)`,
      );
    }
    order.status = OrderStatus.CANCELLED;
    const saved = await this.orderRepo.save(order);

    await this.paymentRepo.update(
      { orderId: saved.id, status: PaymentStatus.PENDING },
      { status: PaymentStatus.FAILED },
    );
    return this.findById(orderId, userId);
  }

  private toResponse(order: Order): OrderResponseDto {
    const payments = (order.payments ?? []) as Payment[];
    const shipment = order.shipments?.[0] ?? null;
    return {
      id: order.id,
      buyerId: order.buyerId,
      status: order.status,
      subtotal: order.subtotal,
      shippingTotal: order.shippingTotal,
      taxTotal: order.taxTotal,
      total: order.total,
      currency: order.currency,
      address: order.address
        ? {
            id: order.address.id,
            fullName: order.address.fullName,
            line1: order.address.line1,
            line2: order.address.line2,
            city: order.address.city,
            region: order.address.region,
            postalCode: order.address.postalCode,
            countryCode: order.address.countryCode,
            phone: order.address.phone,
          }
        : null,
      items: (order.items ?? []).map((i) => ({
        id: i.id,
        productId: i.productId,
        variantId: i.variantId,
        productName: i.productName,
        quantity: i.quantity,
        unitAmount: i.unitAmount,
        lineTotal: i.lineTotal,
      })),
      payments: payments.map((p) => ({
        id: p.id,
        status: p.status,
        amount: p.amount,
        currency: p.currency,
        paymentMethod: p.paymentMethod,
        createdAt: p.createdAt,
      })),
      shipmentStatus: shipment?.status ?? null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}