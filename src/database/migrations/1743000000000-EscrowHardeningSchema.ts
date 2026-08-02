import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * GWS · Migración — Endurecimiento del Escrow (Blindaje Total E1/E2/E3/E8)
 * ------------------------------------------------------------
 * Amplía escrow_holds con las protecciones del stress test (Orden Suprema):
 *   · version (int) — optimistic lock contra lost-update sweep/claim (E2).
 *   · claimableUntil — ventana de reclamo post-vencimiento (holdUntil +
 *     ESCROW_CLAIM_GRACE_HOURS): dentro de ella el sistema NO libera
 *     automáticamente (E3).
 *   · sellerClaimResponse / sellerClaimRespondedAt — contradicción de la
 *     contraparte en la disputa (E1).
 *   · evidenceRefs (jsonb) — evidencias del reclamo (E1).
 *   · disputeSlaHours / disputeDueAt / disputeEscalated / disputeEscalatedAt —
 *     SLA de resolución y escalamiento auditable (E1).
 * Los datos son de la máquina de estados; el movimiento real de fondos es del
 * Payment_Vault (§3.1), inalterable para agentes de IA.
 */
export class EscrowHardeningSchema1743000000000 implements MigrationInterface {
  name = 'EscrowHardeningSchema1743000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "escrow_holds" ADD "version" integer NOT NULL DEFAULT '1'`,
    );
    await queryRunner.query(
      `ALTER TABLE "escrow_holds" ADD "claimableUntil" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "escrow_holds" ADD "sellerClaimResponse" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "escrow_holds" ADD "sellerClaimRespondedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "escrow_holds" ADD "evidenceRefs" jsonb NOT NULL DEFAULT '[]'`,
    );
    await queryRunner.query(
      `ALTER TABLE "escrow_holds" ADD "disputeSlaHours" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "escrow_holds" ADD "disputeDueAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "escrow_holds" ADD "disputeEscalated" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "escrow_holds" ADD "disputeEscalatedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_escrow_holds_disputeDueAt" ON "escrow_holds" ("disputeDueAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_escrow_holds_disputeEscalated" ON "escrow_holds" ("disputeEscalated")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_escrow_holds_disputeEscalated"`);
    await queryRunner.query(`DROP INDEX "IDX_escrow_holds_disputeDueAt"`);
    await queryRunner.query(`ALTER TABLE "escrow_holds" DROP COLUMN "disputeEscalatedAt"`);
    await queryRunner.query(`ALTER TABLE "escrow_holds" DROP COLUMN "disputeEscalated"`);
    await queryRunner.query(`ALTER TABLE "escrow_holds" DROP COLUMN "disputeDueAt"`);
    await queryRunner.query(`ALTER TABLE "escrow_holds" DROP COLUMN "disputeSlaHours"`);
    await queryRunner.query(`ALTER TABLE "escrow_holds" DROP COLUMN "evidenceRefs"`);
    await queryRunner.query(`ALTER TABLE "escrow_holds" DROP COLUMN "sellerClaimRespondedAt"`);
    await queryRunner.query(`ALTER TABLE "escrow_holds" DROP COLUMN "sellerClaimResponse"`);
    await queryRunner.query(`ALTER TABLE "escrow_holds" DROP COLUMN "claimableUntil"`);
    await queryRunner.query(`ALTER TABLE "escrow_holds" DROP COLUMN "version"`);
  }
}
