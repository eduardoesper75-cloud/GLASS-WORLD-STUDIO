'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useG2Products, type CategoryTier } from '@/lib/hooks/use-api';
import { Badge, Pagination, Price } from '@/components/ui/feedback';
import { Field, Input, Select, SelectOption } from '@/components/ui/form';
import { Card, CardBody, CardMeta, CardTitle, Skeleton } from '@/components/ui/surface';
import { Alert } from '@/components/ui/feedback';

import type { UnitOfMeasure } from '@/lib/types';

const TIERS: { value: CategoryTier; key: string }[] = [
  { value: 'insumos_criticos', key: 'tier_insumos' },
  { value: 'pro_tools_machinery', key: 'tier_tools' },
  { value: 'servicios_industriales', key: 'tier_services' },
  { value: 'obras_terminadas', key: 'tier_obras' },
];

const UNITS: Record<UnitOfMeasure, string> = {
  kg: 'unit_kg',
  tonelada: 'unit_ton',
  metro_lineal: 'unit_m',
  unidad: 'unit_unit',
  litro: 'unit_l',
};

/** Acento G2 (spec CA1) sobre el desfase del token del skill (#4FA8D8). */
const G2_ACCENT = '#4A90E2';

export default function G2ListadoPage() {
  const t = useTranslations('marketplace');
  const tc = useTranslations('common');

  const [category, setCategory] = useState<CategoryTier | ''>('');
  const [brand, setBrand] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [page, setPage] = useState(1);

  const { products, total, hasMore, loading, error } = useG2Products({
    category: category || undefined,
    brand: brand.trim() || undefined,
    priceMin: priceMin !== '' ? Number(priceMin) : undefined,
    priceMax: priceMax !== '' ? Number(priceMax) : undefined,
    page,
    limit: 12,
  });

  const activeFilters = category !== '' || brand.trim() !== '' || priceMin !== '' || priceMax !== '';

  const resetFilters = () => {
    setCategory('');
    setBrand('');
    setPriceMin('');
    setPriceMax('');
    setPage(1);
  };

  const onFilterChange = (fn: (v: string) => void) => (next: string | number) => {
    fn(String(next));
    setPage(1);
  };

  return (
    <div className="gw-page" style={{ padding: '40px 0' }}>
      <header style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30 }}>
          <span aria-hidden="true" style={{ color: G2_ACCENT }}>◆</span> {t('title')}
        </h1>
        <p style={{ opacity: 0.8, marginTop: 6, maxWidth: 640 }}>{t('sub')}</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 28, alignItems: 'start' }}>
        <aside
          className="glass"
          aria-label={t('filters')}
          style={{ padding: 20, borderRadius: 'var(--glass-radius)', position: 'sticky', top: 24 }}
        >
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: G2_ACCENT }}>{t('filters')}</h2>

          <div style={{ marginTop: 18 }}>
            <Field label={t('category')} htmlFor="g2-category">
              <Select
                id="g2-category"
                aria-label={t('category')}
                value={category}
                onChange={(e) => onFilterChange(setCategory as (v: string) => void)(e.target.value)}
              >
                <SelectOption value="">{tc('all')}</SelectOption>
                {TIERS.map((x) => (
                  <SelectOption key={x.value} value={x.value}>{t(x.key as never)}</SelectOption>
                ))}
              </Select>
            </Field>
          </div>

          <div style={{ marginTop: 14 }}>
            <Field label={t('brand')} htmlFor="g2-brand">
              <Input
                id="g2-brand"
                type="text"
                placeholder={t('brandPh')}
                value={brand}
                onChange={(e) => onFilterChange(setBrand)(e.target.value)}
              />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
            <Field label={t('priceMin')} htmlFor="g2-price-min">
              <Input
                id="g2-price-min"
                type="number"
                min={0}
                inputMode="decimal"
                step="any"
                value={priceMin}
                onChange={(e) => onFilterChange(setPriceMin)(e.target.value)}
              />
            </Field>
            <Field label={t('priceMax')} htmlFor="g2-price-max">
              <Input
                id="g2-price-max"
                type="number"
                min={0}
                inputMode="decimal"
                step="any"
                value={priceMax}
                onChange={(e) => onFilterChange(setPriceMax)(e.target.value)}
              />
            </Field>
          </div>

          {activeFilters && (
            <button type="button" className="gw-btn gw-btn--ghost" style={{ width: '100%', marginTop: 16 }} onClick={resetFilters}>
              {t('clearFilters')}
            </button>
          )}
        </aside>

        <section style={{ minWidth: 0 }}>
          {error && <Alert tone="danger">{tc('network')}</Alert>}

          {loading ? (
            <div className="gw-grid" style={{ marginTop: 4 }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} style={{ minHeight: 240 }} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <p style={{ opacity: 0.7, marginTop: 40, textAlign: 'center' }}>{t('noResults')}</p>
          ) : (
            <div className="gw-grid">
              {products.map((p) => (
                <Card key={p.id} tone="glass" className="glass-edge" data-testid="g2-card">
                  <CardBody>
                    <CardMeta style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                      <Badge variant="neutral">{t(TIERS.find((x) => x.value === p.categoryTier)?.key as never) ?? p.categoryTier}</Badge>
                      {p.brand ? (
                        <span style={{ color: G2_ACCENT, fontFamily: 'var(--font-mono)', fontSize: 12 }}>{p.brand}</span>
                      ) : (
                        <span style={{ opacity: 0.65, fontSize: 12, fontFamily: 'var(--font-mono)' }}>{p.sellerCountryCode}</span>
                      )}
                    </CardMeta>
                    <CardTitle style={{ marginTop: 10 }}>{p.name}</CardTitle>
                    <div style={{ opacity: 0.85, fontSize: 14, marginTop: 8 }}>
                      <Price value={p.unitPrice} /> / {t(UNITS[p.unitOfMeasure] as never)}
                    </div>
                    <div className="gw-spec" style={{ marginTop: 10 }}>
                      <span className="gw-spec__key">{t('moq')}</span>
                      <span className="gw-spec__value">{p.minimumOrderQuantity ?? 1}</span>
                      <span className="gw-spec__key">{t('msds')}</span>
                      <span className="gw-spec__value">{p.requiresMsds ? p.msdsUrl ?? 'yes' : 'no'}</span>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}

          <div
            style={{
              marginTop: 28,
              minHeight: 34,
              visibility: loading || error || total === 0 ? 'hidden' : 'visible',
            }}
          >
            <Pagination page={page} hasMore={hasMore} onChange={setPage} />
          </div>
        </section>
      </div>

      <p style={{ marginTop: 40, opacity: 0.55, fontSize: 12, textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
        ◈/◆ GLASS WORLD STUDIO · G2 · {total} {t('unit_unit')}
      </p>
    </div>
  );
}