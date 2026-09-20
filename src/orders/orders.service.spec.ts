import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Payment } from './entities/payment.entity';
import { Address } from './entities/address.entity';
import { Product } from '../marketplace/product.entity';
import { ProductVariant } from '../marketplace/product-variant.entity';
import { User } from '../users/user.entity';
import { OrderStatus, PaymentStatus } from './orders.const';
import { CreateOrderDto } from './dto/create-order.dto';

describe('OrdersService', () => {
  let service: OrdersService;

  const mockRepo = () => ({
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn((e) => e),
    update: jest.fn(),
  });

  let orderRepo: ReturnType<typeof mockRepo>;
  let paymentRepo: ReturnType<typeof mockRepo>;
  let addressRepo: ReturnType<typeof mockRepo>;
  let productRepo: ReturnType<typeof mockRepo>;
  let variantRepo: ReturnType<typeof mockRepo>;
  let userRepo: ReturnType<typeof mockRepo>;

  const validDto = (): CreateOrderDto => ({
    idempotencyKey: 'key-abc-12345',
    items: [
      { productId: 'prod-1', quantity: 2 },
      { productId: 'prod-2', quantity: 1 },
    ],
    address: {
      fullName: 'Jorge',
      line1: 'Av. Siempre Viva 742',
      city: 'Springfield',
      postalCode: '1425',
      countryCode: 'AR',
    },
    paymentMethod: 'card_usd',
  });

  const product = (id: string, unitPrice: number) => ({
    id,
    name: `Producto ${id}`,
    unitPrice,
    active: true,
  });

  const fullOrder = () => ({
    id: 'order-1',
    buyerId: 'buyer-1',
    buyerEmail: 'buyer@test.com',
    idempotencyKey: 'key-abc-12345',
    status: OrderStatus.PENDING,
    addressId: 'addr-1',
    subtotal: 25,
    shippingTotal: 0,
    taxTotal: 0,
    total: 25,
    currency: 'USD',
    items: [
      {
        id: 'i1',
        productId: 'prod-1',
        variantId: null,
        productName: 'Producto prod-1',
        quantity: 2,
        unitAmount: 10,
        lineTotal: 20,
      },
      {
        id: 'i2',
        productId: 'prod-2',
        variantId: null,
        productName: 'Producto prod-2',
        quantity: 1,
        unitAmount: 5,
        lineTotal: 5,
      },
    ],
    payments: [
      {
        id: 'pay-1',
        status: PaymentStatus.PENDING,
        amount: 25,
        currency: 'USD',
        paymentMethod: 'card_usd',
        createdAt: new Date(),
      },
    ],
    shipments: [],
    address: {
      id: 'addr-1',
      fullName: 'Jorge',
      line1: 'Av. Siempre Viva 742',
      line2: null,
      city: 'Springfield',
      region: null,
      postalCode: '1425',
      countryCode: 'AR',
      phone: null,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  /**
   * findOne de create() se llama dos veces: ① lookup de idempotencia
   * (where.idempotencyKey) → `existing` (null si no hay replay), y
   * ② findById post-guardado (where.id) → la orden completa persistida.
   */
  const configureFindOne = (existing: unknown = null) => {
    orderRepo.findOne.mockImplementation(async ({ where }: { where: Record<string, unknown> }) => {
      if (where && 'idempotencyKey' in where) return existing;
      if (where && where.id) return fullOrder();
      return null;
    });
  };

  const build = async () => {
    orderRepo = mockRepo();
    const itemRepo = mockRepo();
    paymentRepo = mockRepo();
    addressRepo = mockRepo();
    productRepo = mockRepo();
    variantRepo = mockRepo();
    userRepo = mockRepo();

    const moduleRef = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: orderRepo },
        { provide: getRepositoryToken(OrderItem), useValue: itemRepo },
        { provide: getRepositoryToken(Payment), useValue: paymentRepo },
        { provide: getRepositoryToken(Address), useValue: addressRepo },
        { provide: getRepositoryToken(Product), useValue: productRepo },
        { provide: getRepositoryToken(ProductVariant), useValue: variantRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
      ],
    }).compile();

    service = moduleRef.get(OrdersService);
  };

  describe('create()', () => {
    beforeEach(async () => {
      await build();
      userRepo.findOne.mockResolvedValue({ id: 'buyer-1', email: 'buyer@test.com' });
      productRepo.findOne.mockImplementation(async ({ where }) =>
        product(where.id, where.id === 'prod-1' ? 10 : 5),
      );
      addressRepo.save.mockImplementation(async (a) => ({ ...a, id: 'addr-1' }));
    });

    it('crea la orden PENDING con snapshot de precios y subtotal/total correctos', async () => {
      configureFindOne();
      orderRepo.save.mockImplementation(async (o) => ({ ...o, id: 'order-1' }));
      paymentRepo.save.mockImplementation(async (p) => ({ ...p, id: 'pay-1' }));

      const result = await service.create('buyer-1', validDto());

      const savedOrder = orderRepo.save.mock.calls[0][0];
      expect(savedOrder.status).toBe(OrderStatus.PENDING);
      expect(savedOrder.subtotal).toBe(25);
      expect(savedOrder.total).toBe(25);
      expect(savedOrder.currency).toBe('USD');
      expect(savedOrder.buyerEmail).toBe('buyer@test.com');
      expect(savedOrder.addressId).toBe('addr-1');
      expect(savedOrder.items).toHaveLength(2);
      expect(savedOrder.items[0].lineTotal).toBe(20);
      expect(savedOrder.items[1].lineTotal).toBe(5);
      expect(savedOrder.items[0].productName).toBe('Producto prod-1');
      // Precios del catálogo, nunca del cliente: el DTO no trae montos.
      expect(savedOrder.items[0].unitAmount).toBe(10);

      const savedPayment = paymentRepo.save.mock.calls[0][0];
      expect(savedPayment.orderId).toBe('order-1');
      expect(savedPayment.status).toBe(PaymentStatus.PENDING);
      expect(savedPayment.amount).toBe(25);
      expect(savedPayment.paymentMethod).toBe('card_usd');

      expect(result.id).toBe('order-1');
      expect(result.status).toBe(OrderStatus.PENDING);
      expect(result.items).toHaveLength(2);
    });

    it('usa priceOverride de la variante para el precio efectivo (unidad y línea)', async () => {
      configureFindOne();
      variantRepo.findOne.mockResolvedValue({
        id: 'var-1',
        productId: 'prod-1',
        name: 'Variante premium',
        priceOverride: 50,
        active: true,
      });
      productRepo.findOne.mockResolvedValue(product('prod-1', 10));
      orderRepo.save.mockImplementation(async (o) => ({ ...o, id: 'order-1' }));

      const dto = validDto();
      dto.items = [{ productId: 'prod-1', variantId: 'var-1', quantity: 2 }];
      await service.create('buyer-1', dto);

      const savedOrder = orderRepo.save.mock.calls[0][0];
      expect(savedOrder.items[0].unitAmount).toBe(50);
      expect(savedOrder.items[0].lineTotal).toBe(100);
      expect(savedOrder.items[0].productName).toBe('Variante premium');
      expect(savedOrder.subtotal).toBe(100);
    });

    it('es idempotente (ADR-001): reintento con la misma key devuelve la MISMA orden sin duplicar', async () => {
      configureFindOne(fullOrder());
      orderRepo.save.mockResolvedValue(fullOrder());

      const result = await service.create('buyer-1', validDto());

      expect(result.id).toBe('order-1');
      expect(result.status).toBe(OrderStatus.PENDING);
      expect(orderRepo.save).not.toHaveBeenCalled();
      expect(userRepo.findOne).not.toHaveBeenCalled();
      expect(paymentRepo.save).not.toHaveBeenCalled();
    });

    it('rechaza la key de idempotencia de otra cuenta (no filtra datos ajenos)', async () => {
      const otros = fullOrder();
      otros.buyerId = 'buyer-otro';
      configureFindOne(otros);

      await expect(service.create('buyer-1', validDto())).rejects.toThrow(
        'pertenece a otra cuenta',
      );
    });

    it('devuelve NotFound si el producto no existe', async () => {
      configureFindOne();
      productRepo.findOne.mockResolvedValue(null);

      await expect(service.create('buyer-1', validDto())).rejects.toThrow(
        'Producto prod-1 no encontrado',
      );
    });

    it('bloquea productos inactivos', async () => {
      configureFindOne();
      productRepo.findOne.mockResolvedValue({ ...product('prod-1', 10), active: false });

      await expect(service.create('buyer-1', validDto())).rejects.toThrow('no está a la venta');
    });
  });

  describe('findById() y findByUser()', () => {
    beforeEach(async () => await build());

    it('expone la orden solo a su dueño (404, sin leak a otro usuario)', async () => {
      orderRepo.findOne.mockResolvedValue(fullOrder());
      await expect(service.findById('order-1', 'buyer-otro')).rejects.toThrow('no encontrada');
    });

    it('lista las órdenes del comprador, más recientes primero', async () => {
      orderRepo.find.mockResolvedValue([fullOrder()]);
      const result = await service.findByUser('buyer-1');
      expect(result).toHaveLength(1);
      expect(result[0].buyerId).toBe('buyer-1');
      expect(result[0].items).toHaveLength(2);
    });
  });

  describe('cancel()', () => {
    beforeEach(async () => {
      await build();
      orderRepo.save.mockImplementation(async (o) => o);
      paymentRepo.update.mockResolvedValue({ affected: 1 });
    });

    it('cancela una orden PENDING y marca el pago pendiente como FAILED', async () => {
      const existing = fullOrder();
      existing.shipments = [];
      orderRepo.findOne.mockResolvedValue(existing);

      await service.cancel('order-1', 'buyer-1');

      expect(existing.status).toBe(OrderStatus.CANCELLED);
      expect(orderRepo.save).toHaveBeenCalledWith(existing);
      expect(paymentRepo.update).toHaveBeenCalledWith(
        { orderId: 'order-1', status: PaymentStatus.PENDING },
        { status: PaymentStatus.FAILED },
      );
    });

    it('NO cancela una orden que ya salió de PENDING (ADR-003)', async () => {
      const existing = fullOrder();
      existing.status = OrderStatus.CONFIRMED;
      orderRepo.findOne.mockResolvedValue(existing);

      await expect(service.cancel('order-1', 'buyer-1')).rejects.toThrow('solo PENDING');
      expect(orderRepo.save).not.toHaveBeenCalled();
    });

    it('no expone la orden de otro usuario (404)', async () => {
      orderRepo.findOne.mockResolvedValue(fullOrder());
      await expect(service.cancel('order-1', 'buyer-otro')).rejects.toThrow('no encontrada');
    });
  });
});