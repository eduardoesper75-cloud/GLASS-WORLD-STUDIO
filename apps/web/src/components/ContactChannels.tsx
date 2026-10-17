'use client';

import { useLanguage } from '@/components/LanguageProvider';
import { getMessage } from '@/lib/i18n';
import { contact } from '@/lib/site';

/**
 * Los 4 puntos de contacto oficiales de Glass World Studio.
 * Sitio, correo institucional (Don Web), correo personal y WhatsApp directo.
 * Ambos correos quedan como botones separados para poder elegir el canal.
 */
export function ContactChannels({ className }: { className?: string }) {
  const { language } = useLanguage();

  return (
    <ul className={`contact-channels${className ? ` ${className}` : ''}`}>
      <li>
        <a
          className="contact-channels__link"
          href={contact.site}
          rel="noreferrer noopener"
          target="_blank"
        >
          <span className="contact-channels__label">{getMessage(language, 'contactWeb')}</span>
          <span className="contact-channels__value">{contact.siteLabel}</span>
        </a>
      </li>
      <li>
        <a className="contact-channels__link" href={contact.emailInstitutionalHref}>
          <span className="contact-channels__label">
            {getMessage(language, 'contactEmailInstitutional')}
          </span>
          <span className="contact-channels__value">{contact.emailInstitutional}</span>
        </a>
      </li>
      <li>
        <a className="contact-channels__link" href={contact.emailPersonalHref}>
          <span className="contact-channels__label">
            {getMessage(language, 'contactEmailPersonal')}
          </span>
          <span className="contact-channels__value">{contact.emailPersonal}</span>
        </a>
      </li>
      <li>
        <a
          className="contact-channels__link"
          href={contact.whatsappHref}
          rel="noreferrer noopener"
          target="_blank"
        >
          <span className="contact-channels__label">{getMessage(language, 'contactWhatsapp')}</span>
          <span className="contact-channels__value">{contact.whatsapp}</span>
        </a>
      </li>
    </ul>
  );
}
