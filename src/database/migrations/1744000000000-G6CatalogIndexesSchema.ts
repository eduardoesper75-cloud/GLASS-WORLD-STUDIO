import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * GWS · Migración — Índices de catálogo G6 (Blindaje Total E6)
 * ------------------------------------------------------------
 * Perfila el catálogo de fichas técnicas:
 *   · Índice parcial por family sobre templates activos — el autopredictor
 *     y el catálogo público filtran `isActive = true`.
 *   · GIN jsonb sobre keywords y brands — matcheo tokenizado del
 *     autopredictor (búsqueda por sustantivos, no solo slugs).
 * Complementa 1741000000000-G6TechSheetsSchema (estructura + seed).
 */
export class G6CatalogIndexesSchema1744000000000 implements MigrationInterface {
  name = 'G6CatalogIndexesSchema1744000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_g6_tst_active_family" ON "g6_tech_sheet_templates" ("family")
       WHERE "isActive" = true`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_g6_tst_keywords_gin" ON "g6_tech_sheet_templates"
       USING GIN ("keywords" jsonb_path_ops)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_g6_tst_brands_gin" ON "g6_tech_sheet_templates"
       USING GIN ("brands" jsonb_path_ops)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_g6_tst_brands_gin"`);
    await queryRunner.query(`DROP INDEX "IDX_g6_tst_keywords_gin"`);
    await queryRunner.query(`DROP INDEX "IDX_g6_tst_active_family"`);
  }
}
