import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

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
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
