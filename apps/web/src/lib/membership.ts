import { dashboardModules } from '@/lib/dashboard';
import { membershipSpecialties } from '@/lib/specialties';

export const MEMBERSHIP_STORAGE_KEY = 'gws-membership-preferences';

export const professionalProfileIds = [
  'engineers',
  'process-technicians',
  'scientists-specialists',
] as const;

export const galaxyPathById: Record<string, string> = {
  masters: '/galaxy/1-maestros',
  marketplace: '/galaxy/2-marketplace',
  community: '/galaxy/3-comunidad',
  'silicate-bonus': '/galaxy/4-bono-silicato',
  industry: '/galaxy/5-industria',
  materials: '/galaxy/6-materiales',
};

export interface MembershipPreferences {
  galaxies: string[];
  specialtiesByGalaxy: Record<string, string[]>;
  satellites: string[];
  professionalProfiles: string[];
  user_profile: {
    galaxies: string[];
    specialtiesByGalaxy: Record<string, string[]>;
    professionalProfiles: string[];
  };
  assigned_galaxy_id: string | null;
  avatar: string | null;
}

const galaxyIds = dashboardModules
  .filter((module) => module.category === 'galaxy')
  .map((module) => module.id);
const satelliteIds = dashboardModules
  .filter((module) => module.category === 'satellite')
  .map((module) => module.id);
const specialtyIds = membershipSpecialties.map((specialty) => specialty.id);

function isStringArray(value: unknown, allowedValues: readonly string[]): value is string[] {
  return (
    Array.isArray(value) &&
    new Set(value).size === value.length &&
    value.every((item): item is string => typeof item === 'string' && allowedValues.includes(item))
  );
}

function isSpecialtyMap(
  value: unknown,
  selectedGalaxyIds: string[],
): value is Record<string, string[]> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.entries(value).every(
      ([galaxyId, selectedIds]) =>
        selectedGalaxyIds.includes(galaxyId) && isStringArray(selectedIds, specialtyIds),
    )
  );
}

export function createMembershipPreferences(selection: {
  galaxies: string[];
  specialtiesByGalaxy: Record<string, string[]>;
  satellites: string[];
  professionalProfiles: string[];
  avatar?: string | null;
}): MembershipPreferences {
  return {
    ...selection,
    avatar: selection.avatar ?? null,
    user_profile: {
      galaxies: [...selection.galaxies],
      specialtiesByGalaxy: { ...selection.specialtiesByGalaxy },
      professionalProfiles: [...selection.professionalProfiles],
    },
    assigned_galaxy_id: selection.galaxies[0] ?? null,
  };
}

export function readMembershipPreferences(): MembershipPreferences | null {
  const stored = window.localStorage.getItem(MEMBERSHIP_STORAGE_KEY);
  if (!stored) {
    return null;
  }

  const value: unknown = JSON.parse(stored);
  if (
    typeof value !== 'object' ||
    value === null ||
    !('galaxies' in value) ||
    !isStringArray(value.galaxies, galaxyIds)
  ) {
    throw new Error('Stored membership preferences have an invalid format.');
  }

  const specialtiesByGalaxy = 'specialtiesByGalaxy' in value ? value.specialtiesByGalaxy : {};
  const satellites = 'satellites' in value ? value.satellites : [];
  const professionalProfiles =
    'professionalProfiles' in value ? value.professionalProfiles : [];

  if (
    !isSpecialtyMap(specialtiesByGalaxy, value.galaxies) ||
    !isStringArray(satellites, satelliteIds) ||
    !isStringArray(professionalProfiles, professionalProfileIds)
  ) {
    throw new Error('Stored membership preferences have an invalid format.');
  }

  const avatar = 'avatar' in value ? value.avatar : null;
  if (avatar !== null && typeof avatar !== 'string') {
    throw new Error('Stored membership avatar has an invalid format.');
  }

  return createMembershipPreferences({
    galaxies: value.galaxies,
    specialtiesByGalaxy,
    satellites,
    professionalProfiles,
    avatar,
  });
}

export function saveMembershipPreferences(preferences: MembershipPreferences): void {
  window.localStorage.setItem(MEMBERSHIP_STORAGE_KEY, JSON.stringify(preferences));
}
