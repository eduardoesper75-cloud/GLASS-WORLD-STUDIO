import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * GWS · Migración inicial — esquema completo del Mes 1-2
 * ------------------------------------------------------------
 * Crea las 6 tablas del backend (users, elevated_sessions,
 * audit_logs, chat_messages, products, production_batches) con los
 * tipos EXACTOS que generan las entidades, para que el esquema
 * migrado y el que espera TypeORM sean idénticos (si no, la próxima
 * `migration:generate` reportaría diffs fantasma).
 *
 * Seguridad del esquema (ver MIGRATIONS.md):
 *   - Todos los enums se crean como tipos PostgreSQL reales con
 *     prefijo de tabla (naming de TypeORM: `<tabla>_<columna>_enum`).
 *   - `down()` elimina primero las tablas hijas (FK) y luego las
 *     padres, en orden inverso de dependencia. Los enums se eliminan
 *     DESPUÉS de sus tablas (DROP TYPE falla si una columna los usa).
 *   - La extensión uuid-ossp NO se revierte en down(): es de
 *     infraestructura y puede haber sido creada antes por otra cosa.
 */
export class InitSchema1720000000000 implements MigrationInterface {
  name = 'InitSchema1720000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // ---------- ENUMS (tipos PostgreSQL) ----------
    await queryRunner.query(
      `CREATE TYPE "users_role_enum" AS ENUM ('viewer', 'subscriber', 'moderator_g1', 'moderator_g2', 'moderator_g3', 'moderator_g4', 'moderator_g5', 'moderator_g6', 'admin')`,
    );
    await queryRunner.query(
      `CREATE TYPE "products_categorytier_enum" AS ENUM ('insumos_criticos', 'pro_tools_machinery', 'servicios_industriales')`,
    );
    await queryRunner.query(
      `CREATE TYPE "products_unitofmeasure_enum" AS ENUM ('kg', 'tonelada', 'metro_lineal', 'unidad', 'litro')`,
    );
    await queryRunner.query(
      `CREATE TYPE "production_batches_unitofmeasure_enum" AS ENUM ('kg', 'tonelada', 'metro_lineal', 'unidad', 'litro')`,
    );

    // ---------- users (tabla más consultada; sin datos de pago) ----------
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "username" character varying NOT NULL,
        "fullName" character varying NOT NULL,
        "passwordHash" character varying NOT NULL,
        "totpSecret" character varying,
        "totpEnabled" boolean NOT NULL DEFAULT false,
        "role" "users_role_enum" NOT NULL DEFAULT 'subscriber',
        "preferredLanguage" character varying NOT NULL DEFAULT 'es',
        "emailVerified" boolean NOT NULL DEFAULT false,
        "privacyAcceptedAt" TIMESTAMP WITH TIME ZONE,
        "privacyPolicyVersion" character varying,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_users_email" ON "users" ("email")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_users_username" ON "users" ("username")`,
    );

    // ---------- elevated_sessions (FK -> users) ----------
    await queryRunner.query(`
      CREATE TABLE "elevated_sessions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "ipAddress" character varying NOT NULL,
        "userAgent" character varying,
        "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "revokedManually" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_elevated_sessions" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_elevated_sessions_userId" ON "elevated_sessions" ("userId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "elevated_sessions" ADD CONSTRAINT "FK_elevated_sessions_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // ---------- audit_logs (inmutable a nivel de app) ----------
    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" character varying NOT NULL,
        "action" character varying NOT NULL,
        "targetResource" character varying,
        "metadata" jsonb,
        "ipAddress" character varying NOT NULL,
        "requiredElevation" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_audit_logs_userId_createdAt" ON "audit_logs" ("userId", "createdAt")`,
    );

    // ---------- chat_messages (FK -> users) ----------
    await queryRunner.query(`
      CREATE TABLE "chat_messages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "channelId" character varying NOT NULL DEFAULT 'general',
        "authorId" uuid NOT NULL,
        "content" text NOT NULL,
        "containsContactInfo" boolean NOT NULL DEFAULT false,
        "hiddenByModeration" boolean NOT NULL DEFAULT false,
        "hiddenReason" character varying,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_chat_messages" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_chat_messages_channelId_createdAt" ON "chat_messages" ("channelId", "createdAt")`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_chat_messages_author" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // ---------- products (FK -> users) ----------
    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "sellerId" uuid NOT NULL,
        "name" character varying NOT NULL,
        "description" text,
        "categoryTier" "products_categorytier_enum" NOT NULL,
        "technicalSpecs" jsonb NOT NULL DEFAULT '{}',
        "unitPrice" numeric(12,2) NOT NULL,
        "unitOfMeasure" "products_unitofmeasure_enum" NOT NULL,
        "minimumOrderQuantity" numeric(12,3) NOT NULL DEFAULT '1',
        "requiresMsds" boolean NOT NULL DEFAULT false,
        "msdsUrl" character varying,
        "sellerCountryCode" character varying(2) NOT NULL,
        "sellerRegion" character varying,
        "active" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_products" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_products_sellerId_categoryTier" ON "products" ("sellerId", "categoryTier")`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_products_seller" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // ---------- production_batches (FK -> products) ----------
    await queryRunner.query(`
      CREATE TABLE "production_batches" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "productId" uuid NOT NULL,
        "batchNumber" character varying NOT NULL,
        "volumeAvailable" numeric(14,3) NOT NULL,
        "unitOfMeasure" "production_batches_unitofmeasure_enum" NOT NULL,
        "coaUrl" character varying NOT NULL,
        "msdsUrl" character varying,
        "manufacturedAt" TIMESTAMP WITH TIME ZONE,
        "expiresAt" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_production_batches" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_production_batches_productId_batchNumber" ON "production_batches" ("productId", "batchNumber")`,
    );
    await queryRunner.query(
      `ALTER TABLE "production_batches" ADD CONSTRAINT "FK_production_batches_product" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Orden inverso de dependencias: hijas primero, enums al final.
    await queryRunner.query(`DROP TABLE "production_batches"`);
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TABLE "chat_messages"`);
    await queryRunner.query(`DROP TABLE "audit_logs"`);
    await queryRunner.query(`DROP TABLE "elevated_sessions"`);
    await queryRunner.query(`DROP TABLE "users"`);

    await queryRunner.query(`DROP TYPE "production_batches_unitofmeasure_enum"`);
    await queryRunner.query(`DROP TYPE "products_unitofmeasure_enum"`);
    await queryRunner.query(`DROP TYPE "products_categorytier_enum"`);
    await queryRunner.query(`DROP TYPE "users_role_enum"`);
  }
}
