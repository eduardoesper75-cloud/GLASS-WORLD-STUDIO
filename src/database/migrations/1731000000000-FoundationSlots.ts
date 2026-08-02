import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * GWS · Migración — Fundación: cupos y claims
 * ------------------------------------------------------------
 * Dos tablas:
 *
 * 1. founding_slots — cupos de fundación configurados por galaxia.
 *    Se seedan los 6 (g1..g6) con los totales aprobados por Jorge:
 *    G1=1000, G2=1000, G3=2000, G4=1000, G5=1000, G6=1000.
 *    totalSlots es configurable vía UPDATE (admin/elevación); el
 *    count de tomados NUNCA se persiste — se calcula contra claims.
 *
 * 2. founding_claims — cada toma de cupo. UNIQUE(userId, galaxy):
 *    un usuario puede tomar UN cupo por galaxia. Índice por galaxy
 *    para el count de cada galaxia en el service y en el guard.
 *
 * El constraint CHECK de límite (claimed <= totalSlots) no se puede
 * expresar en DB de forma atómica sin serializar los claims; el límite
 * duro se aplica en la transacción del service con pesimistic_write
 * sobre founding_slots (ver FoundationService.claim). El UNIQUE de
 * (userId, galaxy) SÍ es un constraint real de DB.
 */
export class FoundationSlots1731000000000 implements MigrationInterface {
  name = 'FoundationSlots1731000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "founding_slots" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "galaxy" character varying(8) NOT NULL,
        "totalSlots" integer NOT NULL,
        "enabled" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_founding_slots" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_founding_slots_galaxy" ON "founding_slots" ("galaxy")`,
    );

    await queryRunner.query(`
      CREATE TABLE "founding_claims" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "galaxy" character varying(8) NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_founding_claims" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_founding_claims_userId_galaxy" ON "founding_claims" ("userId", "galaxy")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_founding_claims_galaxy" ON "founding_claims" ("galaxy")`,
    );
    await queryRunner.query(
      `ALTER TABLE "founding_claims" ADD CONSTRAINT "FK_founding_claims_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // Seed de los cupos de fundación (totales aprobados por Jorge).
    await queryRunner.query(`
      INSERT INTO "founding_slots" ("galaxy", "totalSlots") VALUES
        ('g1', 1000),
        ('g2', 1000),
        ('g3', 2000),
        ('g4', 1000),
        ('g5', 1000),
        ('g6', 1000)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "founding_claims"`);
    await queryRunner.query(`DROP TABLE "founding_slots"`);
  }
}
