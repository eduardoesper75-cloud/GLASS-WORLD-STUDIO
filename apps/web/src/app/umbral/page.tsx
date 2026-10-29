import { getTaxonomyView } from '@/lib/taxonomy';

import { AccessThresholdClient } from './threshold-client';

export default function AccessThresholdPage() {
  const taxonomyView = getTaxonomyView();

  return <AccessThresholdClient taxonomyView={taxonomyView} />;
}
