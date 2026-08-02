import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * GWS · Migración — Carteleras publicitarias dinámicas (Orden Suprema)
 * ------------------------------------------------------------
 * - ad_billboards: espacios publicitarios por Galaxia (G1, G2, G4, G5,
 *   G6) con tarifa plana USD 1/día. Seed de 1 cartelera "main" por galaxia.
 * - ad_campaigns: reservas de rango de fechas. Una campaña a la vez por
 *   cartelera; si choca, la campaña se encola (status=queued). targetUrl
 *   es ruta interna de GWS (soberanía §3.6). billingStatus es display/
 *   estado — el cobro real es del Payment_Vault (§3.1).
 */
export class BillboardsSchema1738000000000 implements MigrationInterface {
  name = 'BillboardsSchema1738000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "ad_billboards" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "galaxy" character varying(8) NOT NULL,
        "slotKey" character varying(32) NOT NULL,
        "label" character varying(120) NOT NULL,
        "baseRatePerDayUsd" numeric(8,2) NOT NULL DEFAULT 1,
        "active" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ad_billboards" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_ad_billboards_galaxy_slotKey" ON "ad_billboards" ("galaxy", "slotKey")`,
    );

    await queryRunner.query(`
      CREATE TABLE "ad_campaigns" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "billboardId" uuid NOT NULL,
        "advertiserId" uuid NOT NULL,
        "title" character varying(120) NOT NULL,
        "targetUrl" character varying(500) NOT NULL,
        "startDate" date NOT NULL,
        "endDate" date NOT NULL,
        "daysActive" integer NOT NULL,
        "costUsd" numeric(12,2) NOT NULL,
        "status" character varying(16) NOT NULL DEFAULT 'scheduled',
        "billingStatus" character varying(8) NOT NULL DEFAULT 'due',
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ad_campaigns" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_ad_campaigns_billboardId" ON "ad_campaigns" ("billboardId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ad_campaigns_advertiserId" ON "ad_campaigns" ("advertiserId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "ad_campaigns" ADD CONSTRAINT "FK_ad_campaigns_billboard" FOREIGN KEY ("billboardId") REFERENCES "ad_billboards"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ad_campaigns" ADD CONSTRAINT "FK_ad_campaigns_advertiser" FOREIGN KEY ("advertiserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // Seed: 1 cartelera principal por Galaxia, tarifa plana USD 1/día.
    await queryRunner.query(`
      INSERT INTO "ad_billboards" ("galaxy", "slotKey", "label", "baseRatePerDayUsd") VALUES
        ('g1', 'main', 'Cartelera Íconos y Maestros', 1),
        ('g2', 'main', 'Cartelera Marketplace', 1),
        ('g4', 'main', 'Cartelera Boro y Envases', 1),
        ('g5', 'main', 'Cartelera Gran Industria', 1),
        ('g6', 'main', 'Cartelera Ingeniería y Oficio', 1)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "ad_campaigns"`);
    await queryRunner.query(`DROP TABLE "ad_billboards"`);
  }
}
