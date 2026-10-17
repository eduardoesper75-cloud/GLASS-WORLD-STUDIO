'use client';

import { ContactChannels } from '@/components/ContactChannels';
import { useLanguage } from '@/components/LanguageProvider';
import { getMessage } from '@/lib/i18n';
import { site } from '@/lib/site';

/**
 * Pie de página global. Deja visibles y funcionales los tres canales
 * oficiales en todas las vistas (declaración de principios, §2).
 */
export function SiteFooter() {
  const { language } = useLanguage();

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__heading">
          <strong>{site.name}</strong>
          <p className="site-footer__title">{getMessage(language, 'contactTitle')}</p>
        </div>
        <ContactChannels />
      </div>
    </footer>
  );
}
