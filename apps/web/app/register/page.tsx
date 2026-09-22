'use client';

import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { registerSchema, type RegisterForm } from '@/lib/validators';
import { useAuth } from '@/lib/hooks/use-auth';
import { useCurrentLocale } from '@/lib/i18n/locale-context';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Checkbox, Field, Input, Label } from '@/components/ui/form';

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterInner />
    </Suspense>
  );
}

function RegisterInner() {
  const t = useTranslations('auth');
  const tc = useTranslations('carta');
  const { register } = useAuth();
  const { push } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const galaxy = searchParams.get('galaxy') ?? 'g2';
  const preferredLanguage = useCurrentLocale() === 'es' ? 'es' : 'en';

  const [form, setForm] = useState<RegisterForm>({
    fullName: '',
    email: '',
    username: '',
    password: '',
    privacyAccepted: false as never,
    preferredLanguage: 'es',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterForm, string>>>({});
  const [busy, setBusy] = useState(false);

  function set<K extends keyof RegisterForm>(key: K, value: RegisterForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      const next: Partial<Record<keyof RegisterForm, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof RegisterForm;
        if (key in next) continue;
        next[key] = tc(issue.message as never);
      }
      setErrors(next);
      return;
    }
    setBusy(true);
    try {
      await register({
        ...parsed.data,
        privacyAccepted: parsed.data.privacyAccepted === true,
        preferredLanguage,
      });
      push({ message: t('registerSuccess') });
      router.replace('/dashboard');
    } catch (err) {
      const e = err as { code?: string; message?: string };
      const isTaken = e.code === 'USERNAME_TAKEN' || e.code === 'EMAIL_IN_USE' || e.code === 'CONFLICT';
      push({ message: isTaken ? t('usernameTaken') : (e.message ?? tc('privacyRequired')), tone: 'danger' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="gw-page gw-inline" style={{ maxWidth: 460, marginInline: 'auto', padding: '40px 0' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 28 }} aria-hidden="true">◈</span>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, marginTop: 4 }}>{t('submitRegister')}</h1>

      <form onSubmit={onSubmit} noValidate style={{ display: 'grid', gap: 16, marginTop: 24 }}>
        <Field label={t('fullName')} hint={t('fullNamePh')} error={errors.fullName} htmlFor="reg-fullName" required>
          <Input id="reg-fullName" autoComplete="name" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} />
        </Field>
        <Field label={t('email')} error={errors.email} htmlFor="reg-email" required>
          <Input id="reg-email" type="email" autoComplete="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
        </Field>
        <Field label={t('username')} error={errors.username} htmlFor="reg-username" required>
          <Input id="reg-username" autoComplete="username" value={form.username} onChange={(e) => set('username', e.target.value)} />
        </Field>
        <Field label={t('password')} error={errors.password} htmlFor="reg-password" required>
          <Input id="reg-password" type="password" autoComplete="new-password" value={form.password} onChange={(e) => set('password', e.target.value)} />
        </Field>

        <div className="gw-field">
          <Label className="gw-field__label">{t('privacy')}</Label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <Checkbox
              id="reg-privacy"
              checked={form.privacyAccepted === true}
              onChange={(e) => set('privacyAccepted', e.target.checked as never)}
            />
            <label htmlFor="reg-privacy" style={{ fontSize: 13, opacity: 0.85 }}>{t('privacyAgree')}</label>
          </div>
          {errors.privacyAccepted && (
            <span className="gw-field__hint" role="alert" style={{ color: 'var(--sat-glow)' }}>{errors.privacyAccepted}</span>
          )}
        </div>

        {galaxy && (
          <p style={{ fontSize: 13, opacity: 0.7, fontFamily: 'var(--font-mono)' }}>
            Galaxy: {galaxy}
          </p>
        )}

        <Button type="submit" variant="primary" disabled={busy} block>
          {busy ? '…' : t('submitRegister')}
        </Button>

        <p style={{ textAlign: 'center', fontSize: 14, opacity: 0.8 }}>
          {t('haveAccount')}{' '}
          <Link href="/login" style={{ textDecoration: 'underline' }}>{t('submitLogin')}</Link>
        </p>
      </form>
    </div>
  );
}