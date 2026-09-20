import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

describe('OrdersController (e2e, HTTP)', () => {
  let app: INestApplication;
  let ordersService: {
    create: jest.Mock;
    findByUser: jest.Mock;
    findById: jest.Mock;
    cancel: jest.Mock;
  };

  const build = async () => {
    ordersService = {
      create: jest.fn(),
      findByUser: jest.fn(),
      findById: jest.fn(),
      cancel: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: ordersService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx) => {
          ctx.switchToHttp().getRequest().user = { id: 'user-1' };
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();
  };

  const validBody = () => ({
    idempotencyKey: 'key-abc-12345',
    items: [{ productId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', quantity: 2 }],
    address: {
      fullName: 'Jorge',
      line1: 'Av. Siempre Viva 742',
      city: 'Springfield',
      postalCode: '1425',
      countryCode: 'AR',
    },
    paymentMethod: 'card_usd',
  });

  beforeEach(async () => {
    await build();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /orders crea la orden y la devuelve con status 201', async () => {
    const body = validBody();
    ordersService.create.mockResolvedValue({ id: 'order-1', status: 'pending' });

    const res = await request(app.getHttpServer()).post('/orders').send(body);
    expect(res.status).toBe(201);
    expect(ordersService.create).toHaveBeenCalledWith('user-1', expect.objectContaining(body));
    expect(res.body).toEqual({ id: 'order-1', status: 'pending' });
  });

  it('POST /orders rechaza un body inválido (400) con detail de la validación', async () => {
    const res = await request(app.getHttpServer())
      .post('/orders')
      .send({ idempotencyKey: 'k', items: [], address: { countryCode: 'ARG' } });
    expect(res.status).toBe(400);
    expect(ordersService.create).not.toHaveBeenCalled();
  });

  it('rechaza propiedades no esperadas (whitelist on) para proteger el contrato', async () => {
    const body = validBody();
    body['extraProp'] = true;
    const res = await request(app.getHttpServer()).post('/orders').send(body);
    expect(res.status).toBe(400);
  });

  it('GET /orders lista las órdenes del comprador (200)', async () => {
    ordersService.findByUser.mockResolvedValue([]);
    const res = await request(app.getHttpServer()).get('/orders').query({});
    expect(res.status).toBe(200);
    expect(ordersService.findByUser).toHaveBeenCalledWith('user-1');
    expect(res.body).toEqual([]);
  });

  it('GET /orders/:id devuelve la orden detallada (200) y valida que sea UUID', async () => {
    ordersService.findById.mockResolvedValue({ id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d' });
    const res = await request(app.getHttpServer()).get(
      '/orders/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    );
    expect(res.status).toBe(200);
    expect(ordersService.findById).toHaveBeenCalledWith(
      '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
      'user-1',
    );
  });

  it('GET /orders/no-uuid devuelve 400 (ParseUUIDPipe)', async () => {
    const res = await request(app.getHttpServer()).get('/orders/no-uuid');
    expect(res.status).toBe(400);
  });

  it('POST /orders/:id/cancel cancela la orden (201)', async () => {
    ordersService.cancel.mockResolvedValue({ id: 'order-1', status: 'cancelled' });
    const res = await request(app.getHttpServer()).post(
      '/orders/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d/cancel',
    );
    expect(res.status).toBe(201);
    expect(ordersService.cancel).toHaveBeenCalledWith(
      '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
      'user-1',
    );
  });
});