import type { LanguageCode } from '@/lib/i18n';

/**
 * Etiquetas de presentación para los cinco idiomas que no forman parte del
 * nombre canónico (es/en). Las claves deben coincidir exactamente con los IDs
 * de los nodos de `packages/taxonomy/data/`; la validación se ejecuta en el
 * adaptador server-only antes de entregar la vista a la UI.
 *
 * Este archivo no declara pilares, jerarquía, orden ni IDs adicionales.
 */
export type PresentationLanguage = Exclude<LanguageCode, 'es' | 'en'>;
export type SpecialtyLabels = Record<PresentationLanguage, string>;

export const PRESENTATION_LANGUAGES = [
  'pt',
  'it',
  'fr',
  'de',
  'zh',
] as const satisfies readonly PresentationLanguage[];

export const specialtyLabelOverlay = {
  "hot-kiln-fusing": {
    pt: "Fusão de vidro",
    it: "Fusione del vetro",
    fr: "Fusing du verre",
    de: "Glasschmelzen",
    zh: "玻璃熔融",
  },
  "hot-kiln-full-fuse": {
    pt: "Full fuse (fusão completa)",
    it: "Full fuse (fusione completa)",
    fr: "Full fuse (fusion complète)",
    de: "Full Fuse (Vollverschmelzung)",
    zh: "完全熔融",
  },
  "hot-kiln-tack-fuse": {
    pt: "Tack fuse (fusão parcial)",
    it: "Tack fuse (fusione parziale)",
    fr: "Tack fuse (fusion partielle)",
    de: "Tack Fuse (Teilverschmelzung)",
    zh: "局部熔融",
  },
  "hot-kiln-slumping": {
    pt: "Slumping (moldagem)",
    it: "Slumping (formatura)",
    fr: "Slumping (mise en forme)",
    de: "Slumping (Formgebung)",
    zh: "热弯成型",
  },
  "hot-kiln-casting": {
    pt: "Casting (fundição)",
    it: "Casting (fusione in stampo)",
    fr: "Casting (moulage)",
    de: "Glasguss",
    zh: "玻璃铸造",
  },
  "hot-kiln-firing-schedules": {
    pt: "Programas de queima",
    it: "Programmi di cottura",
    fr: "Programmes de cuisson",
    de: "Brennkurven",
    zh: "烧制曲线",
  },
  "hot-kiln-annealing": {
    pt: "Recozimento",
    it: "Ricottura",
    fr: "Recuit",
    de: "Tempern",
    zh: "退火",
  },
  "flame-torchworking": {
    pt: "Lampworking (trabalho à chama)",
    it: "Lampworking (lavorazione alla fiamma)",
    fr: "Lampworking (travail au chalumeau)",
    de: "Lampworking (Arbeiten an der Flamme)",
    zh: "灯工与火焰加工",
  },
  "flame-glassblowing": {
    pt: "Sopro de vidro",
    it: "Soffiatura del vetro",
    fr: "Soufflage du verre",
    de: "Glasblasen",
    zh: "玻璃吹制",
  },
  "flame-flame-control": {
    pt: "Controle da chama",
    it: "Controllo della fiamma",
    fr: "Contrôle de la flamme",
    de: "Flammenkontrolle",
    zh: "火焰控制",
  },
  "flame-borosilicate": {
    pt: "Vidro borossilicato",
    it: "Vetro borosilicato",
    fr: "Verre borosilicaté",
    de: "Borosilikatglas",
    zh: "硼硅玻璃",
  },
  "flame-soda-lime": {
    pt: "Vidro sodo-cálcico",
    it: "Vetro sodico-calcico",
    fr: "Verre sodocalcique",
    de: "Kalk-Natron-Glas",
    zh: "钠钙玻璃",
  },
  "cold-working-cutting": {
    pt: "Corte",
    it: "Taglio",
    fr: "Découpe",
    de: "Schneiden",
    zh: "切割",
  },
  "cold-working-grinding": {
    pt: "Desbaste e lapidação",
    it: "Sgrossatura e molatura",
    fr: "Meulage",
    de: "Schleifen",
    zh: "研磨",
  },
  "cold-working-polishing": {
    pt: "Polimento",
    it: "Lucidatura",
    fr: "Polissage",
    de: "Polieren",
    zh: "抛光",
  },
  "cold-working-engraving": {
    pt: "Gravação",
    it: "Incisione",
    fr: "Gravure",
    de: "Gravieren",
    zh: "雕刻",
  },
  "cold-working-sandblasting": {
    pt: "Jateamento abrasivo",
    it: "Sabbiatura",
    fr: "Sablage",
    de: "Sandstrahlen",
    zh: "喷砂",
  },
  "cold-working-assembly": {
    pt: "Montagem estrutural",
    it: "Assemblaggio strutturale",
    fr: "Assemblage structurel",
    de: "Strukturelle Montage",
    zh: "结构组装",
  },
  "cold-working-stained-glass": {
    pt: "Vitrais",
    it: "Vetrate artistiche",
    fr: "Vitrail",
    de: "Glasmalerei und Bleiverglasung",
    zh: "彩绘玻璃",
  },
  "cold-working-glass-sculpture": {
    pt: "Escultura em vidro",
    it: "Scultura in vetro",
    fr: "Sculpture en verre",
    de: "Glasskulptur",
    zh: "玻璃雕塑",
  },
} satisfies Record<string, SpecialtyLabels>;
