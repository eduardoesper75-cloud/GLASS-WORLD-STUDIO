import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * GWS · Migración — Búnker de Ingeniería Especializada (Orden Suprema)
 * ------------------------------------------------------------
 * - bunker_specialists: cartera élite. Datos de matriculación completos
 *   (identidad, contacto E.164 privado, título, matrícula, institución,
 *   años de experiencia, especialidades, soporte ofertado). `verified` es
 *   decisión de confianza técnica (solo Jorge, admin + elevación
 *   'verify_bunker_specialist').
 * - bunker_service_requests: tickets técnicos Service On-Demand. CERO
 *   comisión por intermediación (rectificación de la Orden): el honorario
 *   es íntegro para el especialista.
 * - bunker_memberships: membresía pro de USD 50/mes con fidelización
 *   3m=10%, 6m=15%, 12m=20% (display + estado; cobro real Payment_Vault).
 *
 * Sin seeds con FK a users: la tabla users se puebla por registro real, no
 * hay IDs conocidos a la hora de migrar (la app no debe asumirlos).
 */
export class BunkerSchema1739000000000 implements MigrationInterface {
  name = 'BunkerSchema1739000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "bunker_specialists" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "publicName" character varying(120) NOT NULL,
        "fullName" character varying(160) NOT NULL,
        "professionalEmail" character varying(200) NOT NULL,
        "phoneE164" character varying(20) NOT NULL,
        "nationality" character varying(64) NOT NULL,
        "academicTitle" character varying(200) NOT NULL,
        "registrationNumber" character varying(80) NOT NULL,
        "issuingInstitution" character varying(200) NOT NULL,
        "yearsExperience" integer NOT NULL DEFAULT 0,
        "headline" character varying(255) NOT NULL,
        "bio" text,
        "credentials" jsonb NOT NULL DEFAULT '[]',
        "specialties" jsonb NOT NULL DEFAULT '[]',
        "supportTypes" jsonb NOT NULL DEFAULT '[]',
        "countryCode" character varying(2) NOT NULL,
        "region" character varying(255),
        "hourlyRateUsd" numeric(10,2),
        "verified" boolean NOT NULL DEFAULT false,
        "active" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_bunker_specialists" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "bunker_specialists" ADD CONSTRAINT "FK_bunker_specialists_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_bunker_specialists_userId" ON "bunker_specialists" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bunker_specialists_countryCode" ON "bunker_specialists" ("countryCode")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bunker_specialists_verified" ON "bunker_specialists" ("verified")`,
    );

    await queryRunner.query(`
      CREATE TABLE "bunker_service_requests" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "requesterId" uuid NOT NULL,
        "title" character varying(120) NOT NULL,
        "symptom" text NOT NULL,
        "machineType" character varying(32) NOT NULL,
        "errorCodes" jsonb NOT NULL DEFAULT '[]',
        "thermalCurve" text,
        "urgency" character varying(16) NOT NULL DEFAULT 'standard',
        "status" character varying(24) NOT NULL DEFAULT 'new',
        "assignedSpecialistId" uuid,
        "quotedFeeUsd" numeric(12,2),
        "currency" character varying(3) NOT NULL DEFAULT 'USD',
        "commissionRatePct" numeric(5,2) NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_bunker_service_requests" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "bunker_service_requests" ADD CONSTRAINT "FK_bunker_sr_requester" FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bunker_service_requests" ADD CONSTRAINT "FK_bunker_sr_assigned" FOREIGN KEY ("assignedSpecialistId") REFERENCES "bunker_specialists"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bunker_sr_requesterId" ON "bunker_service_requests" ("requesterId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bunker_sr_assignedSpecialistId" ON "bunker_service_requests" ("assignedSpecialistId")`,
    );

    await queryRunner.query(`
      CREATE TABLE "bunker_memberships" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "specialistId" uuid NOT NULL,
        "planMonths" integer NOT NULL,
        "feeUsd" numeric(12,2) NOT NULL,
        "discountPct" integer NOT NULL DEFAULT 0,
        "startDate" date NOT NULL,
        "endDate" date NOT NULL,
        "status" character varying(16) NOT NULL DEFAULT 'active',
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_bunker_memberships" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "bunker_memberships" ADD CONSTRAINT "FK_bunker_memberships_specialist" FOREIGN KEY ("specialistId") REFERENCES "bunker_specialists"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bunker_memberships_specialistId" ON "bunker_memberships" ("specialistId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "bunker_memberships"`);
    await queryRunner.query(`DROP TABLE "bunker_service_requests"`);
    await queryRunner.query(`DROP TABLE "bunker_specialists"`);
  }
}
