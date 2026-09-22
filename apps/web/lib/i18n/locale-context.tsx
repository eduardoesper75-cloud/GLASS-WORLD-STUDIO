'use client';

import { createContext, useContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { NextIntlClientProvider, useLocale } from 'next-intl';
import type { AbstractIntlMessages } from 'next-intl';
import { DEFAULT_LOCALE, LOCALES, MESSAGES, type Locale } from './messages';

const STORAGE_KEY = 'gws.locale';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => undefined,
});

function initialLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && LOCALES.includes(stored)) return stored;
    const nav = navigator.language.split('-')[0] as Locale;
    if (nav && LOCALES.includes(nav)) return nav;
  } catch {
    /* localStorage indisponible → default */
  }
  return DEFAULT_LOCALE;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.lang = next;
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);

  return (
    <LocaleContext.Provider value={value}>
      <NextIntlClientProvider
        locale={locale}
        messages={MESSAGES[locale] as unknown as AbstractIntlMessages}
        onError={() => undefined}
        getMessageFallback={() => '…'}
      >
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}

export function useLocaleContext(): LocaleContextValue {
  return useContext(LocaleContext);
}

export function useCurrentLocale(): Locale {
  return useLocale() as Locale;
}