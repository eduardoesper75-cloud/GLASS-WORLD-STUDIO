import { localeData, type LanguageCode } from '@/lib/i18n';

export type DashboardLocale = Record<LanguageCode, string>;

export interface DashboardModule {
  id: string;
  category: 'galaxy' | 'satellite';
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
  { id: 'masters', category: 'galaxy', accent: 'amber' },
  { id: 'marketplace', category: 'galaxy', accent: 'cyan' },
  { id: 'community', category: 'galaxy', accent: 'violet' },
  { id: 'silicate-bonus', category: 'galaxy', accent: 'green' },
  { id: 'industry', category: 'galaxy', accent: 'blue' },
  { id: 'materials', category: 'galaxy', accent: 'pink' },
  { id: 'supply-demand-radar', category: 'satellite', accent: 'cyan' },
  { id: 'predictive-engineering', category: 'satellite', accent: 'violet' },
  { id: 'professionals', category: 'satellite', accent: 'amber' },
  { id: 'used-gws', category: 'satellite', accent: 'green' },
  { id: 'knowledge-vault', category: 'satellite', accent: 'blue' },
] satisfies Array<{
  id: DashboardModuleId;
  category: DashboardModule['category'];
  accent: string;
}>;

export const dashboardModules: DashboardModule[] = moduleDefinitions.map((module) => ({
  ...module,
  title: localized((locale) => locale.dashboard.modules[module.id].title),
  description: localized((locale) => locale.dashboard.modules[module.id].description),
  modules: localizedList((locale) => locale.dashboard.modules[module.id].functions),
}));
