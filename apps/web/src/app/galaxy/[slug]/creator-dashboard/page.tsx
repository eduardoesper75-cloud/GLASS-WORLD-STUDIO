import { notFound } from 'next/navigation';

import { MasterCreatorDashboard } from '@/components/MasterCreatorDashboard';

export default async function MasterCreatorDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug !== '1-maestros') {
    notFound();
  }

  return <MasterCreatorDashboard />;
}
