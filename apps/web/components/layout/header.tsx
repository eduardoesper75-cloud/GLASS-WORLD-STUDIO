'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { useLocaleContext } from '@/lib/i18n/locale-context';
import { Button, ButtonLink } from '@/components/ui/button';
import { LanguageSelector } from '@/components/ui/language-selector';
import { Avatar, ConfirmDialog } from '@/components/ui/misc';

export function Header() {
  const t = useTranslations('nav');
  const ta = useTranslations('auth');
  const { user, logout } = useAuth();
  const { locale, setLocale } = useLocaleContext();
  const [confirmLogout, setConfirmLogout] = useState(false);

  return (
    <header className="gw-nav">
      <Link href="/" className="gw-nav__brand">
        Glass World Studio
      </Link>
      <nav className="gw-nav__links" aria-label="main">
        <Link href="/" className="gw-nav__link"> {t('home')} </Link>
        <Link href="/plans" className="gw-nav__link"> {t('plans')} </Link>
        <Link href="/galaxies/g2" className="gw-nav__link"> {t('marketplace')} </Link>
        <Link href="/dashboard" className="gw-nav__link"> {t('dashboard')} </Link>
      </nav>
      <span className="gw-nav__spacer" />
      <LanguageSelector locale={locale} onChange={setLocale} />
      {user ? (
        <div className="gw-nav__user">
          <button
            type="button"
            className="gw-nav__link"
            onClick={() => setConfirmLogout(true)}
            aria-haspopup="dialog"
          >
            <Avatar name={user.fullName} size={26} />
            {t('logout')}
          </button>
          <ConfirmDialog
            open={confirmLogout}
            title={t('logout')}
            message={ta('logoutConfirm')}
            confirmLabel={t('logout')}
            danger
            onCancel={() => setConfirmLogout(false)}
            onConfirm={() => {
              setConfirmLogout(false);
              void logout();
            }}
          />
        </div>
      ) : (
        <div className="gw-nav__actions" style={{ display: 'flex', gap: 8 }}>
          <ButtonLink href="/login" variant="ghost">
            {t('login')}
          </ButtonLink>
          <ButtonLink href="/register" variant="primary">
            {t('register')}
          </ButtonLink>
        </div>
      )}
    </header>
  );
}