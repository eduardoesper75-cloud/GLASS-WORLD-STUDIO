import type { LanguageCode } from '@/lib/i18n';

export type SpecialtyPillar = 'hot-kiln' | 'flame' | 'cold-working';

export type MembershipSpecialty = {
  id: string;
  pillar: SpecialtyPillar;
  name: Record<LanguageCode, string>;
};

export const membershipSpecialties: MembershipSpecialty[] = [
  {
    id: 'hot-kiln-fusing',
    pillar: 'hot-kiln',
    name: {
      es: 'Vitrofusión',
      en: 'Glass fusing',
      pt: 'Fusão de vidro',
      it: 'Fusione del vetro',
      fr: 'Fusing du verre',
      de: 'Glasschmelzen',
      zh: '玻璃熔融',
    },
  },
  {
    id: 'hot-kiln-full-fuse',
    pillar: 'hot-kiln',
    name: {
      es: 'Full fuse (fusión completa)',
      en: 'Full fuse',
      pt: 'Full fuse (fusão completa)',
      it: 'Full fuse (fusione completa)',
      fr: 'Full fuse (fusion complète)',
      de: 'Full Fuse (Vollverschmelzung)',
      zh: '完全熔融',
    },
  },
  {
    id: 'hot-kiln-tack-fuse',
    pillar: 'hot-kiln',
    name: {
      es: 'Tack fuse (fusión parcial)',
      en: 'Tack fuse',
      pt: 'Tack fuse (fusão parcial)',
      it: 'Tack fuse (fusione parziale)',
      fr: 'Tack fuse (fusion partielle)',
      de: 'Tack Fuse (Teilverschmelzung)',
      zh: '局部熔融',
    },
  },
  {
    id: 'hot-kiln-slumping',
    pillar: 'hot-kiln',
    name: {
      es: 'Slumping (conformado)',
      en: 'Slumping and kiln forming',
      pt: 'Slumping (moldagem)',
      it: 'Slumping (formatura)',
      fr: 'Slumping (mise en forme)',
      de: 'Slumping (Formgebung)',
      zh: '热弯成型',
    },
  },
  {
    id: 'hot-kiln-casting',
    pillar: 'hot-kiln',
    name: {
      es: 'Casting (fundición)',
      en: 'Glass casting',
      pt: 'Casting (fundição)',
      it: 'Casting (fusione in stampo)',
      fr: 'Casting (moulage)',
      de: 'Glasguss',
      zh: '玻璃铸造',
    },
  },
  {
    id: 'hot-kiln-firing-schedules',
    pillar: 'hot-kiln',
    name: {
      es: 'Programas de cocción',
      en: 'Firing schedules',
      pt: 'Programas de queima',
      it: 'Programmi di cottura',
      fr: 'Programmes de cuisson',
      de: 'Brennkurven',
      zh: '烧制曲线',
    },
  },
  {
    id: 'hot-kiln-annealing',
    pillar: 'hot-kiln',
    name: {
      es: 'Recocido',
      en: 'Annealing',
      pt: 'Recozimento',
      it: 'Ricottura',
      fr: 'Recuit',
      de: 'Tempern',
      zh: '退火',
    },
  },
  {
    id: 'flame-torchworking',
    pillar: 'flame',
    name: {
      es: 'Lampworking (trabajo a la llama)',
      en: 'Lampworking and torchworking',
      pt: 'Lampworking (trabalho à chama)',
      it: 'Lampworking (lavorazione alla fiamma)',
      fr: 'Lampworking (travail au chalumeau)',
      de: 'Lampworking (Arbeiten an der Flamme)',
      zh: '灯工与火焰加工',
    },
  },
  {
    id: 'flame-glassblowing',
    pillar: 'flame',
    name: {
      es: 'Soplado de vidrio',
      en: 'Glassblowing',
      pt: 'Sopro de vidro',
      it: 'Soffiatura del vetro',
      fr: 'Soufflage du verre',
      de: 'Glasblasen',
      zh: '玻璃吹制',
    },
  },
  {
    id: 'flame-flame-control',
    pillar: 'flame',
    name: {
      es: 'Control de llama',
      en: 'Flame control',
      pt: 'Controle da chama',
      it: 'Controllo della fiamma',
      fr: 'Contrôle de la flamme',
      de: 'Flammenkontrolle',
      zh: '火焰控制',
    },
  },
  {
    id: 'flame-borosilicate',
    pillar: 'flame',
    name: {
      es: 'Vidrio borosilicato',
      en: 'Borosilicate glass',
      pt: 'Vidro borossilicato',
      it: 'Vetro borosilicato',
      fr: 'Verre borosilicaté',
      de: 'Borosilikatglas',
      zh: '硼硅玻璃',
    },
  },
  {
    id: 'flame-soda-lime',
    pillar: 'flame',
    name: {
      es: 'Vidrio sódico-calcáreo',
      en: 'Soda-lime glass',
      pt: 'Vidro sodo-cálcico',
      it: 'Vetro sodico-calcico',
      fr: 'Verre sodocalcique',
      de: 'Kalk-Natron-Glas',
      zh: '钠钙玻璃',
    },
  },
  {
    id: 'cold-working-cutting',
    pillar: 'cold-working',
    name: {
      es: 'Corte',
      en: 'Cutting',
      pt: 'Corte',
      it: 'Taglio',
      fr: 'Découpe',
      de: 'Schneiden',
      zh: '切割',
    },
  },
  {
    id: 'cold-working-grinding',
    pillar: 'cold-working',
    name: {
      es: 'Desbastado y esmerilado',
      en: 'Grinding',
      pt: 'Desbaste e lapidação',
      it: 'Sgrossatura e molatura',
      fr: 'Meulage',
      de: 'Schleifen',
      zh: '研磨',
    },
  },
  {
    id: 'cold-working-polishing',
    pillar: 'cold-working',
    name: {
      es: 'Pulido',
      en: 'Polishing',
      pt: 'Polimento',
      it: 'Lucidatura',
      fr: 'Polissage',
      de: 'Polieren',
      zh: '抛光',
    },
  },
  {
    id: 'cold-working-engraving',
    pillar: 'cold-working',
    name: {
      es: 'Grabado',
      en: 'Engraving',
      pt: 'Gravação',
      it: 'Incisione',
      fr: 'Gravure',
      de: 'Gravieren',
      zh: '雕刻',
    },
  },
  {
    id: 'cold-working-sandblasting',
    pillar: 'cold-working',
    name: {
      es: 'Arenado',
      en: 'Sandblasting',
      pt: 'Jateamento abrasivo',
      it: 'Sabbiatura',
      fr: 'Sablage',
      de: 'Sandstrahlen',
      zh: '喷砂',
    },
  },
  {
    id: 'cold-working-assembly',
    pillar: 'cold-working',
    name: {
      es: 'Ensamblado estructural',
      en: 'Structural assembly',
      pt: 'Montagem estrutural',
      it: 'Assemblaggio strutturale',
      fr: 'Assemblage structurel',
      de: 'Strukturelle Montage',
      zh: '结构组装',
    },
  },
  {
    id: 'cold-working-stained-glass',
    pillar: 'cold-working',
    name: {
      es: 'Vitralismo',
      en: 'Stained glass',
      pt: 'Vitrais',
      it: 'Vetrate artistiche',
      fr: 'Vitrail',
      de: 'Glasmalerei und Bleiverglasung',
      zh: '彩绘玻璃',
    },
  },
  {
    id: 'cold-working-glass-sculpture',
    pillar: 'cold-working',
    name: {
      es: 'Escultura en vidrio',
      en: 'Glass sculpture',
      pt: 'Escultura em vidro',
      it: 'Scultura in vetro',
      fr: 'Sculpture en verre',
      de: 'Glasskulptur',
      zh: '玻璃雕塑',
    },
  },
];

export const specialtyPillars: { id: SpecialtyPillar; labelKey: 'pillarHotKiln' | 'pillarFlame' | 'pillarColdWorking' }[] = [
  { id: 'hot-kiln', labelKey: 'pillarHotKiln' },
  { id: 'flame', labelKey: 'pillarFlame' },
  { id: 'cold-working', labelKey: 'pillarColdWorking' },
];
