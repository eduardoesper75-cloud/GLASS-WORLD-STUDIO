import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * GWS · Migración — Soberanía Financiera: settlement nativo USD + USDT
 * ------------------------------------------------------------
 * Orden Suprema (Soberanía Financiera): todas las transacciones operan bajo
 * doble estándar soberano — Dólares (USD) y USDT (TRC-20/Polygon, paridad
 * 1:1). Esto NO cambia tarifas (Búnker 50/mes, carteleras 1/día, comisiones
 * 30/20/18 ya confirmadas): solo agrega la MONEDA y el MÉTODO de cobro que
 * el usuario elige con un clic.
 *
 *   · bunker_memberships: + settlementCurrency, + paymentMethod.
 *   · ad_campaigns:        + settlementCurrency, + paymentMethod.
 *
 * El cobro real y la verificación de saldos en red son del Payment_Vault
 * (§3.1) — este esquema solo guarda la intención de settlement del usuario.
 */
export class SettlementSchema1740000000000 implements MigrationInterface {
  name = 'SettlementSchema1740000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bunker_memberships" ADD COLUMN "settlementCurrency" character varying(8) NOT NULL DEFAULT 'USD'`,
    );
    await queryRunner.query(
      `ALTER TABLE "bunker_memberships" ADD COLUMN "paymentMethod" character varying(24) NOT NULL DEFAULT 'card_usd'`,
    );
    await queryRunner.query(
      `ALTER TABLE "ad_campaigns" ADD COLUMN "settlementCurrency" character varying(8) NOT NULL DEFAULT 'USD'`,
    );
    await queryRunner.query(
      `ALTER TABLE "ad_campaigns" ADD COLUMN "paymentMethod" character varying(24) NOT NULL DEFAULT 'card_usd'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "ad_campaigns" DROP COLUMN "paymentMethod"`);
    await queryRunner.query(`ALTER TABLE "ad_campaigns" DROP COLUMN "settlementCurrency"`);
    await queryRunner.query(`ALTER TABLE "bunker_memberships" DROP COLUMN "paymentMethod"`);
    await queryRunner.query(`ALTER TABLE "bunker_memberships" DROP COLUMN "settlementCurrency"`);
  }
}
