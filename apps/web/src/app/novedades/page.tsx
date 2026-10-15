import type { Metadata } from 'next';

import { AnnouncementsIndex } from '@/components/AnnouncementsIndex';
import { announcements } from '@/lib/announcements';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: `Novedades · ${site.shortName}`,
  description:
    'Trilogía comunicacional de Glass World Studio: reaparición en la plataforma, convocatoria de alianzas estratégicas y modelo de alianza.',
};

export default function AnnouncementsIndexPage() {
  return <AnnouncementsIndex announcements={announcements} />;
}
