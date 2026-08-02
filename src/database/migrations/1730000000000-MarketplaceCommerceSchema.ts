import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * GWS · Migración — Esquema comercial de G2 + revocación de sesiones
 * ------------------------------------------------------------
 * Tres bloques:
 *
 * 1. Seguridad (gws-security-hardening)
 *    - users.tokenVersion (int, default 0): cada incremento invalida
 *      TODOS los JWT emitidos antes. Lo usa JwtAuthGuard para la
 *      revocación server-side al cambiar rol o el estado de 2FA.
 *
 * 2. Atributos técnicos tipados de products (benchmark 2026)
 *    - products.coe / fusionTemperatureC: columnas numéricas tipadas
 *      y FILTRABLES (un COE o una temp de fusión no son "specs
 *      genéricas": son atributos de contrato sobre los que se compra).
 *    - products.dimensions: JSONB (los campos dependen del tipo de
 *      producto; no se filtra por dimensión en v1).
 *    - products.technicalSpecs sigue siendo JSONB: se agrega un índice
 *      GIN para que el operador @> siga siendo rápido con datos reales.
 *    - products.categoryId -> product_categories (taxonomía fina).
 *
 * 3. Variantes, categorías jerárquicas y reseñas
 *    - product_variants    : variantes con SKU propio + priceOverride
 *      (precio efectivo = COALESCE(priceOverride, product.unitPrice)).
 *    - product_categories  : árbol parent_id + ltree; los 4 tiers se
 *      seedan como raíces (mismo valor que el enum categoryTier).
 *    - product_reviews     : UNIQUE(buyer_id, product_id) — un
 *      comprador no puede votar dos veces el mismo producto.
 *
 * ltree se crea como extensión (no se revierte en down(), igual que
 * uuid-ossp: es de infraestructura).
 */
export class MarketplaceCommerceSchema1730000000000 implements MigrationInterface {
  name = 'MarketplaceCommerceSchema1730000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ---------- 1. Seguridad: tokenVersion ----------
    await queryRunner.query(
      `ALTER TABLE "users" ADD "tokenVersion" integer NOT NULL DEFAULT 0`,
    );

    // ---------- 2. Atributos tipados de products ----------
    await queryRunner.query(
      `ALTER TABLE "products" ADD "coe" numeric(7,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD "fusionTemperatureC" numeric(7,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD "dimensions" jsonb`,
    );
    // GIN para que el filtro técnico @> sobre technicalSpecs escale.
    await queryRunner.query(
      `CREATE INDEX "IDX_products_technicalSpecs_gin" ON "products" USING GIN ("technicalSpecs")`,
    );

    // ---------- 3a. product_categories (árbol con ltree) ----------
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "ltree"`);
    await queryRunner.query(`
      CREATE TABLE "product_categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "parentId" uuid,
        "path" ltree NOT NULL,
        "tier" "products_categorytier_enum" NOT NULL,
        "active" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_product_categories" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_product_categories_slug" ON "product_categories" ("slug")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_product_categories_tier" ON "product_categories" ("tier")`,
    );
    // Índice GIST sobre el path ltree: consultas de subárbol eficientes.
    await queryRunner.query(
      `CREATE INDEX "IDX_product_categories_path_gist" ON "product_categories" USING GIST ("path")`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_categories" ADD CONSTRAINT "FK_product_categories_parent" FOREIGN KEY ("parentId") REFERENCES "product_categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // Seed: los 4 tiers raíz (mismos valores que el enum categoryTier).
    // El label ltree usa el valor del enum — son los caminos raíz.
    await queryRunner.query(`
      INSERT INTO "product_categories" ("name", "slug", "parentId", "path", "tier") VALUES
        ('Insumos críticos', 'insumos-criticos', NULL, 'insumos_criticos', 'insumos_criticos'),
        ('Herramientas y maquinaria', 'herramientas-maquinaria', NULL, 'pro_tools_machinery', 'pro_tools_machinery'),
        ('Servicios industriales', 'servicios-industriales', NULL, 'servicios_industriales', 'servicios_industriales'),
        ('Obras terminadas', 'obras-terminadas', NULL, 'obras_terminadas', 'obras_terminadas')
    `);

    // ---------- 3b. products -> categoryId ----------
    await queryRunner.query(
      `ALTER TABLE "products" ADD "categoryId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_products_category" FOREIGN KEY ("categoryId") REFERENCES "product_categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );

    // ---------- 3c. product_variants ----------
    await queryRunner.query(`
      CREATE TABLE "product_variants" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "productId" uuid NOT NULL,
        "sku" character varying NOT NULL,
        "name" character varying NOT NULL,
        "priceOverride" numeric(12,2),
        "attributes" jsonb NOT NULL DEFAULT '{}',
        "active" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_product_variants" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_product_variants_productId_sku" ON "product_variants" ("productId", "sku")`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variants" ADD CONSTRAINT "FK_product_variants_product" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // ---------- 3d. product_reviews ----------
    await queryRunner.query(`
      CREATE TABLE "product_reviews" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "productId" uuid NOT NULL,
        "buyerId" uuid NOT NULL,
        "rating" smallint NOT NULL,
        "title" character varying,
        "body" text,
        "verifiedPurchase" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_product_reviews" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_product_reviews_rating" CHECK ("rating" >= 1 AND "rating" <= 5)
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_product_reviews_buyerId_productId" ON "product_reviews" ("buyerId", "productId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_product_reviews_productId_createdAt" ON "product_reviews" ("productId", "createdAt")`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_reviews" ADD CONSTRAINT "FK_product_reviews_product" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_reviews" ADD CONSTRAINT "FK_product_reviews_buyer" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Orden inverso de dependencias.
    await queryRunner.query(`DROP TABLE "product_reviews"`);
    await queryRunner.query(`DROP TABLE "product_variants"`);
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_products_category"`,
    );
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "categoryId"`);
    await queryRunner.query(`DROP TABLE "product_categories"`);
    await queryRunner.query(
      `DROP INDEX "IDX_products_technicalSpecs_gin"`,
    );
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "coe"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "fusionTemperatureC"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "dimensions"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "tokenVersion"`);
  }
}
