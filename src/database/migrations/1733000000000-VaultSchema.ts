import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * GWS · Migración — Bóveda del Conocimiento (§3.5/§3.6) + preferencias de sesión
 * -----------------------------------------------------------------------------
 * Orden Suprema de la Bóveda del Conocimiento. Tres bloques:
 *
 * 1. vault_categories — taxonomía en árbol (ltree). 4 raíces con códigos de
 *    referencia (AV/LW/SB/IN) y subcategorías por nivel (AV-1.1…IN-4.6).
 *    Referencias: IEC 61355-1 / IEC 81355-1 (clasificación por contenido
 *    inherente, sin buckets misceláneos).
 *
 * 2. vault_documents — documento técnico con:
 *      · contentSha256 / contentShaNormalized → dedup por hash de contenido
 *        (benchmark Zenodo/DSpace). Índices NO únicos: los duplicados se
 *        detectan en el service y se rechazan con DUPLICATE, pero la fila
 *        (borrador) queda para auditoría.
 *      · metadata (jsonb) → validación por hoja: REQUIRED_METADATA_BY_CATEGORY
 *        en vault.const.ts (COE, annealing, hornos… por categoría).
 *      · status → flujo draft/under_review/published/rejected (curación).
 *      · acceptedTermsVersion → cláusulas safe-harbor es+en aceptadas
 *        (garantía de titularidad, indemnización, takedown).
 *
 * 3. users.preferredCurrency → persistencia de sesión (selector de moneda de
 *    la Portada). preferredLanguage ya existía.
 */
export class VaultSchema1733000000000 implements MigrationInterface {
  name = 'VaultSchema1733000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ---- 1. Categorías -----------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE "vault_categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "code" character varying(16) NOT NULL,
        "name" character varying(120) NOT NULL,
        "slug" character varying(120) NOT NULL,
        "parentId" uuid,
        "path" ltree NOT NULL,
        "displayOrder" integer NOT NULL DEFAULT 0,
        "active" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_vault_categories" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_vault_categories_code" ON "vault_categories" ("code")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_vault_categories_slug" ON "vault_categories" ("slug")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_vault_categories_path" ON "vault_categories" USING gist ("path")`,
    );
    await queryRunner.query(
      `ALTER TABLE "vault_categories" ADD CONSTRAINT "FK_vault_categories_parent" FOREIGN KEY ("parentId") REFERENCES "vault_categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // Seed del árbol: [code, name, slug(underscore = label ltree), parentCode|null, order]
    const tree: Array<[string, string, string, string | null, number]> = [
      // Raíces (Orden Suprema §2)
      ['AV', 'Arte y Vitrofusión', 'arte_y_vitrofusion', null, 1],
      ['LW', 'Lampworking (Soplete)', 'lampworking', null, 2],
      ['SB', 'Borosilicato y Aparatología', 'borosilicato_y_aparatologia', null, 3],
      ['IN', 'Industria Pesada y Maquinaria', 'industria_pesada_y_maquinaria', null, 4],
      // AV — Arte y Vitrofusión (nivel 1)
      ['AV-1.1', 'Curvas de Cocción y Cronogramas', 'curvas_de_coccion_y_cronogramas', 'AV', 1],
      ['AV-1.2', 'Compatibilidad y Ciencia del Vidrio', 'compatibilidad_y_ciencia_del_vidrio', 'AV', 2],
      ['AV-1.3', 'Técnicas de Vitrofusión', 'tecnicas_de_vitrofusion', 'AV', 3],
      ['AV-1.4', 'Esmaltado y Decoración', 'esmaltado_y_decoracion', 'AV', 4],
      ['AV-1.5', 'Equipamiento y Hornos de Fosa', 'equipamiento_y_hornos_de_fosa', 'AV', 5],
      // LW — Lampworking (Soplete)
      ['LW-2.1', 'Llama y Torches', 'llama_y_torches', 'LW', 1],
      ['LW-2.2', 'Vidrios y Tensiones', 'vidrios_y_tensiones', 'LW', 2],
      ['LW-2.3', 'Técnicas de Varilla', 'tecnicas_de_varilla', 'LW', 3],
      ['LW-2.4', 'Técnicas de Tubo', 'tecnicas_de_tubo', 'LW', 4],
      ['LW-2.5', 'Técnicas Avanzadas', 'tecnicas_avanzadas', 'LW', 5],
      ['LW-2.6', 'Equipamiento del Taller', 'equipamiento_del_taller', 'LW', 6],
      // SB — Borosilicato y Aparatología
      ['SB-3.1', 'Materiales de Vidrio Técnico', 'materiales_de_vidrio_tecnico', 'SB', 1],
      ['SB-3.2', 'Aparatos y Geometría', 'aparatos_y_geometria', 'SB', 2],
      ['SB-3.3', 'Técnicas de Soplado Científico', 'tecnicas_de_soplado_cientifico', 'SB', 3],
      ['SB-3.4', 'Estándares y Normativa', 'estandares_y_normativa', 'SB', 4],
      ['SB-3.5', 'Seguridad en el Taller Científico', 'seguridad_en_el_taller_cientifico', 'SB', 5],
      // IN — Industria Pesada y Maquinaria
      ['IN-4.1', 'Hornos de Fusión', 'hornos_de_fusion', 'IN', 1],
      ['IN-4.2', 'Quemadores y Combustión', 'quemadores_y_combustion', 'IN', 2],
      ['IN-4.3', 'Refractarios y Aislamiento', 'refractarios_y_aislamiento', 'IN', 3],
      ['IN-4.4', 'Hornos de Recocido y Decorado', 'hornos_de_recocido_y_decorado', 'IN', 4],
      ['IN-4.5', 'Maquinaria de Conformado', 'maquinaria_de_conformado', 'IN', 5],
      ['IN-4.6', 'Operación y Seguridad Industrial', 'operacion_y_seguridad_industrial', 'IN', 6],
    ];

    const idByCode = new Map<string, string>();
    for (const [code, name, slug, parentCode, order] of tree) {
      const parentId = parentCode ? idByCode.get(parentCode) : null;
      // path ltree: los labels usan el slug (ya normalizado a underscore).
      const parentPath = parentCode ? (await this.lookupPath(queryRunner, parentCode)) : null;
      const path = parentPath ? `${parentPath}.${slug}` : slug;
      const row: { id: string }[] = await queryRunner.query(
        `INSERT INTO "vault_categories" ("code", "name", "slug", "parentId", "path", "displayOrder")
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING "id"`,
        [code, name, slug, parentId, path, order],
      );
      idByCode.set(code, row[0].id);
    }

    // ---- 2. Documentos ------------------------------------------------------
    await queryRunner.query(`
      CREATE TYPE "vault_documents_status_enum" AS ENUM ('draft', 'under_review', 'published', 'rejected')
    `);
    await queryRunner.query(`
      CREATE TABLE "vault_documents" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "categoryId" uuid NOT NULL,
        "authorId" uuid NOT NULL,
        "title" character varying(120) NOT NULL,
        "summary" text NOT NULL,
        "language" character varying(2) NOT NULL,
        "docKind" character varying(32) NOT NULL,
        "metadata" jsonb NOT NULL DEFAULT '{}',
        "sourceUrl" text,
        "content" text,
        "contentSha256" character varying(64) NOT NULL,
        "contentShaNormalized" character varying(64) NOT NULL,
        "fileType" character varying(64) NOT NULL DEFAULT 'text/plain',
        "sizeBytes" bigint NOT NULL DEFAULT 0,
        "status" "vault_documents_status_enum" NOT NULL DEFAULT 'under_review',
        "rejectedReason" character varying(32),
        "acceptedTermsVersion" character varying(16) NOT NULL,
        "version" integer NOT NULL DEFAULT 1,
        "publishedAt" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_vault_documents" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_vault_documents_sha" ON "vault_documents" ("contentSha256")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_vault_documents_sha_normalized" ON "vault_documents" ("contentShaNormalized")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_vault_documents_status_lang" ON "vault_documents" ("status", "language")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_vault_documents_category_status" ON "vault_documents" ("categoryId", "status")`,
    );
    await queryRunner.query(
      `ALTER TABLE "vault_documents" ADD CONSTRAINT "FK_vault_documents_category" FOREIGN KEY ("categoryId") REFERENCES "vault_categories"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vault_documents" ADD CONSTRAINT "FK_vault_documents_author" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // ---- 3. Preferencia de moneda de sesión ---------------------------------
    await queryRunner.query(
      `ALTER TABLE "users" ADD "preferredCurrency" character varying(3) NOT NULL DEFAULT 'USD'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "preferredCurrency"`);
    await queryRunner.query(`DROP TABLE "vault_documents"`);
    await queryRunner.query(`DROP TYPE "vault_documents_status_enum"`);
    await queryRunner.query(`DROP TABLE "vault_categories"`);
  }

  private async lookupPath(queryRunner: QueryRunner, code: string): Promise<string | null> {
    const rows: Array<{ path: string }> = await queryRunner.query(
      `SELECT "path" FROM "vault_categories" WHERE "code" = $1`,
      [code],
    );
    return rows[0]?.path ?? null;
  }
}
