import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * GWS · Migración — Escrow Inteligente y Blindaje Logístico (Orden Suprema)
 * ------------------------------------------------------------
 * escrow_holds: retención temporal de pagos (USD/USDT) con liberación
 * automatizada.
 *   · Manual instantánea: "OK / Recibido conforme" del comprador.
 *   · Automática por categoría si no hay reclamo: consumibles 24h ·
 *     frágiles 72h · eléctricos 7d · maquinaria G5 10d.
 *   · Reclamo explícito → CLAIMED (congela la automática) → admin+elevación
 *     resuelve (release | refund).
 *
 * Máquina de estados (display + vencimientos); el movimiento REAL de fondos
 * es del Payment_Vault (§3.1), inalterable para agentes de IA. El estándar
 * de embalaje certificado vive como constante de dominio (escrow.const).
 */
export class EscrowSchema1742000000000 implements MigrationInterface {
  name = 'EscrowSchema1742000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "escrow_holds" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "buyerId" uuid NOT NULL,
        "sellerId" uuid NOT NULL,
        "orderRef" character varying(120) NOT NULL,
        "category" character varying(24) NOT NULL,
        "amount" numeric(12,2) NOT NULL,
        "settlementCurrency" character varying(8) NOT NULL DEFAULT 'USD',
        "paymentMethod" character varying(24) NOT NULL DEFAULT 'card_usd',
        "holdUntil" TIMESTAMP WITH TIME ZONE NOT NULL,
        "status" character varying(16) NOT NULL DEFAULT 'held',
        "releaseType" character varying(8),
        "releasedAt" TIMESTAMP WITH TIME ZONE,
        "claimReason" text,
        "claimedAt" TIMESTAMP WITH TIME ZONE,
        "resolutionNote" text,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_escrow_holds" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "escrow_holds" ADD CONSTRAINT "FK_escrow_holds_buyer" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "escrow_holds" ADD CONSTRAINT "FK_escrow_holds_seller" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_escrow_holds_buyerId" ON "escrow_holds" ("buyerId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_escrow_holds_sellerId" ON "escrow_holds" ("sellerId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_escrow_holds_status" ON "escrow_holds" ("status")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "escrow_holds"`);
  }
}
