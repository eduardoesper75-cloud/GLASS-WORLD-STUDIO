import type { Metadata } from 'next';

import { AnnouncementsIndex } from '@/components/AnnouncementsIndex';
import { announcements } from '@/lib/announcements';

export const metadata: Metadata = {
  title: 'Novedades',
  description:
    'Trilogía comunicacional de Glass World Studio: reaparición en la plataforma, convocatoria de alianzas estratégicas y modelo de alianza.',
};

export default function AnnouncementsIndexPage() {
  return <AnnouncementsIndex announcements={announcements} />;
}
