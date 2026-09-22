import { GALAXIES } from './galaxies';
import type { PlansCatalogDto, QuoteDto } from './types';

/**
 * GWS · Tarifario de planes (cliente).
 * La fuente primaria es `GET /subscriptions/plans` (backend). Este módulo
 * expone los DEFAULTS de marketing (mismos precios flauta que el seed de
 * base de datos) para render estático / fallback y la matemática de
 * fidelización (10/15/20 % para 3/6/12 meses — misma fuente: backend
 * LOYALTY_DISCOUNTS_PERCENT).
 */

export const LOYALTY_PERIODS = [1, 3, 6, 12] as const;

export const LOYALTY_DISCOUNTS_PERCENT: Record<number, number> = {
  1: 0,
  3: 10,
  6: 15,
  12: 20,
};

/** Fallback de exhibición (idéntico al seed oficial). El catálogo real se
 * reemplaza al resolver las planes desde la API. */
export const DEFAULT_PLANS: PlansCatalogDto = {
  currency: 'USD',
  discounts: LOYALTY_PERIODS.map((months) => ({
    months,
    discountPercent: LOYALTY_DISCOUNTS_PERCENT[months],
  })),
  plans: [
    { galaxy: 'g1', monthlyPriceUsd: 59, currency: 'USD' },
    { galaxy: 'g2', monthlyPriceUsd: 24, currency: 'USD' },
    { galaxy: 'g3', monthlyPriceUsd: 14, currency: 'USD' },
    { galaxy: 'g4', monthlyPriceUsd: 99, currency: 'USD' },
    { galaxy: 'g5', monthlyPriceUsd: 349, currency: 'USD' },
    { galaxy: 'g6', monthlyPriceUsd: 129, currency: 'USD' },
  ],
  editable: false,
};

export interface PlanWithMeta {
  galaxy: string;
  monthlyPriceUsd: number;
  currency: string;
  slug: string;
  icon: string;
  color: string;
  /** ¿Galaxia "comerciable" con catálogo público (G2 en MVP)? */
  hasCatalog: boolean;
}

export function plansWithMeta(catalog: PlansCatalogDto): PlanWithMeta[] {
  return catalog.plans.map((p) => {
    const galaxy = GALAXIES.find((g) => g.apiId === p.galaxy);
    return {
      ...p,
      slug: galaxy?.slug ?? p.galaxy,
      icon: galaxy?.icon ?? '✦',
      color: galaxy?.color ?? '#9aa0a8',
      hasCatalog: p.galaxy === 'g2',
    };
  });
}

/** Cotización local (espejo de GET /subscriptions/quote). */
export function quoteLocal(catalog: PlansCatalogDto, galaxy: string, months: number): QuoteDto | null {
  const plan = catalog.plans.find((p) => p.galaxy === galaxy);
  if (!plan) return null;
  const discount = LOYALTY_DISCOUNTS_PERCENT[months] ?? 0;
  const perPeriodTotalUsd = Math.round(plan.monthlyPriceUsd * months * (1 - discount / 100) * 100) / 100;
  return {
    galaxy,
    monthlyPriceUsd: plan.monthlyPriceUsd,
    currency: plan.currency,
    months,
    discountPercent: discount,
    perPeriodTotalUsd,
  };
}

export function planForGalaxy(catalog: PlansCatalogDto, galaxy: string): PlanWithMeta | undefined {
  return plansWithMeta(catalog).find((p) => p.galaxy === galaxy);
}