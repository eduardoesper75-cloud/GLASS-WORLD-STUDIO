import { DEFAULT_PLANS, LOYALTY_DISCOUNTS_PERCENT, plansWithMeta, quoteLocal, planForGalaxy } from '@/lib/plans';

describe('plans (tarifario + fidelización)', () => {
  it('quoteLocal aplica descuento 10/15/20 % para 3/6/12 meses (g2 = 24 USD)', () => {
    const q3 = quoteLocal(DEFAULT_PLANS, 'g2', 3);
    expect(q3).not.toBeNull();
    expect(q3?.discountPercent).toBe(10);
    expect(q3?.perPeriodTotalUsd).toBeCloseTo(72 * 0.9, 2);
    expect(quoteLocal(DEFAULT_PLANS, 'g2', 12)?.perPeriodTotalUsd).toBeCloseTo(24 * 12 * 0.8, 2);
    expect(quoteLocal(DEFAULT_PLANS, 'g2', 1)?.perPeriodTotalUsd).toBeCloseTo(24, 2);
  });

  it('quoteLocal devuelve null para galaxia sin plan', () => {
    expect(quoteLocal(DEFAULT_PLANS, 'gx', 1)).toBeNull();
  });

  it('planesWithMeta enlaza slug e icono por apiId y marca G2 como comerciable', () => {
    const metas = plansWithMeta(DEFAULT_PLANS);
    expect(metas).toHaveLength(6);
    const g2 = metas.find((p) => p.galaxy === 'g2');
    expect(g2?.hasCatalog).toBe(true);
    expect(g2?.icon).toBeTruthy();
    expect(planForGalaxy(DEFAULT_PLANS, 'g1')?.slug).toBeTruthy();
  });

  it('los periodos de fidelidad coinciden con la tabla de descuentos', () => {
    expect(LOYALTY_DISCOUNTS_PERCENT[3]).toBe(10);
    expect(LOYALTY_DISCOUNTS_PERCENT[6]).toBe(15);
    expect(LOYALTY_DISCOUNTS_PERCENT[12]).toBe(20);
  });
});