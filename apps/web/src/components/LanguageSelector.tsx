'use client';

import { LANGUAGES } from '@/lib/i18n';
import { getMessage } from '@/lib/i18n';
import { useLanguage } from '@/components/LanguageProvider';

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
          onClick={() => setLanguage(option.code)}
        >
          {option.flags.map((flag) => (
            <span key={flag} aria-hidden="true">
              {flag}
            </span>
          ))}
        </button>
      ))}
    </nav>
  );
}
