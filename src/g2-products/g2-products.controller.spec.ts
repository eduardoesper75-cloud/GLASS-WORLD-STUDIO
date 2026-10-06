import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { G2ProductsController } from './g2-products.controller';
import { G2ProductsService } from './g2-products.service';
import { MarketplaceService } from '../marketplace/marketplace.service';

/**
 * GWS · Tests del listado G2 (spec g2-listado, CA2/CA3/CA4)
 * ------------------------------------------------------------
 * HTTP real sobre el controller con MarketplaceService mockeado:
 * valida el contrato de la querystring (DTO + ValidationPipe con
 * whitelist/forbidNonWhitelisted igual que main.ts), la forma de la
 * respuesta {items,total,page,pageSize} (D3) y la delegación de
 * filtros category/brand/price_min/price_max al motor del
 * marketplace. La lógica de construcción de la query vive en
 * marketplace.service.spec.ts.
 */
describe('G2ProductsController (e2e, HTTP)', () => {
  let app: INestApplication;
  let marketplaceService: { listProducts: jest.Mock };

  beforeEach(async () => {
    marketplaceService = { listProducts: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      controllers: [G2ProductsController],
      providers: [
        G2ProductsService,
        { provide: MarketplaceService, useValue: marketplaceService },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  const pageResult = (overrides: Record<string, unknown> = {}) => ({
    items: [{ id: 'p-1', name: 'Varilla 6mm' }],
    total: 42,
    page: 1,
    limit: 20,
    hasMore: true,
    ...overrides,
  });

  it('GET /g2/products devuelve 200 con la forma {items,total,page,pageSize} (D3)', async () => {
    marketplaceService.listProducts.mockResolvedValue(pageResult());

    const res = await request(app.getHttpServer()).get('/g2/products');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      items: [{ id: 'p-1', name: 'Varilla 6mm' }],
      total: 42,
      page: 1,
      pageSize: 20,
    });
  });

  it('GET /api/g2/products responde el mismo contrato (alias CA2)', async () => {
    marketplaceService.listProducts.mockResolvedValue(pageResult());

    const res = await request(app.getHttpServer()).get('/api/g2/products');

    expect(res.status).toBe(200);
    expect(res.body.pageSize).toBe(20);
    expect(res.body).not.toHaveProperty('hasMore');
    expect(res.body).not.toHaveProperty('limit');
  });

  it('delega filtros category/brand/price_min/price_max y paginación (CA3)', async () => {
    marketplaceService.listProducts.mockResolvedValue(pageResult());

    const res = await request(app.getHttpServer())
      .get('/g2/products')
      .query(
        'category=insumos_criticos&brand=Sintec&price_min=5&price_max=500&page=2&limit=10',
      );

    expect(res.status).toBe(200);
    expect(marketplaceService.listProducts).toHaveBeenCalledWith(
      {
        categoryTier: 'insumos_criticos',
        brand: 'Sintec',
        priceMin: 5,
        priceMax: 500,
      },
      2,
      10,
      { field: 'id', dir: 'ASC' },
    );
  });

  it('usa defaults page=1 y limit=20 sin query (CA2 paginación)', async () => {
    marketplaceService.listProducts.mockResolvedValue(pageResult());

    await request(app.getHttpServer()).get('/g2/products');

    expect(marketplaceService.listProducts).toHaveBeenCalledWith(
      {
        categoryTier: undefined,
        brand: undefined,
        priceMin: undefined,
        priceMax: undefined,
      },
      1,
      20,
      { field: 'id', dir: 'ASC' },
    );
  });

  it('página vacía responde 200 con items:[] y el total real (CA4)', async () => {
    marketplaceService.listProducts.mockResolvedValue(
      pageResult({ items: [], total: 42, page: 9, hasMore: false }),
    );

    const res = await request(app.getHttpServer())
      .get('/g2/products')
      .query('page=9');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ items: [], total: 42, page: 9, pageSize: 20 });
    expect(marketplaceService.listProducts).toHaveBeenCalledWith(
      expect.anything(),
      9,
      20,
      { field: 'id', dir: 'ASC' },
    );
  });

  it('400 cuando limit supera 100 (CA4)', async () => {
    const res = await request(app.getHttpServer())
      .get('/g2/products')
      .query('limit=101');

    expect(res.status).toBe(400);
    expect(marketplaceService.listProducts).not.toHaveBeenCalled();
  });

  it('400 cuando page < 1 (CA4)', async () => {
    const res = await request(app.getHttpServer())
      .get('/g2/products')
      .query('page=0');

    expect(res.status).toBe(400);
    expect(marketplaceService.listProducts).not.toHaveBeenCalled();
  });

  it('400 cuando un parámetro no es numérico (page=abc)', async () => {
    const res = await request(app.getHttpServer())
      .get('/g2/products')
      .query('page=abc');

    expect(res.status).toBe(400);
    expect(marketplaceService.listProducts).not.toHaveBeenCalled();
  });

  it('400 ante parámetros no declarados (whitelist del contrato)', async () => {
    const res = await request(app.getHttpServer())
      .get('/g2/products')
      .query('foo=1');

    expect(res.status).toBe(400);
    expect(marketplaceService.listProducts).not.toHaveBeenCalled();
  });

  it('400 cuando category no es un tier válido', async () => {
    const res = await request(app.getHttpServer())
      .get('/g2/products')
      .query('category=no_existe');

    expect(res.status).toBe(400);
    expect(marketplaceService.listProducts).not.toHaveBeenCalled();
  });
});
