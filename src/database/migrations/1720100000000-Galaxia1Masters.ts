import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * GWS · Migración — Galaxia 1 (Maestros e Íconos) + obras de G2
 * ------------------------------------------------------------
 * Habilita el módulo modular de G1:
 *   - `g1_masters`                 : perfil público de maestro, 1:1 con users
 *   - `g1_master_catalog_items`    : catálogo de autor por maestro (FK CASCADE)
 *   - enum `users_role_enum`       : + valor 'maestro' (antes de 'admin',
 *     para mantener el orden de declaración de GwsRole)
 *   - enum `products_categorytier_enum` : + valor 'obras_terminadas'
 *     (G2 como marketplace artístico general, ver CLAUDE.md tabla G2)
 *
 * Notas sobre enums y transacciones:
 *   - TypeORM envuelve cada migración en una transacción. En PostgreSQL ≥ 12
 *     ALTER TYPE ... ADD VALUE puede correr en transacción SIEMPRE que el valor
 *     nuevo no se USE en la misma transacción — aquí solo se agrega el valor,
 *     no se insertan filas, por lo que es seguro.
 *   - down() NO usa "DROP VALUE" (no existe en PostgreSQL): recrea el tipo
 *     enum sin el valor agregado y recastea la columna. Si algún registro
 *     real usara 'maestro'/'obras_terminadas', el cast falla y el rollback se
 *     detiene — fail-fast correcto: no se puede deshacer un valor en uso.
 */
export class Galaxia1Masters1720100000000 implements MigrationInterface {
  name = 'Galaxia1Masters1720100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ---------- ENUMS nuevos (naming TypeORM: <tabla>_<columna>_enum) ----------
    await queryRunner.query(
      `CREATE TYPE "g1_masters_tier_enum" AS ENUM ('icon', 'master', 'avant_garde')`,
    );
    await queryRunner.query(
      `CREATE TYPE "g1_master_catalog_items_itemtype_enum" AS ENUM ('course', 'workshop', 'book', 'author_tool_line', 'author_material_line')`,
    );

    // ---------- ENUMS existentes: agregar valores ----------
    await queryRunner.query(
      `ALTER TYPE "users_role_enum" ADD VALUE 'maestro' BEFORE 'admin'`,
    );
    await queryRunner.query(
      `ALTER TYPE "products_categorytier_enum" ADD VALUE 'obras_terminadas'`,
    );

    // ---------- g1_masters (perfil del maestro, FK -> users) ----------
    await queryRunner.query(`
      CREATE TABLE "g1_masters" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "headline" character varying NOT NULL,
        "bio" text,
        "countryCode" character varying(2) NOT NULL,
        "region" character varying,
        "yearsOfExperience" integer,
        "specialties" jsonb NOT NULL DEFAULT '[]',
        "galleryImageUrls" jsonb NOT NULL DEFAULT '[]',
        "tier" "g1_masters_tier_enum" NOT NULL DEFAULT 'master',
        "verified" boolean NOT NULL DEFAULT false,
        "active" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_g1_masters" PRIMARY KEY ("id")
      )
    `);
    // Un usuario = un solo perfil de maestro (1:1 lógico).
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_g1_masters_userId" ON "g1_masters" ("userId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "g1_masters" ADD CONSTRAINT "FK_g1_masters_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // ---------- g1_master_catalog_items (catálogo de autor, FK -> g1_masters) ----------
    await queryRunner.query(`
      CREATE TABLE "g1_master_catalog_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "masterId" uuid NOT NULL,
        "itemType" "g1_master_catalog_items_itemtype_enum" NOT NULL,
        "title" character varying NOT NULL,
        "description" text,
        "price" numeric(12,2),
        "currency" character varying(3) NOT NULL DEFAULT 'USD',
        "details" jsonb NOT NULL DEFAULT '{}',
        "active" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_g1_master_catalog_items" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_g1_master_catalog_items_masterId_itemType" ON "g1_master_catalog_items" ("masterId", "itemType")`,
    );
    await queryRunner.query(
      `ALTER TABLE "g1_master_catalog_items" ADD CONSTRAINT "FK_g1_master_catalog_items_master" FOREIGN KEY ("masterId") REFERENCES "g1_masters"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Orden inverso de dependencias: hijas primero, enums al final.
    await queryRunner.query(`DROP TABLE "g1_master_catalog_items"`);
    await queryRunner.query(`DROP TABLE "g1_masters"`);
    await queryRunner.query(`DROP TYPE "g1_master_catalog_items_itemtype_enum"`);
    await queryRunner.query(`DROP TYPE "g1_masters_tier_enum"`);

    // PostgreSQL no tiene DROP VALUE para enums → recrear el tipo sin el valor.
    await queryRunner.query(
      `CREATE TYPE "users_role_enum_new" AS ENUM ('viewer', 'subscriber', 'moderator_g1', 'moderator_g2', 'moderator_g3', 'moderator_g4', 'moderator_g5', 'moderator_g6', 'admin')`,
    );
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" TYPE "users_role_enum_new" USING "role"::text::"users_role_enum_new"`,
    );
    await queryRunner.query(`DROP TYPE "users_role_enum"`);
    await queryRunner.query(`ALTER TYPE "users_role_enum_new" RENAME TO "users_role_enum"`);
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'subscriber'`,
    );

    await queryRunner.query(
      `CREATE TYPE "products_categorytier_enum_new" AS ENUM ('insumos_criticos', 'pro_tools_machinery', 'servicios_industriales')`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "categoryTier" TYPE "products_categorytier_enum_new" USING "categoryTier"::text::"products_categorytier_enum_new"`,
    );
    await queryRunner.query(`DROP TYPE "products_categorytier_enum"`);
    await queryRunner.query(
      `ALTER TYPE "products_categorytier_enum_new" RENAME TO "products_categorytier_enum"`,
    );
  }
}
