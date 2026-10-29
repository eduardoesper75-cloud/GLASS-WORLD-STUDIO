import { notFound } from 'next/navigation';

import { GalaxyOneDashboard } from '@/components/GalaxyOneDashboard';
import { OtherGalaxyDashboard } from '@/components/OtherMembershipDashboards';
import { dashboardModules } from '@/lib/dashboard';
import { galaxyPathById } from '@/lib/membership';
import { getTaxonomyView } from '@/lib/taxonomy';

const galaxyIdBySlug = Object.fromEntries(
  Object.entries(galaxyPathById).map(([id, path]) => [path.split('/').at(-1), id]),
);

export default async function GalaxyDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const galaxyId = galaxyIdBySlug[slug];
  if (!galaxyId) {
    notFound();
  }

  if (galaxyId === 'masters') {
    const taxonomyView = getTaxonomyView();
    return <GalaxyOneDashboard taxonomyView={taxonomyView} />;
  }

  const module = dashboardModules.find((item) => item.id === galaxyId);
  if (!module) {
    notFound();
  }

  return <OtherGalaxyDashboard module={module} />;
}
