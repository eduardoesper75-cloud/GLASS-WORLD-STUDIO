import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * GWS · Migración — Comisiones de Marketplace + Motor Aduanero/Logístico
 * -----------------------------------------------------------------------------
 * Dos bloques de la Orden (esquema de comisiones confirmado por Jorge + Orden
 * Suprema del módulo de cálculo aduanero):
 *
 * 1. commission_rules — política de comisiones por Galaxia, con diferenciación
 *    por tipo de transacción SOLO en G1 (confirmación explícita de Jorge):
 *      G1 artwork_sale 30.00 (obras y piezas de colección — vitrina de museo)
 *      G1 product_line 18.00 (herramientas, materiales, insumos, cursos, libros)
 *      G2/G3/G4/G6       18.00 (estándar del marketplace universal)
 *      G5                20.00 (gran industria)
 *    Editable solo por ADMIN + sesión elevada ('edit_liquidation_rules',
 *    CLAUDE.md §3.1/§3.5). NO mueve dinero: es política display + base de la
 *    liquidación futura (Payment_Vault es zona de exclusión).
 *
 * 2. customs_hs_codes / customs_country_params / customs_freight_bands —
 *    referencias del motor aduanero (Orden Suprema de integración):
 *      · HS/NCM + aranceles por región (Mercosur AEC, US HTS MFN, EU CCT),
 *        con fuente y fecha de vigencia — la clasificación final la determina
 *        la aduana del país de destino (estimador, no cotización).
 *      · Parámetros país: IVA/GST, tasa de estadística, percepciones y fees.
 *      · Bandas de flete internacional 2026 por modo y región (orientativo).
 *    Los datos son estáticos versionados; la actualización de tarifas es un
 *    cambio de datos con fuente (no auto-escrapeo): ver docs/research/.
 */
export class CommissionsCustomsSchema1736000000000 implements MigrationInterface {
  name = 'CommissionsCustomsSchema1736000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ========================================================================
    // 1. COMMISSION_RULES
    // ========================================================================
    await queryRunner.query(`
      CREATE TABLE "commission_rules" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "galaxy" character varying(2) NOT NULL,
        "transactionType" character varying(32),
        "percent" numeric(5,2) NOT NULL,
        "labelEs" character varying(200) NOT NULL,
        "active" boolean NOT NULL DEFAULT true,
        "version" integer NOT NULL DEFAULT 1,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_commission_rules" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_commission_rules_galaxy_type" UNIQUE ("galaxy", "transactionType")
      )
    `);

    const rules: Array<[string, string | null, string, string]> = [
      ['G1', 'artwork_sale', '30.00', 'Venta de obras de arte y piezas de colección (vitrina de museo)'],
      ['G1', 'product_line', '18.00', 'Líneas propias: herramientas, materiales, insumos, cursos y libros'],
      ['G2', null, '18.00', 'Marketplace general'],
      ['G3', null, '18.00', 'Comunidad'],
      ['G4', null, '18.00', 'Borosilicato y Envases'],
      ['G5', null, '20.00', 'Gran Industria'],
      ['G6', null, '18.00', 'Ingeniería y Oficio'],
    ];
    for (const [galaxy, txType, percent, label] of rules) {
      await queryRunner.query(
        `INSERT INTO "commission_rules" ("galaxy", "transactionType", "percent", "labelEs")
         VALUES ($1, $2, $3, $4)`,
        [galaxy, txType, percent, label],
      );
    }

    // ========================================================================
    // 2. CUSTOMS — HS/NCM
    // ========================================================================
    await queryRunner.query(`
      CREATE TABLE "customs_hs_codes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "code" character varying(12) NOT NULL,
        "description" character varying(220) NOT NULL,
        "productType" character varying(32) NOT NULL,
        "dutyMercosur" numeric(5,2) NOT NULL,
        "dutyUsMfn" numeric(5,2) NOT NULL,
        "dutyEuCct" numeric(5,2) NOT NULL,
        "sourceRef" character varying(220) NOT NULL,
        "effectiveDate" date NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_customs_hs_codes" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_customs_hs_codes_code" UNIQUE ("code")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_customs_hs_codes_product_type" ON "customs_hs_codes" ("productType")`,
    );

    // [code, description, productType, dutyMercosur, dutyUsMfn, dutyEuCct]
    // Fuentes: NCM/AEC (AFIP, 2017-2022); US HTS (hts.usitc.gov, 2026-06);
    // EU CCT/TARIC (2026). Tasa EU "CCT" orientativa (derechos de terceros
    // país); la tasa efectiva depende del origen y acuerdos.
    const hs: Array<[string, string, string, string, string, string]> = [
      ['7002.20', 'Barras o varillas de vidrio (borosilicato), sin trabajar', 'boro_rod', '4.00', '6.00', '3.00'],
      ['7002.32', 'Tubos de vidrio COE <= 5x10^-6/K (borosilicato)', 'boro_tube', '4.00', '6.00', '3.00'],
      ['7003.19', 'Vidrio colado o laminado en planchas, sin armar', 'cast_sheet', '10.00', '3.30', '3.00'],
      ['7004.90', 'Vidrio estirado o soplado en hojas', 'drawn_sheet', '10.00', '6.40', '3.00'],
      ['7005.29', 'Vidrio flotado (float), sin armar', 'float_sheet', '10.00', '3.90', '3.00'],
      ['7006.00', 'Vidrio trabajado: biselado, grabado, esmaltado', 'worked_glass', '12.00', '4.90', '3.00'],
      ['7007.19', 'Vidrio de seguridad templado', 'tempered', '12.00', '5.00', '3.00'],
      ['7013.91', 'Artículos de adorno de vidrio (cristal o COE bajo)', 'art_glassware', '18.00', '7.20', '3.00'],
      ['7013.99', 'Demás artículos de vidrio de mesa/cocina/decoración', 'art_glassware', '18.00', '5.00', '3.00'],
      ['7016.90', 'Mosaicos, bloques y vidrieras artísticas (vitrales)', 'art_mosaic', '14.00', '6.00', '3.00'],
      ['7017.20', 'Vidrio de laboratorio de borosilicato', 'lab_glass', '14.00', '6.00', '3.00'],
      ['7018.90', 'Figurillas y artículos de adorno trabajados al soplete', 'art_lampwork', '14.00', '6.00', '3.00'],
      ['8417.80', 'Hornos y estufas industriales de proceso térmico (no eléctricos)', 'furnace', '14.00', '2.60', '2.50'],
      ['8514.90', 'Partes de hornos y estufas eléctricos industriales', 'furnace_parts', '14.00', '2.50', '2.50'],
      ['6903.10', 'Artículos refractarios sílico-aluminosos', 'refractory', '12.00', '3.00', '2.50'],
      ['7020.00', 'Demás manufacturas de vidrio', 'other_glass', '18.00', '5.00', '3.00'],
    ];
    for (const [code, desc, productType, m, us, eu] of hs) {
      await queryRunner.query(
        `INSERT INTO "customs_hs_codes"
           ("code", "description", "productType", "dutyMercosur", "dutyUsMfn", "dutyEuCct", "sourceRef", "effectiveDate")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          code,
          desc,
          productType,
          m,
          us,
          eu,
          'NCM/AEC (AFIP); US HTS 2026; EU CCT/TARIC 2026',
          '2026-08-02',
        ],
      );
    }

    // ========================================================================
    // 3. CUSTOMS — PARÁMETROS PAÍS (IVA/GST + tasas + percepciones)
    // ========================================================================
    await queryRunner.query(`
      CREATE TABLE "customs_country_params" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "countryCode" character varying(2) NOT NULL,
        "countryName" character varying(80) NOT NULL,
        "vatRate" numeric(5,2),
        "statisticalFeeRate" numeric(5,2) NOT NULL DEFAULT 0,
        "dutyOverride" numeric(5,2),
        "fees" jsonb NOT NULL DEFAULT '[]',
        "withholdings" jsonb NOT NULL DEFAULT '[]',
        "insuranceRate" numeric(6,4) NOT NULL DEFAULT 0.0030,
        "regionKey" character varying(16) NOT NULL,
        "sourceRef" character varying(220) NOT NULL,
        "effectiveDate" date NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_customs_country_params" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_customs_country_params_code" UNIQUE ("countryCode")
      )
    `);

    // fee: {label, rate, min?, max?, note?}  ·  withholding: {label, rate, note?}
    const countries: Array<{
      code: string;
      name: string;
      vat: string | null;
      stat: string;
      dutyOverride: string | null;
      fees: string;
      withholdings: string;
      insurance: string;
      region: string;
    }> = [
      {
        code: 'AR',
        name: 'Argentina',
        vat: '21.00',
        stat: '3.00',
        dutyOverride: null,
        fees: '[]',
        withholdings: JSON.stringify([
          { label: 'Percepción IVA adicional (RG 2937)', rate: 10.0, note: 'Puede operar como crédito fiscal; sujeta a regímenes vigentes.' },
          { label: 'Percepción Ganancias (RG 2281)', rate: 6.0, note: 'Puede operar como crédito fiscal; sujeta a regímenes vigentes.' },
        ]),
        insurance: '0.0040',
        region: 'mercosur',
      },
      {
        code: 'US',
        name: 'Estados Unidos',
        vat: null,
        stat: '0.00',
        dutyOverride: null,
        fees: JSON.stringify([
          { label: 'Merchandise Processing Fee (MPF)', rate: 0.3464, min: 31.67, max: 614.35 },
          { label: 'Harbor Maintenance Fee (HMF, marítimo)', rate: 0.125, note: 'Solo carga marítima.' },
        ]),
        withholdings: '[]',
        insurance: '0.0030',
        region: 'nafta',
      },
      {
        code: 'BR',
        name: 'Brasil',
        vat: '18.00',
        stat: '0.00',
        dutyOverride: '14.00',
        fees: '[]',
        withholdings: '[]',
        insurance: '0.0030',
        region: 'mercosur',
      },
      {
        code: 'MX',
        name: 'México',
        vat: '16.00',
        stat: '0.00',
        dutyOverride: null,
        fees: JSON.stringify([
          { label: 'DTA (Derecho de Trámite Aduanero)', rate: 0.8, note: 'Aprox. 8/1000 sobre valor, con tope.' },
        ]),
        withholdings: '[]',
        insurance: '0.0030',
        region: 'nafta',
      },
      { code: 'DE', name: 'Alemania', vat: '19.00', stat: '0.00', dutyOverride: null, fees: '[]', withholdings: '[]', insurance: '0.0030', region: 'eu' },
      { code: 'FR', name: 'Francia', vat: '20.00', stat: '0.00', dutyOverride: null, fees: '[]', withholdings: '[]', insurance: '0.0030', region: 'eu' },
      { code: 'IT', name: 'Italia', vat: '22.00', stat: '0.00', dutyOverride: null, fees: '[]', withholdings: '[]', insurance: '0.0030', region: 'eu' },
      { code: 'ES', name: 'España', vat: '21.00', stat: '0.00', dutyOverride: null, fees: '[]', withholdings: '[]', insurance: '0.0030', region: 'eu' },
      { code: 'GB', name: 'Reino Unido', vat: '20.00', stat: '0.00', dutyOverride: null, fees: '[]', withholdings: '[]', insurance: '0.0030', region: 'eu' },
      { code: 'NL', name: 'Países Bajos', vat: '21.00', stat: '0.00', dutyOverride: null, fees: '[]', withholdings: '[]', insurance: '0.0030', region: 'eu' },
      { code: 'BE', name: 'Bélgica', vat: '21.00', stat: '0.00', dutyOverride: null, fees: '[]', withholdings: '[]', insurance: '0.0030', region: 'eu' },
      { code: 'PT', name: 'Portugal', vat: '23.00', stat: '0.00', dutyOverride: null, fees: '[]', withholdings: '[]', insurance: '0.0030', region: 'eu' },
      { code: 'CL', name: 'Chile', vat: '19.00', stat: '0.00', dutyOverride: '6.00', fees: '[]', withholdings: '[]', insurance: '0.0030', region: 'latam' },
      { code: 'UY', name: 'Uruguay', vat: '22.00', stat: '0.00', dutyOverride: null, fees: '[]', withholdings: '[]', insurance: '0.0030', region: 'latam' },
      { code: 'PY', name: 'Paraguay', vat: '10.00', stat: '0.00', dutyOverride: null, fees: '[]', withholdings: '[]', insurance: '0.0030', region: 'mercosur' },
      { code: 'BO', name: 'Bolivia', vat: '13.00', stat: '0.00', dutyOverride: '5.00', fees: '[]', withholdings: '[]', insurance: '0.0030', region: 'latam' },
      { code: 'PE', name: 'Perú', vat: '18.00', stat: '0.00', dutyOverride: null, fees: '[]', withholdings: '[]', insurance: '0.0030', region: 'latam' },
      { code: 'CO', name: 'Colombia', vat: '19.00', stat: '0.00', dutyOverride: null, fees: '[]', withholdings: '[]', insurance: '0.0030', region: 'latam' },
      { code: 'VE', name: 'Venezuela', vat: '16.00', stat: '0.00', dutyOverride: null, fees: '[]', withholdings: '[]', insurance: '0.0030', region: 'latam' },
    ];
    for (const c of countries) {
      await queryRunner.query(
        `INSERT INTO "customs_country_params"
           ("countryCode", "countryName", "vatRate", "statisticalFeeRate", "dutyOverride",
            "fees", "withholdings", "insuranceRate", "regionKey", "sourceRef", "effectiveDate")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          c.code,
          c.name,
          c.vat,
          c.stat,
          c.dutyOverride,
          c.fees,
          c.withholdings,
          c.insurance,
          c.region,
          'IVA/GST: Avalara/VATCalc 2026; AR: AFIP RG 2281/2937; US: CBP MPF/HMF',
          '2026-08-02',
        ],
      );
    }

    // ========================================================================
    // 4. CUSTOMS — BANDAS DE FLETE INTERNACIONAL (orientativo 2026)
    // ========================================================================
    await queryRunner.query(`
      CREATE TABLE "customs_freight_bands" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "bandKey" character varying(32) NOT NULL,
        "mode" character varying(8) NOT NULL,
        "rate" numeric(10,2) NOT NULL,
        "unit" character varying(12) NOT NULL,
        "label" character varying(160) NOT NULL,
        "sourceRef" character varying(220) NOT NULL,
        "effectiveDate" date NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_customs_freight_bands" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_customs_freight_bands_key" UNIQUE ("bandKey")
      )
    `);

    const bands: Array<[string, string, string, string, string]> = [
      // [bandKey, mode, rate, unit, label]
      ['air_mercosur', 'air', '4.00', 'kg', 'Aéreo estándar a MERCOSUR (por kg facturable)'],
      ['air_nafta', 'air', '4.50', 'kg', 'Aéreo estándar a NAFTA/EE.UU.-México'],
      ['air_eu', 'air', '3.80', 'kg', 'Aéreo estándar a la UE/Reino Unido'],
      ['air_latam', 'air', '4.00', 'kg', 'Aéreo estándar a resto de LATAM'],
      ['air_other', 'air', '4.50', 'kg', 'Aéreo estándar a otras regiones'],
      ['ocean_mercosur', 'ocean', '70.00', 'cbm', 'Marítimo LCL a MERCOSUR (por m³)'],
      ['ocean_nafta', 'ocean', '80.00', 'cbm', 'Marítimo LCL a NAFTA/EE.UU.-México'],
      ['ocean_eu', 'ocean', '65.00', 'cbm', 'Marítimo LCL a la UE/Reino Unido'],
      ['ocean_latam', 'ocean', '75.00', 'cbm', 'Marítimo LCL a resto de LATAM'],
      ['ocean_other', 'ocean', '80.00', 'cbm', 'Marítimo LCL a otras regiones'],
    ];
    for (const [bandKey, mode, rate, unit, label] of bands) {
      await queryRunner.query(
        `INSERT INTO "customs_freight_bands" ("bandKey", "mode", "rate", "unit", "label", "sourceRef", "effectiveDate")
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [bandKey, mode, rate, unit, label, 'Freightos FBX / Drewry WCI / Suaid Global, Q1-Q3 2026', '2026-08-02'],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "customs_freight_bands"`);
    await queryRunner.query(`DROP TABLE "customs_country_params"`);
    await queryRunner.query(`DROP TABLE "customs_hs_codes"`);
    await queryRunner.query(`DROP TABLE "commission_rules"`);
  }
}
