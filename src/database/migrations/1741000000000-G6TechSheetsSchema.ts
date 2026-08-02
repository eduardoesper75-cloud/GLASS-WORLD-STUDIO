import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * GWS · Migración — Base de Datos Inteligente de Fichas Técnicas (G6)
 * ------------------------------------------------------------
 * Orden Suprema (Autopredictor Técnico, Galaxia 6 — Ingeniería y Oficio):
 *   - g6_tech_sheet_templates: catálogo precargado de fichas técnicas
 *     OFICIALES (pirómetros, termocuplas K/S, hornos de fundición,
 *     grisallas 630/750/820 °C, óxidos, esmaltes, varillas) con marcas y
 *     keywords para el matching del autopredictor.
 *   - g6_tech_sheets: fichas creadas por el comerciante (source
 *     autocomplete | manual) — la ficha autocompletada siempre se puede
 *     corregir antes de publicar; nunca se auto-publica.
 *
 * El seed marca sourceRef y curated (la grisalla 630/750/820 viene de la
 * Orden; el resto es benchmark de catálogo pendiente de curaduría final —
 * ver docs/research/g6-fichas-tecnicas-2026.md).
 */

interface SeedTemplate {
  slug: string;
  family: string;
  name: string;
  brands: string[];
  keywords: string[];
  officialSpecs: Record<string, unknown>;
  sourceRef: Record<string, unknown>;
}

const SEED: SeedTemplate[] = [
  {
    slug: 'digital_pyrometer_infrared',
    family: 'pyrometer',
    name: 'Pirómetro digital infrarrojo (sin contacto)',
    brands: ['Raytek', 'Fluke', 'Optris', 'Testo', 'Trotec'],
    keywords: ['pirometro', 'pyrometer', 'infrarrojo', 'infrared', 'digital', 'laser', 'sin contacto', 'temperatura'],
    officialSpecs: {
      type: 'no_contact',
      tempRangeC: [-30, 1200],
      accuracy: '±1 % o ±1 °C',
      emissivity: '0.10–1.00',
      responseTimeMs: 300,
      distanceToSpot: '12:1',
      power: '9 V DC (pila)',
    },
    sourceRef: { origin: 'catálogo industrial de pirómetros (benchmark 2026)', curated: false },
  },
  {
    slug: 'digital_pyrometer_thermocouple',
    family: 'pyrometer',
    name: 'Pirómetro digital con termocupla',
    brands: ['Omron', 'Hanyoung', 'Fuji Electric', 'Autonics'],
    keywords: ['pirometro', 'pyrometer', 'termocupla', 'thermocouple', 'digital', 'hornos', 'controlador'],
    officialSpecs: {
      type: 'contact',
      input: 'termocupla tipo K/J',
      tempRangeC: [0, 1200],
      output: '4–20 mA',
      power: '12–24 V DC',
      compatibleWith: ['thermocouple_type_k'],
    },
    sourceRef: { origin: 'catálogo industrial de pirómetros (benchmark 2026)', curated: false },
  },
  {
    slug: 'analog_pyrometer',
    family: 'pyrometer',
    name: 'Pirómetro analógico de cuadrante',
    brands: ['Wika', 'Reotemp', 'Tel-Tru'],
    keywords: ['pirometro', 'analogico', 'analog', 'cuadrante', 'esfera'],
    officialSpecs: {
      type: 'contact_analog',
      tempRangeC: [0, 1200],
      sensor: 'termocupla / bimetálico',
      accuracy: '±2 % de escala',
    },
    sourceRef: { origin: 'catálogo industrial de pirómetros (benchmark 2026)', curated: false },
  },
  {
    slug: 'thermocouple_type_k',
    family: 'thermocouple',
    name: 'Termocupla tipo K (NiCr–NiAl)',
    brands: ['Omega', 'Watlow', 'Marlin', 'Tempsens'],
    keywords: ['termocupla', 'thermocouple', 'tipo k', 'type k', 'nicr', 'nial', 'ceramica'],
    officialSpecs: {
      type: 'K',
      alloy: 'NiCr–NiAl',
      tempRangeC: [-200, 1250],
      shortTermMaxC: 1370,
      tolerance: 'Clase 1 ±1.5 °C',
      protection: 'tubo cerámico',
      compatibleWith: ['digital_pyrometer_thermocouple'],
    },
    sourceRef: { origin: 'IEC 60584 / catálogo de termocuplas (benchmark 2026)', curated: false },
  },
  {
    slug: 'thermocouple_type_s',
    family: 'thermocouple',
    name: 'Termocupla tipo S (PtRh10–Pt)',
    brands: ['Omega', 'Pyrocontrole', 'Heraeus'],
    keywords: ['termocupla', 'thermocouple', 'tipo s', 'type s', 'platino', 'rodio', 'ptrh', 'alta temperatura'],
    officialSpecs: {
      type: 'S',
      alloy: 'PtRh10–Pt',
      tempRangeC: [0, 1600],
      tolerance: '±1.5 °C',
      protection: 'tubo refractario',
      useCase: 'alta temperatura (crisol, hornos de fundición)',
    },
    sourceRef: { origin: 'IEC 60584 / catálogo de termocuplas (benchmark 2026)', curated: false },
  },
  {
    slug: 'glass_melting_furnace',
    family: 'furnace',
    name: 'Horno de fundición de vidrio',
    brands: ['Penberthy', 'Falorni', 'UFG', 'Nabertherm'],
    keywords: ['horno', 'furnace', 'fundicion', 'melting', 'vidrio', 'glass', 'crisol', 'recocido'],
    officialSpecs: {
      class: 'intermitente / continuo',
      firingSystem: ['eléctrico', 'gas'],
      maxTempC: 1200,
      meltTempC: [1250, 1550],
      dailyPullKg: null,
      refractoryFamily: 'AZS / sílice',
      control: 'controlador PID + termocupla tipo S',
    },
    sourceRef: { origin: 'catálogo de hornos de vidrio (benchmark 2026)', curated: false },
  },
  {
    slug: 'grisaille_630',
    family: 'grisaille',
    name: 'Grisalla de baja temperatura (fusión 630 °C)',
    brands: [],
    keywords: ['grisalla', 'grisaille', '630', 'baja temperatura', 'vitral', 'esmaltado'],
    officialSpecs: {
      fusionTempC: 630,
      firingBandC: [600, 660],
      compatibleWith: 'sodo-cálcico / float',
      application: 'pincel / serigrafía',
      suggestedCurveC: '600 → 630 → 660',
    },
    sourceRef: { origin: 'Orden Suprema Base de Datos Técnica (fusión 630 °C)', curated: true },
  },
  {
    slug: 'grisaille_750',
    family: 'grisaille',
    name: 'Grisalla de temperatura media (fusión 750 °C)',
    brands: [],
    keywords: ['grisalla', 'grisaille', '750', 'temperatura media', 'vitral'],
    officialSpecs: {
      fusionTempC: 750,
      firingBandC: [720, 780],
      compatibleWith: 'sodo-cálcico / borosilicato liviano',
      application: 'pincel',
      suggestedCurveC: '720 → 750 → 780',
    },
    sourceRef: { origin: 'Orden Suprema Base de Datos Técnica (fusión 750 °C)', curated: true },
  },
  {
    slug: 'grisaille_820',
    family: 'grisaille',
    name: 'Grisalla de alta temperatura (fusión 820 °C)',
    brands: [],
    keywords: ['grisalla', 'grisaille', '820', 'alta temperatura', 'borosilicato'],
    officialSpecs: {
      fusionTempC: 820,
      firingBandC: [790, 850],
      compatibleWith: 'borosilicato 3.3',
      application: 'pincel / aerógrafo',
      suggestedCurveC: '790 → 820 → 850',
    },
    sourceRef: { origin: 'Orden Suprema Base de Datos Técnica (fusión 820 °C)', curated: true },
  },
  {
    slug: 'oxide_cobalt',
    family: 'oxide',
    name: 'Óxido de cobalto (Co3O4)',
    brands: ['Ferro', 'Johnson Matthey'],
    keywords: ['oxido', 'oxide', 'cobalto', 'cobalt', 'co3o4', 'colorante', 'azul'],
    officialSpecs: {
      formula: 'Co3O4',
      role: 'colorante azul',
      additionPct: [0.1, 3],
      firingRangeC: [800, 1000],
      compatibleWith: 'esmaltes y vidrios sodo-cálcicos',
    },
    sourceRef: { origin: 'catálogo de pigmentos cerámicos/vítreos (benchmark 2026)', curated: false },
  },
  {
    slug: 'oxide_copper',
    family: 'oxide',
    name: 'Óxido de cobre (CuO / Cu2O)',
    brands: ['Ferro'],
    keywords: ['oxido', 'cobre', 'copper', 'cuo', 'cu2o', 'colorante', 'verde'],
    officialSpecs: {
      formula: 'CuO / Cu2O',
      role: 'verde / rojo (atmósfera reductora)',
      additionPct: [0.5, 5],
      firingRangeC: [800, 1100],
    },
    sourceRef: { origin: 'catálogo de pigmentos cerámicos/vítreos (benchmark 2026)', curated: false },
  },
  {
    slug: 'oxide_iron',
    family: 'oxide',
    name: 'Óxido de hierro (Fe2O3)',
    brands: [],
    keywords: ['oxido', 'hierro', 'iron', 'fe2o3', 'ambar', 'marron', 'colorante'],
    officialSpecs: {
      formula: 'Fe2O3',
      role: 'ámbar / marrón',
      additionPct: [0.5, 8],
      firingRangeC: [800, 1100],
    },
    sourceRef: { origin: 'catálogo de pigmentos cerámicos/vítreos (benchmark 2026)', curated: false },
  },
  {
    slug: 'enamel_low_fire',
    family: 'enamel',
    name: 'Esmalte de baja temperatura',
    brands: [],
    keywords: ['esmalte', 'enamel', 'baja temperatura', '600', 'vitrofusion'],
    officialSpecs: {
      firingBandC: [600, 680],
      surface: 'mate / brillante',
      heavyMetalsRegulated: true,
      compatibleWith: 'sodo-cálcico / float',
    },
    sourceRef: { origin: 'catálogo de esmaltes para vidrio (benchmark 2026)', curated: false },
  },
  {
    slug: 'enamel_mid_fire',
    family: 'enamel',
    name: 'Esmalte de media temperatura',
    brands: [],
    keywords: ['esmalte', 'enamel', 'media temperatura', '750', 'coemezcla'],
    officialSpecs: {
      firingBandC: [720, 800],
      surface: 'brillante',
      compatibleWith: 'COE 90–96',
    },
    sourceRef: { origin: 'catálogo de esmaltes para vidrio (benchmark 2026)', curated: false },
  },
  {
    slug: 'rod_borosilicate_33',
    family: 'rod',
    name: 'Varilla de borosilicato 3.3 (COE 33)',
    brands: ['Duran', 'Simax', 'Kimble', 'Pyrex'],
    keywords: ['varilla', 'rod', 'borosilicato', 'borosilicate', 'coe 33', '3.3', 'soplete'],
    officialSpecs: {
      coe: 33,
      diameterMm: [3, 12],
      strainPointC: 515,
      annealPointC: 560,
      softeningPointC: 820,
      standardRef: 'ISO 3585 / DIN 12315',
    },
    sourceRef: { origin: 'ISO 3585:1998; DIN 12315 (curado en Bóveda)', curated: true },
  },
  {
    slug: 'rod_soda_lime',
    family: 'rod',
    name: 'Varilla de sodo-cálcico (COE 90–96)',
    brands: [],
    keywords: ['varilla', 'sodo', 'soda', 'lime', 'float', 'coe 90', 'coe 96', 'soplete'],
    officialSpecs: {
      coe: '90–96',
      diameterMm: [2, 10],
      strainPointC: 476,
      annealPointC: 513,
      softeningPointC: 680,
    },
    sourceRef: { origin: 'catálogo de varillas para soplete (benchmark 2026)', curated: false },
  },
];

export class G6TechSheetsSchema1741000000000 implements MigrationInterface {
  name = 'G6TechSheetsSchema1741000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "g6_tech_sheet_templates" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "slug" character varying(120) NOT NULL,
        "family" character varying(32) NOT NULL,
        "name" character varying(200) NOT NULL,
        "brands" jsonb NOT NULL DEFAULT '[]',
        "keywords" jsonb NOT NULL DEFAULT '[]',
        "officialSpecs" jsonb NOT NULL DEFAULT '{}',
        "sourceRef" jsonb NOT NULL DEFAULT '{}',
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_g6_tech_sheet_templates" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_g6_tech_sheet_templates_slug" UNIQUE ("slug")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_g6_tst_family" ON "g6_tech_sheet_templates" ("family")`,
    );

    await queryRunner.query(`
      CREATE TABLE "g6_tech_sheets" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "sellerId" uuid NOT NULL,
        "productId" uuid,
        "family" character varying(32) NOT NULL,
        "productName" character varying(200) NOT NULL,
        "source" character varying(16) NOT NULL,
        "templateId" uuid,
        "specs" jsonb NOT NULL DEFAULT '{}',
        "status" character varying(16) NOT NULL DEFAULT 'draft',
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_g6_tech_sheets" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "g6_tech_sheets" ADD CONSTRAINT "FK_g6_tech_sheets_seller" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "g6_tech_sheets" ADD CONSTRAINT "FK_g6_tech_sheets_product" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_g6_tech_sheets_sellerId" ON "g6_tech_sheets" ("sellerId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_g6_tech_sheets_productId" ON "g6_tech_sheets" ("productId")`,
    );

    for (const t of SEED) {
      await queryRunner.query(
        `INSERT INTO "g6_tech_sheet_templates"
          ("slug", "family", "name", "brands", "keywords", "officialSpecs", "sourceRef", "isActive")
         VALUES ($1, $2, $3, $4, $5, $6, $7, true)`,
        [
          t.slug,
          t.family,
          t.name,
          JSON.stringify(t.brands),
          JSON.stringify(t.keywords),
          JSON.stringify(t.officialSpecs),
          JSON.stringify(t.sourceRef),
        ],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "g6_tech_sheets"`);
    await queryRunner.query(`DROP TABLE "g6_tech_sheet_templates"`);
  }
}
