import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { AnnouncementView } from '@/components/AnnouncementView';
import { announcements, getAnnouncement } from '@/lib/announcements';
import { site } from '@/lib/site';

type AnnouncementPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return announcements.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: AnnouncementPageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getAnnouncement(slug);

  if (!item) {
    return { title: `Novedades · ${site.shortName}` };
  }

  return {
    title: `${item.title} · ${site.shortName}`,
    description: item.lead[0],
  };
}

export default async function AnnouncementPage({ params }: AnnouncementPageProps) {
  const { slug } = await params;
  const item = getAnnouncement(slug);

  if (!item) {
    notFound();
  }

  return <AnnouncementView announcement={item} />;
}
