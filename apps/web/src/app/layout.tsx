import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { LanguageProvider } from '@/components/LanguageProvider';
import { LegalStyles } from '@/components/LegalStyles';
import { PrivacyConsent } from '@/components/PrivacyConsent';
import { site } from '@/lib/site';

import './globals.css';

export const metadata: Metadata = {
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.shortName}`,
  },
  description: site.description,
};

export const viewport: Viewport = {
  themeColor: '#05080c',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body>
        <LanguageProvider>{children}</LanguageProvider>
        <LegalStyles />
        <PrivacyConsent />
      </body>
    </html>
  );
}
