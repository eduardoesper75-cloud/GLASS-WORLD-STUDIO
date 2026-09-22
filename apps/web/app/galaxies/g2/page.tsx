'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/use-auth';
import { useMarketplace, type CategoryTier } from '@/lib/hooks/use-api';
import { useCart } from '@/lib/hooks/use-cart';
import { useToast } from '@/components/ui/toast';
import { ButtonLink, Button } from '@/components/ui/button';
import { Badge, Pagination, Price, Spinner } from '@/components/ui/feedback';
import { Field, Input, Select, SelectOption } from '@/components/ui/form';
import { Card, CardBody, CardFooter, CardMeta, CardTitle, Skeleton } from '@/components/ui/surface';

import { Alert } from '@/components/ui/feedback';
import { getGalaxy } from '@/lib/galaxies';
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

export default function GalaxyMarketplacePage() {
  const t = useTranslations('marketplace');
  const tg = useTranslations('gate');
  const tc = useTranslations('common');
  const { user, loading } = useAuth();
  const { push } = useToast();
  const cart = useCart();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryTier | ''>('');
  const [page, setPage] = useState(1);

  const { products, total, hasMore, loading: catalogLoading, error } = useMarketplace({
    categoryTier: category || undefined,
    search: search.trim() || undefined,
    page,
    limit: 12,
  });

  if (loading) {
    return (
      <div className="gw-page" style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
        <Spinner label="loading" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="gw-page" style={{ maxWidth: 560, marginInline: 'auto', padding: '60px 0', textAlign: 'center' }}>
        <span aria-hidden="true" style={{ fontSize: 34, fontFamily: 'var(--font-mono)' }}>◆</span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, marginTop: 8 }}>{tg('title')}</h1>
        <p style={{ opacity: 0.85, marginTop: 10 }}>{tg('note')}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 22 }}>
          <ButtonLink href="/login" variant="primary">{tg('loginToContinue')}</ButtonLink>
          <ButtonLink href="/plans" variant="ghost">{tc('continue')}</ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="gw-page" style={{ padding: '40px 0' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30 }}>
            <span aria-hidden="true">◆</span> {getGalaxy('marketplace')?.id} Marketplace
          </h1>
          <p style={{ opacity: 0.8, marginTop: 6 }}>{t('sub')}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Badge variant="galaxy">
            {cart.count} {t('cartCount')} · <Price value={cart.totalUsd} />
          </Badge>
          <ButtonLink href="/checkout" variant="primary">{t('goCheckout')}</ButtonLink>
        </div>
      </div>

      <div className="gw-filter" style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Field htmlFor="mk-search">
          <Input
            id="mk-search"
            placeholder={t('searchPh')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </Field>
        <Select
          aria-label={t('filters')}
          value={category}
          onChange={(e) => {
            setCategory(e.target.value as CategoryTier | '');
            setPage(1);
          }}
        >
          <SelectOption value="">{t('all')}</SelectOption>
          {TIERS.map((x) => (
            <SelectOption key={x.value} value={x.value}>{t(x.key as never)}</SelectOption>
          ))}
        </Select>
        {(search || category) && (
          <button
            type="button"
            className="gw-btn gw-btn--ghost"
            onClick={() => {
              setSearch('');
              setCategory('');
              setPage(1);
            }}
          >
            {t('clearFilters')}
          </button>
        )}
      </div>

      {error && (
        <Alert tone="danger" style={{ marginTop: 20 }}>
          {tc('network')}
        </Alert>
      )}

      {catalogLoading ? (
        <div className="gw-grid" style={{ marginTop: 24 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} style={{ minHeight: 180 }} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p style={{ opacity: 0.7, marginTop: 40, textAlign: 'center' }}>{t('noResults')}</p>
      ) : (
        <div className="gw-grid" style={{ marginTop: 24 }}>
          {products.map((p) => (
            <Card key={p.id} tone="glass" className="glass-edge">
              <CardBody>
                <CardMeta style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <Badge variant="neutral">{t(TIERS.find((x) => x.value === p.categoryTier)?.key as never) ?? p.categoryTier}</Badge>
                  <span style={{ opacity: 0.65, fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                    {p.sellerCountryCode}
                  </span>
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
              <CardFooter>
                <Button
                  variant="primary"
                  block
                  onClick={() => {
                    cart.add({
                      productId: p.id,
                      name: p.name,
                      priceUsd: p.unitPrice,
                      unit: p.unitOfMeasure,
                      currency: 'USD',
                      qty: Math.max(p.minimumOrderQuantity ?? 1, 1),
                    });
                    push({ message: `${p.name} → cart` });
                  }}
                >
                  {t('addToCart')}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {!catalogLoading && !error && total > 0 && (
        <div style={{ marginTop: 28 }}>
          <Pagination page={page} hasMore={hasMore} onChange={setPage} />
        </div>
      )}

      <p style={{ marginTop: 40, opacity: 0.55, fontSize: 12, textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
        ◈/◆ GLASS WORLD STUDIO · G2 MARKETPLACE
      </p>
    </div>
  );
}