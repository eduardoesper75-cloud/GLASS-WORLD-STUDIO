'use client';

import { ContactChannels } from '@/components/ContactChannels';
import { useLanguage } from '@/components/LanguageProvider';
import { getMessage } from '@/lib/i18n';
import { contact } from '@/lib/site';

/**
 * Pieza visual de la campaña de convocatoria abierta.
 * El flyer enlaza al sitio oficial; debajo, los tres canales de contacto.
 *
 * `landing` se usa como banda en la portada; `threshold` reemplaza el arte
 * decorativo del paso de identidad del Umbral.
 */
export function ConvocatoriaFlyer({ variant = 'landing' }: { variant?: 'landing' | 'threshold' }) {
  const { language } = useLanguage();
  const titleId = `convocatoria-title-${variant}`;

  return (
    <section className={`convocatoria convocatoria--${variant}`} aria-labelledby={titleId}>
      <a
        className="convocatoria__poster"
        href={contact.site}
        rel="noreferrer noopener"
        target="_blank"
      >
        <img
          alt={getMessage(language, 'convocatoriaImageAlt')}
          height="1152"
          src="/gws-convocatoria-flyer.jpg"
          width="928"
        />
      </a>

      <div className="convocatoria__copy">
        <h2 id={titleId}>{getMessage(language, 'convocatoriaTitle')}</h2>
        {variant === 'landing' && (
          <p className="convocatoria__lead">{getMessage(language, 'convocatoriaLead')}</p>
        )}
        <ContactChannels className="convocatoria__channels" />
      </div>
    </section>
  );
}
