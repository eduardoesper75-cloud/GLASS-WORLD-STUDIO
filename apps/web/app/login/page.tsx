'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { loginSchema, type LoginForm } from '@/lib/validators';
import { useAuth } from '@/lib/hooks/use-auth';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/form';

export default function LoginPage() {
  const t = useTranslations('auth');
  const tc = useTranslations('carta');
  const { login } = useAuth();
  const { push } = useToast();
  const router = useRouter();

  const [form, setForm] = useState<LoginForm>({ identifier: '', password: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginForm, string>>>({});
  const [busy, setBusy] = useState(false);

  function set<K extends keyof LoginForm>(key: K, value: LoginForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) {
      const next: Partial<Record<keyof LoginForm, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof LoginForm;
        if (key in next) continue;
        next[key] = tc(issue.message as never);
      }
      setErrors(next);
      return;
    }
    setBusy(true);
    try {
      await login(parsed.data);
      push({ message: t('loginSuccess') });
      router.replace('/dashboard');
    } catch (err) {
      const e = err as { code?: string; message?: string };
      push({
        message: e.code === 'UNAUTHORIZED' || e.code === 'INVALID_CREDENTIALS' ? t('invalidCredentials') : (e.message ?? t('invalidCredentials')),
        tone: 'danger',
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="gw-page gw-inline" style={{ maxWidth: 460, marginInline: 'auto', padding: '40px 0' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 28 }} aria-hidden="true">◇</span>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, marginTop: 4 }}>{t('submitLogin')}</h1>

      <form onSubmit={onSubmit} noValidate style={{ display: 'grid', gap: 16, marginTop: 24 }}>
        <Field label={t('identifier')} hint={t('identifierPh')} error={errors.identifier} htmlFor="login-id" required>
          <Input id="login-id" autoComplete="username" value={form.identifier} onChange={(e) => set('identifier', e.target.value)} />
        </Field>
        <Field label={t('password')} error={errors.password} htmlFor="login-password" required>
          <Input id="login-password" type="password" autoComplete="current-password" value={form.password} onChange={(e) => set('password', e.target.value)} />
        </Field>

        <Button type="submit" variant="primary" disabled={busy} block>
          {busy ? '…' : t('submitLogin')}
        </Button>

        <p style={{ textAlign: 'center', fontSize: 14, opacity: 0.8 }}>
          {t('noAccount')}{' '}
          <Link href="/register" style={{ textDecoration: 'underline' }}>{t('submitRegister')}</Link>
        </p>
      </form>
    </div>
  );
}