'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cancelOrder, useOrder } from '@/lib/hooks/use-orders';
import { useToast } from '@/components/ui/toast';
import { Badge, Spinner, Alert } from '@/components/ui/feedback';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/surface';
import type { BadgeVariant } from '@/components/ui/feedback';

const STATUS_BADGE: Record<string, BadgeVariant> = {
  pending: 'galaxy',
  confirmed: 'verified',
  shipped: 'galaxy',
  delivered: 'verified',
  cancelled: 'neutral',
};

export default function OrderDetailPage() {
  const raw = useParams<{ id: string }>();
  const id = Array.isArray(raw.id) ? raw.id[0] : raw.id;
  const t = useTranslations('orders');
  const { order, loading, error, refresh } = useOrder(id ?? null);
  const { push } = useToast();
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);

  async function handleCancel() {
    if (!order || cancelling) return;
    if (!window.confirm(`Cancel ${order.id.slice(0, 8).toUpperCase()}?`)) return;
    setCancelling(true);
    try {
      await cancelOrder(order.id);
      push({ message: t('status') + ' → cancelled' });
      refresh();
    } catch (err) {
      push({ message: err instanceof Error ? err.message : 'Cancel failed', tone: 'danger' });
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <div className="gw-page" style={{ maxWidth: 760, marginInline: 'auto', padding: '40px 0' }}>
        <Spinner />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="gw-page" style={{ maxWidth: 760, marginInline: 'auto', padding: '40px 0' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28 }}>{t('notFound')}</h1>
        <Alert tone="warn" style={{ marginTop: 16 }}>
          <p>{error instanceof Error ? error.message : String(error ?? '400')}</p>
        </Alert>
        <div style={{ marginTop: 18 }}>
          <Button variant="ghost" onClick={() => router.replace('/orders')}>← {t('title')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="gw-page" style={{ maxWidth: 760, marginInline: 'auto', padding: '40px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28 }}>
          {t('detail')} · <span style={{ fontFamily: 'var(--font-mono)', fontSize: 22 }}>{order.id.slice(0, 12).toUpperCase()}</span>
        </h1>
        <Badge variant={STATUS_BADGE[order.status] ?? 'neutral'}>{order.status}</Badge>
      </div>

      <p style={{ opacity: 0.7, fontFamily: 'var(--font-mono)', fontSize: 13, marginTop: 6 }}>
        {t('placedAt')} {new Date(order.createdAt).toLocaleString()}
      </p>

      <Card tone="glass" className="glass-edge" style={{ marginTop: 20 }}>
        <CardBody>
          {order.items.map((i) => (
            <div key={i.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <strong>{i.productName}</strong>
                <div style={{ opacity: 0.7, fontSize: 13, fontFamily: 'var(--font-mono)' }}>@{i.unitAmount.toFixed(2)} USD</div>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{t('qty')} {i.quantity}</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{i.lineTotal.toFixed(2)} USD</span>
              <span style={{ opacity: 0.6, fontFamily: 'var(--font-mono)', fontSize: 12 }}>{i.productId.slice(0, 6)}</span>
            </div>
          ))}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, marginTop: 18 }}>
            {order.address ? (
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, marginBottom: 8 }}>{t('address')}</p>
                <p style={{ opacity: 0.85, fontSize: 14, lineHeight: 1.5 }}>
                  {order.address.fullName}<br />
                  {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ''}<br />
                  {order.address.city}{order.address.region ? `, ${order.address.region}` : ''} · {order.address.postalCode}<br />
                  {order.address.countryCode}{order.address.phone ? ` · ☎ ${order.address.phone}` : ''}
                </p>
              </div>
            ) : null}
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, marginBottom: 8 }}>{t('paymentMethod')}</p>
              {order.payments.length > 0 ? (
                order.payments.map((p) => (
                  <div key={p.id} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <Badge variant={p.status === 'captured' ? 'verified' : p.status === 'failed' ? 'alert' : 'neutral'}>{p.status}</Badge>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14 }}>{p.paymentMethod} · {p.amount.toFixed(2)} USD</span>
                  </div>
                ))
              ) : (
                <p style={{ opacity: 0.7, fontSize: 14 }}>—</p>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      <div style={{ display: 'flex', gap: 16, marginTop: 18, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-mono)' }}>
          {t('subtotal')} {order.subtotal.toFixed(2)} · {t('shipping')} {order.shippingTotal.toFixed(2)} · {t('tax')} {order.taxTotal.toFixed(2)}
        </span>
        <strong style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>{t('total')} {order.total.toFixed(2)} {order.currency}</strong>
        {order.status === 'pending' && (
          <Button variant="danger" onClick={handleCancel} disabled={cancelling}>
            {cancelling ? '…' : t('cancel')}
          </Button>
        )}
      </div>

      <div style={{ marginTop: 18 }}>
        <Link href="/galaxies/g2" style={{ opacity: 0.8 }}>← {t('emptyCta')}</Link>
      </div>
    </div>
  );
}