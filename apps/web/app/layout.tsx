import type { Metadata } from 'next';
import { IBM_Plex_Mono, Instrument_Serif, Inter } from 'next/font/google';
import { AppProviders } from '@/components/providers/app-providers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import '../../../design-system/gws-design-tokens.css';
import '../../../design-system/gws-components.css';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const instrumentSerif = Instrument_Serif({
  weight: ['400'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});
const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://glassworldstudio.com'),
  title: 'Glass World Studio',
  description: 'Una plataforma con alma de taller que se fortalece con tu crecimiento.',
  openGraph: {
    title: 'Glass World Studio',
    description: 'Una plataforma con alma de taller.',
    images: ['/opengraph-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/opengraph-image.jpg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${instrumentSerif.variable} ${ibmPlexMono.variable}`}>
        <AppProviders>
          <div className="gw-app" data-galaxy="g2" style={{ minHeight: '100dvh' }}>
            <Header />
            <main className="gw-container" style={{ flex: 1 }}>
              {children}
            </main>
            <Footer />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}