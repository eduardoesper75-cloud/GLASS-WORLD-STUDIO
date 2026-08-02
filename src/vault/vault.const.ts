import { VAULT_DOC_KINDS } from './vault.enums';

/**
 * GWS · VaultConst — Gobernanza de metadatos de la Bóveda
 * ------------------------------------------------------------
 * Validación por hoja (benchmark: repositorios académicos colibri/MODAVIS
 * + DSpace/Zenodo — el rechazo de un ítem con metadatos incompletos es la
 * regla, no la excepción). Cada categoría exige UN CONJUNTO MÍNIMO de
 * metadatos técnicos; no hay buckets misceláneos (IEC 61355-1).
 *
 * Claves globales exigidas a todo documento (verificadas siempre):
 *   docKind, license, provenance, sourceRef, effectiveDate.
 *
 * Claves por categoría (hoja, código de referencia AV-1.1…IN-4.6):
 *   coe              → coeficiente de expansión térmica (número).
 *   anneal/schedule  → recocido / cronograma.
 *   strainPoint/annealPoint/softeningPoint → temperaturas características.
 *   (Valores de referencia de la investigación: borosilicato 3.3 COE 33,
 *   ISO 3585/DIN 12315; soft/soda-lime COE 90-96; annealing boro 560 °C,
 *   soda-lime ~546 °C; softening boro 825 °C.)
 */

/** Metadatos TÉCNICOS requeridos por categoría hoja (además de los globales). */
export const REQUIRED_METADATA_BY_CATEGORY: Record<string, readonly string[]> = {
  // ---- AV · Arte y Vitrofusión ----
  'AV-1.1': ['coe', 'anneal', 'schedule', 'heatwork', 'kiln', 'thickness'],
  'AV-1.2': ['coe', 'coeTempRange', 'strainPoint', 'annealPoint', 'softeningPoint', 'compatibilitySystem'],
  'AV-1.3': ['coe', 'anneal', 'schedule', 'heatwork', 'kiln'],
  'AV-1.4': ['coe', 'enamelClass', 'firingBand', 'heavyMetals'],
  'AV-1.5': ['kilnType', 'wattage', 'controller', 'moldMaterials'],
  // ---- LW · Lampworking (Soplete) ----
  'LW-2.1': ['flameType', 'fuelOxidizer', 'torchModel', 'ppeEyewear'],
  'LW-2.2': ['coe', 'coeTempRange', 'strainPoint', 'annealPoint', 'compatibilitySystem'],
  'LW-2.3': ['coe', 'flameType', 'technique'],
  'LW-2.4': ['coe', 'tubeOdWall', 'sealType', 'standards'],
  'LW-2.5': ['coe', 'anneal', 'stressCheck'],
  'LW-2.6': ['kilnType', 'ventilationCfm', 'tools'],
  // ---- SB · Borosilicato y Aparatología ----
  'SB-3.1': ['coe', 'coeTempRange', 'strainPoint', 'annealPoint', 'softeningPoint', 'standardRef', 'hydrolyticClass'],
  'SB-3.2': ['apparatusClass', 'jointSystem', 'nominalSizes', 'pressureRating'],
  'SB-3.3': ['glassDesignation', 'annealSchedule', 'wallThickness'],
  'SB-3.4': ['standardRef', 'issuingBody', 'editionYear'],
  'SB-3.5': ['safetyHazards', 'ventilation'],
  // ---- IN · Industria Pesada y Maquinaria ----
  'IN-4.1': ['furnaceClass', 'firingSystem', 'dailyPull', 'fuelType'],
  'IN-4.2': ['burnerModel', 'fuelType', 'nfpaClass', 'flameSupervision'],
  'IN-4.3': ['refractoryFamily', 'classificationTemp', 'serviceZone'],
  'IN-4.4': ['lehrType', 'zoneCount', 'transport', 'residualStress'],
  'IN-4.5': ['machineType', 'sections', 'moldMaterials'],
  'IN-4.6': ['fuelType', 'silicaPpe', 'startStopProcedure'],
};

/** Metadatos bibliográficos/globales exigidos a CUALQUIER documento. */
export const GLOBAL_REQUIRED_METADATA = [
  'docKind',
  'license',
  'provenance',
  'sourceRef',
  'effectiveDate',
] as const;

/** Claves numéricas con rango de cordura (verificación de incoherencia). */
export const NUMERIC_METADATA_RANGES: Record<string, [number, number]> = {
  coe: [-100, 500],
  strainPoint: [0, 1500],
  annealPoint: [0, 1500],
  softeningPoint: [0, 1800],
  coeTempRange: [-100, 2000],
  firingBand: [0, 2500],
  classificationTemp: [0, 3500],
  editionYear: [1900, 2100],
};

/** Reglas anti-spam (benchmark colibri/MODAVIS: abstracts de una línea). */
export const SPAM_RULES = {
  minSummaryChars: 120,
  maxSummaryChars: 5000,
  minTitleChars: 3,
  maxTitleChars: 120,
};

/** Versión vigente de las cláusulas safe-harbor (ver legal-notices.const.ts). */
export const LEGAL_TERMS_VERSION = '2026.08.02';

/** Categorías de fuga que rechazan un documento (canales de contacto OFF).
 * Se escanean sobre título+resumen. email/phone/external_link/geolocation
 * NO rechazan: en una biblioteca técnica el origen (URL) y datos técnicos
 * (COE, coordenadas de horno) son legítimos. El listado completo queda en
 * el audit log para moderación. */
export const VAULT_LEAK_BLOCK_CATEGORIES = ['whatsapp', 'telegram', 'instagram', 'other_social', 'contact_intent'];

export const DOC_KINDS = [...VAULT_DOC_KINDS] as const;

/**
 * GWS · Referencias técnicas canónicas de la Bóveda
 * ------------------------------------------------------------
 * Datos verificados con fuente (2026-08-02) — ver dossier:
 * docs/research/boveda-inteligencia-2026.md. Son la base de validación
 * orientativa y de futuros documentos seed (siempre vía curación, nunca
 * auto-publicados). Cada sistema lleva su ventana de compatibilidad y la
 * fuente; el dato de laboratorio del fabricante manda sobre el catálogo.
 */
export interface GlassSystemReference {
  coe: number;
  label: string;
  strainC: number;
  annealC: number;
  softenC: number;
  compatibilityNote: string;
  sourceRef: string;
}

export interface GlassStandardReference {
  code: string;
  title: string;
  issuingBody: string;
  editionYear: number;
  scope: string;
}

export const GLASS_REFERENCE_DATA: {
  systems: GlassSystemReference[];
  standards: GlassStandardReference[];
  fusingCurvesC: Record<string, { target: number; label: string }>;
} = {
  systems: [
    {
      coe: 33,
      label: 'Borosilicato 3.3 (lampworking/laboratorio)',
      strainC: 515,
      annealC: 560,
      softenC: 820,
      compatibilityNote: 'COE fijo por norma (ISO 3585 / DIN 12315); compatibilidad entre marcas verificada por ensayo.',
      sourceRef: 'ISO 3585:1998; Boro Mastery annealing guide',
    },
    {
      coe: 32,
      label: 'Borosilicato Schott 8330',
      strainC: 0,
      annealC: 530,
      softenC: 0,
      compatibilityNote: 'Nominal 3.2; usos de aparatología. Rellenar strain/soften con ensayo.',
      sourceRef: 'Schott Borofloat 3.3 / 8330 datasheet',
    },
    {
      coe: 90,
      label: 'Bullseye (fusing)',
      strainC: 493,
      annealC: 532,
      softenC: 677,
      compatibilityNote: 'Compatibilidad ±5 COE (Bullseye TechNote 3); 482 °C anneal para piezas gruesas.',
      sourceRef: 'Bullseye Glass Co. datasheet',
    },
    {
      coe: 96,
      label: 'System 96 / Spectrum',
      strainC: 476,
      annealC: 513,
      softenC: 680,
      compatibilityNote: 'Compatibilidad ±10 COE; Uroboros 96 anneal ~517 °C.',
      sourceRef: 'Spectrum / System 96; Uroboros datasheet',
    },
    {
      coe: 96,
      label: 'Kugler 96 transparente',
      strainC: 485,
      annealC: 508,
      softenC: 694,
      compatibilityNote: 'Mismo COE 96 que System 96 pero verificar curva por partida.',
      sourceRef: 'Kugler Glass datasheet',
    },
    {
      coe: 104,
      label: 'Moretti / Effetre (soplete)',
      strainC: 448,
      annealC: 495,
      softenC: 565,
      compatibilityNote: 'Recocido lento y controlado; garaje a ~480–500 °C.',
      sourceRef: 'Moretti / Effetre ref.',
    },
  ],
  standards: [
    {
      code: 'ASTM C336-71(2020)',
      title: 'Fiber elongation test (strain/anneal point)',
      issuingBody: 'ASTM',
      editionYear: 2020,
      scope: 'Medición de strain y anneal point por elongación de fibra.',
    },
    {
      code: 'ASTM C598-93(2019)',
      title: 'Beam bending test (anneal point)',
      issuingBody: 'ASTM',
      editionYear: 2019,
      scope: 'Medición de anneal point por flexión de viga.',
    },
    {
      code: 'ASTM C338-93(2019)',
      title: 'Softening point test',
      issuingBody: 'ASTM',
      editionYear: 2019,
      scope: 'Medición de softening point por elongación de fibra.',
    },
    {
      code: 'ISO 3585:1998',
      title: 'Borosilicate glass 3.3 — properties',
      issuingBody: 'ISO',
      editionYear: 1998,
      scope: 'Propiedades del borosilicato 3.3 (COE 33).',
    },
    {
      code: 'DIN 12315',
      title: 'Laboratory glassware',
      issuingBody: 'DIN',
      editionYear: 2011,
      scope: 'Cristalería de laboratorio.',
    },
    {
      code: 'EN 572-1',
      title: 'Float and sodo-calcic glass — basic',
      issuingBody: 'CEN',
      editionYear: 2012,
      scope: 'Vidrio float y sodo-cálcico básico.',
    },
    {
      code: 'NFPA 86 (2027)',
      title: 'Ovens and furnaces — safety',
      issuingBody: 'NFPA',
      editionYear: 2027,
      scope: 'Seguridad de hornos: interbloqueos, alivio de explosión, límites de alta temperatura.',
    },
    {
      code: 'EN 746',
      title: 'Industrial thermoprocessing equipment',
      issuingBody: 'CEN',
      editionYear: 2019,
      scope: 'Equipos de proceso térmico industrial (UE) — contraparte de NFPA 86.',
    },
  ],
  fusingCurvesC: {
    fullFuse: { target: 777, label: 'Full fuse (COE 90/96) — 1430–1450 °F' },
    contourFuse: { target: 677, label: 'Contour / fire polish — 1250–1325 °F' },
    tackFuse: { target: 700, label: 'Tack fuse — ~1300 °F' },
    slump: { target: 660, label: 'Slump — 1220–1250 °F' },
  },
};
