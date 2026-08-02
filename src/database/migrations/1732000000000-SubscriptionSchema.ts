import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * GWS · Migración — Esquema de suscripciones (Orden Maestra §2/§3)
 * ------------------------------------------------------------
 * 1. subscription_plans — tarifario oficial mensual por Galaxia,
 *    seedado con los precios que dictó Jorge (Orden Maestra §2):
 *      G3 = $15/mes (per cápita)
 *      G1 = $25/mes · G2 = $25/mes · G4 = $25/mes · G6 = $25/mes
 *      G5 = $40/mes (industria pesada)
 *    Es DATO inicial de configuración (no un cambio autónomo de
 *    tarifa): cualquier modificación posterior exige la acción
 *    elevada 'change_subscription_pricing' (CLAUDE.md §3.1).
 *
 * 2. user_subscriptions — registros de membresía por usuario/galaxia
 *    con vencimiento (paidThrough) y descuento de fidelización. La
 *    lógica del GalaxyAccessGuard la consulta para la transición
 *    automática post-fundación: cupos agotados → acceso = claim de
 *    fundador O suscripción activa O admin.
 *
 * Los descuentos por fidelización (3m=10%, 6m=15%, 12m=20%) NO se
 * persisten en tablas: viven en el código (SubscriptionPricingService)
 * porque son la política comercial vigente, no datos mutables por
 * error. Cambiarlos también exige 'change_subscription_pricing'.
 */
export class SubscriptionSchema1732000000000 implements MigrationInterface {
  name = 'SubscriptionSchema1732000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ---------- 1. subscription_plans ----------
    await queryRunner.query(`
      CREATE TABLE "subscription_plans" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "galaxy" character varying(8) NOT NULL,
        "monthlyPriceUsd" numeric(10,2) NOT NULL,
        "currency" character varying(8) NOT NULL DEFAULT 'USD',
        "active" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_subscription_plans" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_subscription_plans_galaxy" ON "subscription_plans" ("galaxy")`,
    );

    // Seed: tarifario oficial de la Orden Maestra §2.
    await queryRunner.query(`
      INSERT INTO "subscription_plans" ("galaxy", "monthlyPriceUsd", "currency") VALUES
        ('g1', 25.00, 'USD'),
        ('g2', 25.00, 'USD'),
        ('g3', 15.00, 'USD'),
        ('g4', 25.00, 'USD'),
        ('g5', 40.00, 'USD'),
        ('g6', 25.00, 'USD')
    `);

    // ---------- 2. user_subscriptions ----------
    await queryRunner.query(
      `CREATE TYPE "user_subscriptions_status_enum" AS ENUM ('active', 'expired', 'cancelled')`,
    );
    await queryRunner.query(`
      CREATE TABLE "user_subscriptions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "galaxy" character varying(8) NOT NULL,
        "planId" uuid,
        "periodMonths" integer NOT NULL,
        "discountPercent" numeric(5,2) NOT NULL DEFAULT 0,
        "pricePerPeriodUsd" numeric(12,2) NOT NULL,
        "paidThrough" TIMESTAMP WITH TIME ZONE NOT NULL,
        "status" "user_subscriptions_status_enum" NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_subscriptions" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_user_subscriptions_userId_galaxy" ON "user_subscriptions" ("userId", "galaxy")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_subscriptions_galaxy_status" ON "user_subscriptions" ("galaxy", "status")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_subscriptions" ADD CONSTRAINT "FK_user_subscriptions_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_subscriptions" ADD CONSTRAINT "FK_user_subscriptions_plan" FOREIGN KEY ("planId") REFERENCES "subscription_plans"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_subscriptions"`);
    await queryRunner.query(`DROP TYPE "user_subscriptions_status_enum"`);
    await queryRunner.query(`DROP TABLE "subscription_plans"`);
  }
}
