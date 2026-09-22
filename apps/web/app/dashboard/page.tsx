'use client';

import { useTranslations } from 'next-intl';
import { ProtectedRoute } from '@/components/providers/protected-route';
import { useAuth } from '@/lib/hooks/use-auth';
import { useSubscriptions } from '@/lib/hooks/use-api';
import { Avatar, Reveal } from '@/components/ui/misc';
import { Badge, Price, Spinner } from '@/components/ui/feedback';
import { ButtonLink } from '@/components/ui/button';
import { Card, CardBody, CardMeta, CardTitle } from '@/components/ui/surface';
import type { UserSubscription } from '@/lib/types';

function toSubs(value: unknown): UserSubscription[] {
  if (Array.isArray(value)) return value as UserSubscription[];
  if (value && typeof value === 'object' && Array.isArray((value as { subs?: unknown }).subs)) {
    return (value as { subs: UserSubscription[] }).subs;
  }
  return [];
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardInner />
    </ProtectedRoute>
  );
}

function DashboardInner() {
  const t = useTranslations('dashboard');
  const { user } = useAuth();
  const { subs, loading } = useSubscriptions(user);
  const list = toSubs(subs);

  return (
    <div className="gw-page" style={{ padding: '40px 0' }}>
      <Reveal>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <Avatar name={user?.fullName} size={44} />
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28 }}>
              {t('greeting')} {user?.fullName}
            </h1>
            <p style={{ opacity: 0.75, fontSize: 14, fontFamily: 'var(--font-mono)' }}>
              @{user?.username} · {t('role')}: {user?.role}
            </p>
          </div>
        </div>
      </Reveal>

      <section style={{ marginTop: 40 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>{t('yourSubs')}</h2>
        {loading ? (
          <div style={{ marginTop: 16 }}>
            <Spinner label="loading subs" />
          </div>
        ) : list.length === 0 ? (
          <div className="gw-card glass glass-edge" style={{ marginTop: 16, maxWidth: 560 }}>
            <div className="gw-card__body">
              <p>{t('noSub')}</p>
              <div style={{ marginTop: 14 }}>
                <ButtonLink href="/plans" variant="primary">
                  {t('subscribe')}
                </ButtonLink>
              </div>
            </div>
          </div>
        ) : (
          <div className="gw-grid" style={{ marginTop: 16 }}>
            {list.map((s) => {
              const active = s.status === 'active';
              return (
                <Card key={s.id}>
                  <CardBody>
                    <CardMeta>
                      <Badge variant={active ? 'galaxy' : 'neutral'}>{active ? t('active') : t('expired')}</Badge>
                    </CardMeta>
                    <CardTitle>{s.galaxy.toUpperCase()} · {s.periodMonths}</CardTitle>
                    <p style={{ opacity: 0.85, fontSize: 14 }}>
                      {t('until')}{' '}
                      <span style={{ fontFamily: 'var(--font-mono)', opacity: 0.7 }}>{s.paidThrough}</span>
                    </p>
                    <p style={{ marginTop: 8 }}><Price value={s.pricePerPeriodUsd} /></p>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}