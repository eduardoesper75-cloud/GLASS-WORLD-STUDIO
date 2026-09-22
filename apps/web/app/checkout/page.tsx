'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/hooks/use-cart';
import { useAuth } from '@/lib/hooks/use-auth';
import { useToast } from '@/components/ui/toast';
import { Button, ButtonLink } from '@/components/ui/button';
import { Alert } from '@/components/ui/feedback';
import { Card, CardBody, CardFooter, CardTitle } from '@/components/ui/surface';
import { Price } from '@/components/ui/feedback';

export default function CheckoutPage() {
  const t = useTranslations('marketplace');
  const tc = useTranslations('common');
  const { items, totalUsd, count, setQty, clear } = useCart();
  const { user } = useAuth();
  const { push } = useToast();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="gw-page" style={{ maxWidth: 560, marginInline: 'auto', padding: '60px 0', textAlign: 'center' }}>
        <span aria-hidden="true" style={{ fontSize: 34, fontFamily: 'var(--font-mono)' }}>◇</span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginTop: 8 }}>{t('goCheckout')}</h1>
        <p style={{ opacity: 0.8, marginTop: 10 }}>{tc('continue')}</p>
        <div style={{ marginTop: 22 }}>
          <ButtonLink href="/galaxies/g2" variant="primary">{t('openProduct')}</ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="gw-page" style={{ maxWidth: 720, marginInline: 'auto', padding: '40px 0' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28 }}>{t('goCheckout')}</h1>

      <Card tone="glass" className="glass-edge" style={{ marginTop: 20 }}>
        <CardBody>
          {items.map((i) => (
            <div key={i.productId} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <strong>{i.name}</strong>
                <div style={{ opacity: 0.7, fontSize: 13, fontFamily: 'var(--font-mono)' }}>{i.unit}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button type="button" className="gw-btn gw-btn--ghost" onClick={() => setQty(i.productId, i.qty - 1)} aria-label="-">−</button>
                <span style={{ minWidth: 28, textAlign: 'center' }}>{i.qty}</span>
                <button type="button" className="gw-btn gw-btn--ghost" onClick={() => setQty(i.productId, i.qty + 1)} aria-label="+">+</button>
              </div>
              <Price value={i.priceUsd * i.qty} />
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 14, fontWeight: 600 }}>
            <span>{count} · {t('cartCount')}</span>
            <Price value={totalUsd} />
          </div>
        </CardBody>
        <CardFooter style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={() => { clear(); push({ message: t('clearFilters') }); }}>
            {tc('cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (!user) {
                push({ message: 'login required', tone: 'danger' });
                router.replace('/login');
                return;
              }
              push({ message: 'checkout: próximamente (POST /orders P0)', tone: 'danger' });
            }}
          >
            {t('goCheckout')}
          </Button>
        </CardFooter>
      </Card>

      <Alert tone="warn" style={{ marginTop: 20 }}>
        <p>El checkout real (POST /orders, idempotent, ADR-001) se habilita en la próxima fase. Tu carrito queda guardado localmente.</p>
      </Alert>
    </div>
  );
}