import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * GWS · Migración — Checkout y Órdenes (brecha P0-01)
 * ------------------------------------------------------------
 * Crea el esqueleto transaccional que el gap-analysis detectó como el
 * más grave de todo el esquema: sin éste, `escrow_holds.orderRef` cuelga
 * sin tabla, `product_reviews.verifiedPurchase` es inalcanzable y la
 * comisión de `commission_rules` no tiene dónde aplicarse.
 *
 *   addresses         — snapshot inmutable del destino de la orden.
 *   orders            — orden de compra (máquina PENDING→CONFIRMED→SHIPPED→
 *                       DELIVERED, ↙ CANCELLED), idempotencyKey UNIQUE (ADR-001),
 *                       montos NUMERIC(19,4) (ADR-004).
 *   order_items       — snapshot de precio/nombre del catálogo al comprar.
 *   payments          — intención de pago (PENDING→CAPTURED|REFUNDED|FAILED);
 *                       el dinero real es del Payment_Vault (§3.1).
 *   shipments         — despacho/entrega (PENDING→SHIPPED→DELIVERED).
 *
 * FKs con ON DELETE RESTRICT (ADR-002): el documento de compra es
 * permanente; no se borra una orden con items/pagos/envíos, ni un producto
 * que ya tuvo ventas, ni un usuario con historial de compras.
 */
export class OrdersCheckoutSchema1745000000000 implements MigrationInterface {
  name = 'OrdersCheckoutSchema1745000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "orders_status_enum" AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TYPE "payments_status_enum" AS ENUM ('pending', 'captured', 'refunded', 'failed')`,
    );

    // ── addresses ─────────────────────────────────────────────
    await queryRunner.query(
      `CREATE TABLE "addresses" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "fullName" character varying NOT NULL,
        "line1" character varying NOT NULL,
        "line2" character varying,
        "city" character varying NOT NULL,
        "region" character varying,
        "postalCode" character varying NOT NULL,
        "countryCode" character varying(2) NOT NULL,
        "phone" character varying,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_addresses_id" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_addresses_userId" ON "addresses" ("userId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD CONSTRAINT "FK_addresses_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );

    // ── orders ────────────────────────────────────────────────
    await queryRunner.query(
      `CREATE TABLE "orders" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "buyerId" uuid NOT NULL,
        "idempotencyKey" character varying(64) NOT NULL,
        "status" "orders_status_enum" NOT NULL DEFAULT 'pending',
        "buyerEmail" character varying NOT NULL,
        "addressId" uuid,
        "subtotal" numeric(19,4) NOT NULL DEFAULT '0',
        "shippingTotal" numeric(19,4) NOT NULL DEFAULT '0',
        "taxTotal" numeric(19,4) NOT NULL DEFAULT '0',
        "total" numeric(19,4) NOT NULL DEFAULT '0',
        "currency" character varying(3) NOT NULL DEFAULT 'USD',
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_orders_id" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_orders_idempotencyKey" ON "orders" ("idempotencyKey")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_orders_buyerId_createdAt" ON "orders" ("buyerId", "createdAt")`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_orders_status" ON "orders" ("status")`);
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_orders_buyerId" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_orders_addressId" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );

    // ── order_items ───────────────────────────────────────────
    await queryRunner.query(
      `CREATE TABLE "order_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "orderId" uuid NOT NULL,
        "productId" uuid NOT NULL,
        "variantId" uuid,
        "productName" character varying NOT NULL,
        "unitAmount" numeric(19,4) NOT NULL,
        "quantity" integer NOT NULL,
        "lineTotal" numeric(19,4) NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_order_items_id" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_order_items_orderId" ON "order_items" ("orderId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_order_items_productId" ON "order_items" ("productId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_order_items_orderId" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_order_items_productId" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_order_items_variantId" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );

    // ── payments ──────────────────────────────────────────────
    await queryRunner.query(
      `CREATE TABLE "payments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "orderId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "idempotencyKey" character varying(64) NOT NULL,
        "status" "payments_status_enum" NOT NULL DEFAULT 'pending',
        "amount" numeric(19,4) NOT NULL,
        "currency" character varying(3) NOT NULL DEFAULT 'USD',
        "paymentMethod" character varying(24) NOT NULL DEFAULT 'card_usd',
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payments_id" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_payments_idempotencyKey" ON "payments" ("idempotencyKey")`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_payments_orderId" ON "payments" ("orderId")`);
    await queryRunner.query(`CREATE INDEX "IDX_payments_userId" ON "payments" ("userId")`);
    await queryRunner.query(
      `ALTER TABLE "payments" ADD CONSTRAINT "FK_payments_orderId" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD CONSTRAINT "FK_payments_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );

    // ── shipments ─────────────────────────────────────────────
    await queryRunner.query(
      `CREATE TABLE "shipments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "orderId" uuid NOT NULL,
        "carrier" character varying,
        "trackingNumber" character varying,
        "status" character varying NOT NULL DEFAULT 'pending',
        "shippedAt" TIMESTAMP WITH TIME ZONE,
        "deliveredAt" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_shipments_id" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_shipments_orderId" ON "shipments" ("orderId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "shipments" ADD CONSTRAINT "FK_shipments_orderId" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "shipments"`);
    await queryRunner.query(`DROP TABLE "payments"`);
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TABLE "addresses"`);
    await queryRunner.query(`DROP TYPE "payments_status_enum"`);
    await queryRunner.query(`DROP TYPE "orders_status_enum"`);
  }
}