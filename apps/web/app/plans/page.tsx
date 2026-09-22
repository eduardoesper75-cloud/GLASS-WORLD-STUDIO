'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { DEFAULT_PLANS, LOYALTY_PERIODS, planForGalaxy, plansWithMeta, quoteLocal } from '@/lib/plans';
import { usePlans } from '@/lib/hooks/use-api';
import { Button, ButtonLink } from '@/components/ui/button';
import { Badge, Price, Spinner } from '@/components/ui/feedback';
import { FacetedButton } from '@/components/ui/form';
import { Alert } from '@/components/ui/feedback';
import { Card, CardBody, CardFooter, CardMeta, CardTitle } from '@/components/ui/surface';

export default function PlansPage() {
  const t = useTranslations('plans');
  const { catalog, loading } = usePlans();
  const activeCatalog = catalog ?? DEFAULT_PLANS;
  const [months, setMonths] = useState<number>(1);

  const plans = useMemo(() => plansWithMeta(activeCatalog), [activeCatalog]);

  return (
    <div className="gw-page" style={{ padding: '48px 0' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.2rem)' }}>{t('title')}</h1>
      <p style={{ maxWidth: 620, opacity: 0.85, marginTop: 12 }}>{t('sub')}</p>

      {loading && (
        <div style={{ margin: '32px 0' }}>
          <Spinner label="loading plans" />
        </div>
      )}

      <div className="gw-tabs" role="tablist" aria-label="period" style={{ marginTop: 28 }}>
        {LOYALTY_PERIODS.map((m) => (
          <FacetedButton key={m} active={months === m} onClick={() => setMonths(m)} aria-label={`${m} ${t('months')}`}>
            {m} {m === 1 ? t('monthsShort') : t('months')}
          </FacetedButton>
        ))}
        <span style={{ alignSelf: 'center', marginLeft: 16, fontSize: 13, opacity: 0.8 }}>{t('loyaltyNote')}</span>
      </div>

      <div className="gw-grid" style={{ marginTop: 28, alignItems: 'stretch' }}>
        {plans.map((p) => {
          const quote = quoteLocal(activeCatalog, p.galaxy, months);
          const discount = quote?.discountPercent ?? 0;
          const meta = planForGalaxy(activeCatalog, p.galaxy);
          return (
            <Card key={p.galaxy} tone="glass" className="glass-edge" data-galaxy={p.galaxy}>
              <CardBody>
                <CardMeta>
                  <Badge variant={p.galaxy === 'g2' ? 'galaxy' : 'neutral'}>
                    {p.icon} {p.galaxy.toUpperCase()}
                  </Badge>
                </CardMeta>
                <CardTitle style={{ fontFamily: 'var(--font-display)' }}>{meta?.slug ?? p.galaxy}</CardTitle>
                <div style={{ fontSize: 22, fontWeight: 600, margin: '8px 0' }}>
                  <Price value={p.monthlyPriceUsd} />
                  <span style={{ opacity: 0.7, fontSize: 13, fontWeight: 400 }}> {t('perMonth')}</span>
                </div>
                {discount > 0 && (
                  <Badge variant="verified">–{discount}% {t('discount')}</Badge>
                )}
                {quote && (
                  <p style={{ opacity: 0.85, fontSize: 14, marginTop: 10 }}>
                    {t('total')}: <Price value={quote.perPeriodTotalUsd} /> / {months} {months === 1 ? t('monthsShort') : t('months')}
                  </p>
                )}
              </CardBody>
              <CardFooter>
                <ButtonLink href={`/umbral?galaxy=${p.galaxy}`} variant={p.galaxy === 'g2' ? 'primary' : 'ghost'} block>
                  {t('choose')}
                </ButtonLink>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <Alert tone="info" style={{ marginTop: 36, maxWidth: 720 }}>
        <p>{t('membershipNote')}</p>
        <p style={{ marginTop: 8, opacity: 0.85 }}>{t('subscriberUnavailable')}</p>
        <Button variant="ghost" style={{ marginTop: 12 }} onClick={() => void (location.href = '/umbral')}>
          {t('enrollCta')}
        </Button>
      </Alert>
    </div>
  );
}