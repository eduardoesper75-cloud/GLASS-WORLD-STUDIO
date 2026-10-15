import { localeData, type LanguageCode } from '@/lib/i18n';

export type DashboardLocale = Record<LanguageCode, string>;

export interface DashboardModule {
  id: string;
  category: 'galaxy' | 'satellite';
  icon: string;
  title: DashboardLocale;
  description: DashboardLocale;
  modules: DashboardLocale[];
  accent: string;
}

type LocaleBundle = typeof localeData.es;
type DashboardModuleId = keyof LocaleBundle['dashboard']['modules'];

function localized<T>(select: (locale: LocaleBundle) => T): Record<LanguageCode, T> {
  return {
    es: select(localeData.es),
    en: select(localeData.en),
    pt: select(localeData.pt),
    it: select(localeData.it),
    fr: select(localeData.fr),
    de: select(localeData.de),
    zh: select(localeData.zh),
  };
}

function localizedList(select: (locale: LocaleBundle) => string[]): DashboardLocale[] {
  const features = localized(select);
  return features.es.map((_, index) => ({
    es: features.es[index],
    en: features.en[index],
    pt: features.pt[index],
    it: features.it[index],
    fr: features.fr[index],
    de: features.de[index],
    zh: features.zh[index],
  }));
}

export const dashboardLabels = {
  title: localized((locale) => locale.dashboard.labels.title),
  intro: localized((locale) => locale.dashboard.labels.intro),
  galaxySection: localized((locale) => locale.dashboard.labels.galaxySection),
  satelliteSection: localized((locale) => locale.dashboard.labels.satelliteSection),
  openModule: localized((locale) => locale.dashboard.labels.openModule),
  close: localized((locale) => locale.dashboard.labels.close),
  functions: localized((locale) => locale.dashboard.labels.functions),
  dataStatus: localized((locale) => locale.dashboard.labels.dataStatus),
  dataExplanation: localized((locale) => locale.dashboard.labels.dataExplanation),
  preview: localized((locale) => locale.dashboard.labels.preview),
  explore: localized((locale) => locale.dashboard.labels.explore),
  back: localized((locale) => locale.dashboard.labels.back),
} satisfies Record<string, DashboardLocale>;

const moduleDefinitions = [
  { id: 'masters', category: 'galaxy', icon: '✳', accent: 'amber' },
  { id: 'marketplace', category: 'galaxy', icon: '◇', accent: 'cyan' },
  { id: 'community', category: 'galaxy', icon: '◎', accent: 'violet' },
  { id: 'silicate-bonus', category: 'galaxy', icon: '♻', accent: 'green' },
  { id: 'industry', category: 'galaxy', icon: '⌬', accent: 'blue' },
  { id: 'materials', category: 'galaxy', icon: '✧', accent: 'pink' },
  { id: 'supply-demand-radar', category: 'satellite', icon: '⌖', accent: 'cyan' },
  { id: 'predictive-engineering', category: 'satellite', icon: '⌁', accent: 'violet' },
  { id: 'professionals', category: 'satellite', icon: '⌘', accent: 'amber' },
  { id: 'used-gws', category: 'satellite', icon: '↻', accent: 'green' },
  { id: 'knowledge-vault', category: 'satellite', icon: '▤', accent: 'blue' },
] satisfies Array<{
  id: DashboardModuleId;
  category: DashboardModule['category'];
  icon: string;
  accent: string;
}>;

export const dashboardModules: DashboardModule[] = moduleDefinitions.map((module) => ({
  ...module,
  title: localized((locale) => locale.dashboard.modules[module.id].title),
  description: localized((locale) => locale.dashboard.modules[module.id].description),
  modules: localizedList((locale) => locale.dashboard.modules[module.id].functions),
}));
