import de from '@/locales/de.json';
import en from '@/locales/en.json';
import es from '@/locales/es.json';
import fr from '@/locales/fr.json';
import it from '@/locales/it.json';
import pt from '@/locales/pt.json';
import zh from '@/locales/zh.json';

export const LANGUAGES = [
  { code: 'es', name: 'Español', label: 'ES' },
  { code: 'en', name: 'English', label: 'EN' },
  { code: 'pt', name: 'Português', label: 'PT' },
  { code: 'it', name: 'Italiano', label: 'IT' },
  { code: 'fr', name: 'Français', label: 'FR' },
  { code: 'de', name: 'Deutsch', label: 'DE' },
  { code: 'zh', name: '中文', label: '中文' },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];

type LocaleBundle = typeof es;

export const localeData = {
  es,
  en,
  pt,
  it,
  fr,
  de,
  zh,
} satisfies Record<LanguageCode, LocaleBundle>;

export type MessageKey = keyof LocaleBundle['messages'];

export function getMessage(language: LanguageCode, key: MessageKey): string {
  return localeData[language].messages[key];
}

export function isLanguageCode(value: string): value is LanguageCode {
  return LANGUAGES.some((language) => language.code === value);
}
