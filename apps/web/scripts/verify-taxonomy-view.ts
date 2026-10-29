import { createTaxonomyIndex } from '@gws/taxonomy';

import {
  MEMBERSHIP_STORAGE_KEY,
  createMembershipPreferences,
  readMembershipPreferences,
  validateMembershipPreferences,
} from '../src/lib/membership';
import { buildTaxonomyView } from '../src/lib/taxonomy-projection';
import { selectLocalizedLabel } from '../src/lib/taxonomy-contract';

const canonical = createTaxonomyIndex().taxonomy;
const view = buildTaxonomyView();
const canonicalIds = canonical.nodes.map((node) => node.id).sort();
const viewIds = view.specialties.map((specialty) => specialty.id).sort();

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function assertThrows(action: () => void, message: string): void {
  try {
    action();
  } catch {
    return;
  }

  throw new Error(message);
}

assert(view.pillarCount === 3, `Expected 3 pillars, got ${view.pillarCount}`);
assert(view.totalNodes === 20, `Expected 20 nodes, got ${view.totalNodes}`);
assert(view.specialties.length === 20, `Expected 20 specialties, got ${view.specialties.length}`);
assert(
  JSON.stringify(viewIds) === JSON.stringify(canonicalIds),
  'Specialty IDs do not match canonical IDs',
);

assert(
  selectLocalizedLabel({ fr: 'Français' }, 'fr') === 'Français',
  'Language fallback did not prefer the active language',
);
assert(
  selectLocalizedLabel({ en: 'English', es: 'Español' }, 'de') === 'English',
  'Language fallback did not fall back to English',
);
assert(
  selectLocalizedLabel({ es: 'Español' }, 'zh') === 'Español',
  'Language fallback did not fall back to Spanish',
);

const canonicalSpecialtyId = canonicalIds[0];
assert(canonicalSpecialtyId, 'Canonical taxonomy has no nodes');
const validMembership = createMembershipPreferences({
  galaxies: ['masters'],
  specialtiesByGalaxy: { masters: [canonicalSpecialtyId] },
  satellites: [],
  professionalProfiles: [],
});
validateMembershipPreferences(validMembership, canonicalIds);
assertThrows(
  () =>
    validateMembershipPreferences(
      createMembershipPreferences({
        galaxies: ['masters'],
        specialtiesByGalaxy: { masters: ['not-a-canonical-specialty'] },
        satellites: [],
        professionalProfiles: [],
      }),
      canonicalIds,
    ),
  'Membership validation accepted an unknown specialty ID',
);

const legacyStorage = new Map<string, string>([
  [
    MEMBERSHIP_STORAGE_KEY,
    JSON.stringify({
      galaxies: ['masters'],
      specialtiesByGalaxy: { masters: [canonicalSpecialtyId] },
    }),
  ],
]);
const globalWithWindow = globalThis as unknown as {
  window?: { localStorage: { getItem: (key: string) => string | null } };
};
const previousWindow = globalWithWindow.window;
globalWithWindow.window = {
  localStorage: {
    getItem: (key) => legacyStorage.get(key) ?? null,
  },
};
const legacyPreferences = readMembershipPreferences(canonicalIds);
assert(legacyPreferences?.galaxies[0] === 'masters', 'Legacy membership lost its galaxy');
assert(
  legacyPreferences?.specialtiesByGalaxy.masters?.[0] === canonicalSpecialtyId,
  'Legacy membership lost its specialty',
);
assert(
  legacyPreferences?.assigned_galaxy_id === 'masters',
  'Legacy membership did not normalize its assigned galaxy',
);
legacyStorage.set(
  MEMBERSHIP_STORAGE_KEY,
  JSON.stringify({
    galaxies: ['masters'],
    specialtiesByGalaxy: { masters: ['not-a-canonical-specialty'] },
  }),
);
assertThrows(
  () => readMembershipPreferences(canonicalIds),
  'Persisted membership with an unknown specialty ID was accepted',
);
globalWithWindow.window = previousWindow;

for (const pillar of view.pillars) {
  assert(canonical.pillars.some((item) => item.id === pillar.id), `Unknown pillar ${pillar.id}`);
  assert(pillar.labels.es && pillar.labels.en, `Missing pillar labels for ${pillar.id}`);
  for (const language of ['es', 'en', 'pt', 'it', 'fr', 'de', 'zh'] as const) {
    assert(pillar.labels[language].trim().length > 0, `Missing ${language} pillar label for ${pillar.id}`);
  }
}

for (const specialty of view.specialties) {
  const canonicalNode = canonical.nodes.find((node) => node.id === specialty.id);
  assert(canonicalNode, `Unknown specialty ${specialty.id}`);
  assert(canonicalNode.pillar === specialty.pillar, `Pillar mismatch for ${specialty.id}`);
  for (const language of ['es', 'en', 'pt', 'it', 'fr', 'de', 'zh'] as const) {
    assert(
      specialty.name[language].trim().length > 0,
      `Missing ${language} specialty label for ${specialty.id}`,
    );
  }
}

console.log(
  JSON.stringify(
    {
      version: view.version,
      pillarCount: view.pillarCount,
      totalNodes: view.totalNodes,
      specialties: view.specialties.length,
      languages: 7,
      status: 'PASS',
    },
    null,
    2,
  ),
);
