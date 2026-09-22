'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/hooks/use-cart';
import { useAuth } from '@/lib/hooks/use-auth';
import { createOrder } from '@/lib/hooks/use-orders';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Alert, Spinner } from '@/components/ui/feedback';
import { Card, CardBody, CardFooter } from '@/components/ui/surface';
import { Field, Input, Select, SelectOption } from '@/components/ui/form';
import type { CreateOrderPayload, PaymentMethod } from '@/lib/types';

export default function CheckoutPage() {
  const t = useTranslations('marketplace');
  const to = useTranslations('orders');
  const { items, totalUsd, count, setQty, clear } = useCart();
  const { user } = useAuth();
  const { push } = useToast();
  const router = useRouter();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: user?.fullName ?? '',
    line1: '',
    line2: '',
    city: '',
    region: '',
    postalCode: '',
    countryCode: 'AR',
    phone: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card_usd');

  const set = (key: keyof typeof form) => (value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  async function handleSubmit() {
    if (busy) return;
    if (!user) {
      push({ message: 'login required', tone: 'danger' });
      router.replace('/login?next=/checkout');
      return;
    }
    if (items.length === 0) return;

    const address: CreateOrderPayload['address'] = {
      fullName: form.fullName.trim(),
      line1: form.line1.trim(),
      line2: form.line2.trim() || undefined,
      city: form.city.trim(),
      region: form.region.trim() || undefined,
      postalCode: form.postalCode.trim(),
      countryCode: form.countryCode.trim().toUpperCase(),
      phone: form.phone.trim() || undefined,
    };

    if (!address.fullName || !address.line1 || !address.city || !address.postalCode || !/^[A-Z]{2}$/.test(address.countryCode)) {
      setError('Check address fields: fullName, line1, city, postalCode and country (2-letter ISO).');
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const order = await createOrder({
        items: items.map((i) => ({ productId: i.productId, quantity: i.qty })),
        address,
        paymentMethod,
      });
      clear();
      push({ message: to('orderPending') });
      router.replace(`/orders/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
      setBusy(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="gw-page" style={{ maxWidth: 560, marginInline: 'auto', padding: '60px 0', textAlign: 'center' }}>
        <span aria-hidden="true" style={{ fontSize: 34, fontFamily: 'var(--font-mono)' }}>◇</span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginTop: 8 }}>{to('empty')}</h1>
        <p style={{ opacity: 0.8, marginTop: 10, fontFamily: 'var(--font-mono)' }}>gws / 0 items</p>
        <div style={{ marginTop: 22 }}>
          <Button variant="primary" onClick={() => router.replace('/galaxies/g2')}>{to('emptyCta')}</Button>
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
            <div key={i.productId} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <strong>{i.name}</strong>
                <div style={{ opacity: 0.7, fontSize: 13, fontFamily: 'var(--font-mono)' }}>{i.unit}</div>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{i.qty}</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{(i.priceUsd * i.qty).toFixed(2)} USD</span>
              <button type="button" className="gw-btn gw-btn--ghost" onClick={() => setQty(i.productId, i.qty + 1)} aria-label="+">+</button>
            </div>
          ))}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, marginTop: 18 }}>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, marginBottom: 10 }}>{to('address')}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <Field label={to('fullName')} required>
                    <Input value={form.fullName} onChange={(e) => set('fullName')(e.target.value)} />
                  </Field>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <Field label={to('line1')} required>
                    <Input value={form.line1} onChange={(e) => set('line1')(e.target.value)} />
                  </Field>
                </div>
                <Field label={to('line2')}>
                  <Input value={form.line2} onChange={(e) => set('line2')(e.target.value)} />
                </Field>
                <Field label={to('city')} required>
                  <Input value={form.city} onChange={(e) => set('city')(e.target.value)} />
                </Field>
                <Field label={to('region')}>
                  <Input value={form.region} onChange={(e) => set('region')(e.target.value)} />
                </Field>
                <Field label={to('postalCode')} required>
                  <Input value={form.postalCode} onChange={(e) => set('postalCode')(e.target.value)} />
                </Field>
                <Field label={to('countryCode')}>
                  <Input value={form.countryCode} maxLength={2} style={{ textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }} onChange={(e) => set('countryCode')(e.target.value)} />
                </Field>
                <div style={{ gridColumn: '1 / -1' }}>
                  <Field label={to('phone')}>
                    <Input value={form.phone} onChange={(e) => set('phone')(e.target.value)} />
                  </Field>
                </div>
              </div>
            </div>

            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, marginBottom: 10 }}>{to('paymentMethod')}</p>
              <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
                <SelectOption value="card_usd">{to('payCard')}</SelectOption>
                <SelectOption value="usdt_trc20">{to('payTrc20')}</SelectOption>
                <SelectOption value="usdt_polygon">{to('payPolygon')}</SelectOption>
              </Select>
            </div>
          </div>
        </CardBody>
        <CardFooter style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' }}>
          <span style={{ marginRight: 'auto', fontFamily: 'var(--font-mono)' }}>{count} × {totalUsd.toFixed(2)} USD</span>
          {busy && <Spinner />}
          <Button variant="ghost" onClick={() => clear()} disabled={busy}>Clear</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={busy}>
            {busy ? to('placing') : to('submit')}
          </Button>
        </CardFooter>
      </Card>

      {error && <Alert tone="danger" style={{ marginTop: 16 }}>{error}</Alert>}
    </div>
  );
}