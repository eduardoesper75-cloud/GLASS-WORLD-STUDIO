import 'server-only';

import { buildTaxonomyView } from '@/lib/taxonomy-projection';
import type { TaxonomyView } from '@/lib/taxonomy-contract';

/**
 * Frontera server-only de GWS-WEB-001. El cálculo se mantiene en un módulo
 * puro para poder verificarlo con Node/CI sin cargar `server-only` en el
 * bundle cliente.
 */
export function getTaxonomyView(): TaxonomyView {
  return buildTaxonomyView();
}
