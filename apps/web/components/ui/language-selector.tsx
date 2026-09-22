'use client';

import { LOCALES, type Locale } from '@/lib/i18n/messages';
import { cn } from '@/lib/utils';

const FULL_NAMES: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  zh: '中文',
};

export function LanguageSelector({ locale, onChange, className }: { locale: Locale; onChange: (l: Locale) => void; className?: string }) {
  return (
    <select
      aria-label="language"
      value={locale}
      onChange={(e) => onChange(e.target.value as Locale)}
      className={cn('gw-select', className)}
      style={{ width: 'auto', minWidth: 108 }}
    >
      {LOCALES.map((l) => (
        <option key={l} value={l}>
          {FULL_NAMES[l]}
        </option>
      ))}
    </select>
  );
}