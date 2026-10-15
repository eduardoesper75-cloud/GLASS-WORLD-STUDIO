'use client';

import { useLanguage } from '@/components/LanguageProvider';
import { getMessage, LANGUAGES } from '@/lib/i18n';

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <nav
      className="language-selector"
      aria-label={getMessage(language, 'selectLanguage')}
      lang={language}
    >
      {LANGUAGES.map((option) => (
        <button
          key={option.code}
          className={`language-selector__option${language === option.code ? ' is-selected' : ''}`}
          type="button"
          lang={option.code}
          aria-label={option.name}
          aria-pressed={language === option.code}
          title={option.name}
          onClick={() => setLanguage(option.code)}
        >
          <span aria-hidden="true">{option.label}</span>
        </button>
      ))}
    </nav>
  );
}
