'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useMyOrders } from '@/lib/hooks/use-orders';
import { Badge, Spinner } from '@/components/ui/feedback';
import { Card, CardBody } from '@/components/ui/surface';
import type { BadgeVariant } from '@/components/ui/feedback';

const STATUS_BADGE: Record<string, BadgeVariant> = {
  pending: 'galaxy',
  confirmed: 'verified',
  shipped: 'galaxy',
  delivered: 'verified',
  cancelled: 'neutral',
};

export default function OrdersPage() {
  const t = useTranslations('orders');
  const { orders, loading, error } = useMyOrders();

  return (
    <div className="gw-page" style={{ maxWidth: 760, marginInline: 'auto', padding: '40px 0' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28 }}>{t('title')}</h1>

      {loading && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 24 }}>
          <Spinner /> <span style={{ opacity: 0.7 }}>{t('placedAt')}…</span>
        </div>
      )}

      {error && !loading && (
        <p style={{ color: 'var(--sat-glow)', marginTop: 20, fontFamily: 'var(--font-mono)' }}>
          {error instanceof Error ? error.message : String(error)}
        </p>
      )}

      {!loading && !error && orders.length === 0 && (
        <p style={{ opacity: 0.8, marginTop: 24 }}>{t('noOrders')}</p>
      )}

      {!loading && orders.length > 0 && (
        <div style={{ display: 'grid', gap: 12, marginTop: 20 }}>
          {orders.map((o) => (
            <Link key={o.id} href={`/orders/${o.id}`} style={{ textDecoration: 'none' }}>
              <Card tone="glass" className="glass-edge">
                <CardBody style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 14, alignItems: 'center', padding: '14px 18px' }}>
                  <div>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>{o.id.slice(0, 8).toUpperCase()}</strong>
                    <div style={{ opacity: 0.7, fontSize: 13 }}>{new Date(o.createdAt).toLocaleString()}</div>
                  </div>
                  <Badge variant={STATUS_BADGE[o.status] ?? 'neutral'}>{o.status}</Badge>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{o.total.toFixed(2)} {o.currency}</span>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}