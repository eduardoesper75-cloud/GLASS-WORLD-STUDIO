/**
 * G2 · Listado (spec g2-listado) — tests del query-builder del hook.
 * El contrato del endpoint (D3) devuelve {items,total,page,pageSize};
 * `g2Key` traduce G2ListParams a la querystring real de GET /g2/products.
 */

import { g2Key } from '@/lib/hooks/use-api';

describe('g2Key query-builder', () => {
  it('defaults: page=1 y limit=12 sin filtros (CA2 paginación)', () => {
    expect(g2Key({})).toBe('/g2/products?page=1&limit=12');
  });

  it('incluye category y brand cuando están presentes', () => {
    expect(g2Key({ category: 'insumos_criticos', brand: 'Sintec' })).toBe(
      '/g2/products?category=insumos_criticos&brand=Sintec&page=1&limit=12',
    );
  });

  it('omite brand vacío/espacios en blanco', () => {
    expect(g2Key({ brand: '   ' })).toBe('/g2/products?page=1&limit=12');
  });

  it('mapea precio min/max a price_min/price_max (nombres del backend)', () => {
    expect(g2Key({ priceMin: 5, priceMax: 500, page: 2 })).toBe(
      '/g2/products?price_min=5&price_max=500&page=2&limit=12',
    );
  });

  it('ignora priceMin/priceMax no numéricos (undefined falla a default)', () => {
    expect(g2Key({ priceMin: Number.NaN, page: 3 })).toBe('/g2/products?page=3&limit=12');
  });

  it('respeta limit explícito menor al default', () => {
    expect(g2Key({ limit: 20 })).toBe('/g2/products?page=1&limit=20');
  });
});