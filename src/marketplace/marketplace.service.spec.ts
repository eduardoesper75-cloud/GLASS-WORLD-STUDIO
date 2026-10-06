import { MarketplaceService } from './marketplace.service';
import { ProductCategoryTier } from './marketplace.enums';

/**
 * GWS · Tests de filtros del catálogo (spec g2-listado, CA3/CA4)
 * ------------------------------------------------------------
 * Unitarios sobre buildFilteredQuery/listProducts con una query
 * builder falsa que registra cada cláusula: sin DB. Cubre marca,
 * rango de precio, combinaciones, clamping de límite y página
 * vacía — la lógica que el controller G2 delega sin ver.
 */
describe('MarketplaceService — filtros del catálogo G2', () => {
  type Clause = { sql: string; params?: Record<string, unknown> };

  class FakeQb {
    clauses: Clause[] = [];
    skipValue = 0;
    takeValue = 0;
    rows: unknown[] = [];
    total = 0;

    where(sql: string, params?: Record<string, unknown>) {
      this.clauses.push({ sql, params });
      return this;
    }
    andWhere(sql: string, params?: Record<string, unknown>) {
      this.clauses.push({ sql, params });
      return this;
    }
    skip(n: number) {
      this.skipValue = n;
      return this;
    }
    take(n: number) {
      this.takeValue = n;
      return this;
    }
    orderBy() {
      return this;
    }
    addOrderBy() {
      return this;
    }
    async getManyAndCount() {
      return [this.rows, this.total];
    }
  }

  let fake: FakeQb;
  let service: MarketplaceService;

  beforeEach(() => {
    fake = new FakeQb();
    const repo = { createQueryBuilder: jest.fn(() => fake) } as never;
    service = new MarketplaceService(repo, {} as never, {} as never);
  });

  const clause = (needle: string): Clause | undefined =>
    fake.clauses.find((c) => c.sql.includes(needle));

  it('filtra por marca exacta (CA3: brand como filtro)', async () => {
    await service.listProducts({ brand: 'Sintec' });

    const c = clause('product.brand = :brand');
    expect(c).toBeDefined();
    expect(c!.params).toEqual({ brand: 'Sintec' });
  });

  it('filtra por rango de precio unitario (price_min / price_max inclusivos)', async () => {
    await service.listProducts({ priceMin: 5, priceMax: 500 });

    expect(clause('product.unitPrice >= :priceMin')!.params).toEqual({
      priceMin: 5,
    });
    expect(clause('product.unitPrice <= :priceMax')!.params).toEqual({
      priceMax: 500,
    });
  });

  it('combina categoría + marca + precio sobre la misma query (CA3 combinados)', async () => {
    await service.listProducts({
      categoryTier: ProductCategoryTier.INSUMOS_CRITICOS,
      brand: 'Schott',
      priceMin: 1,
      priceMax: 100,
    });

    expect(clause('product.categoryTier = :tier')!.params).toEqual({
      tier: ProductCategoryTier.INSUMOS_CRITICOS,
    });
    expect(clause('product.brand = :brand')!.params).toEqual({
      brand: 'Schott',
    });
    expect(clause('product.unitPrice >= :priceMin')).toBeDefined();
    expect(clause('product.unitPrice <= :priceMax')).toBeDefined();
    expect(clause('product.active = true')).toBeDefined();
  });

  it('sin filtros solo exige activos (sin cláusulas extra)', async () => {
    await service.listProducts({});

    expect(fake.clauses).toHaveLength(1);
    expect(fake.clauses[0].sql).toContain('product.active = true');
  });

  it('acota limit a 100 y calcula skip/take por página (CA2 paginación)', async () => {
    const result = await service.listProducts({}, 3, 500);

    expect(fake.takeValue).toBe(100);
    expect(fake.skipValue).toBe(200); // (3-1) * 100
    expect(result.limit).toBe(100);
    expect(result.page).toBe(3);
  });

  it('página vacía devuelve items:[] con el total (CA4)', async () => {
    fake.rows = [];
    fake.total = 42;

    const result = await service.listProducts({ brand: 'Marca inexistente' }, 9, 20);

    expect(result.items).toEqual([]);
    expect(result.total).toBe(42);
    expect(result.page).toBe(9);
    expect(result.limit).toBe(20);
    expect(result.hasMore).toBe(false); // 9*20 >= 42
  });
});
