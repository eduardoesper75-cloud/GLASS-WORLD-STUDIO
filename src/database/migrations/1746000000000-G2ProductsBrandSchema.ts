import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * GWS · Migración — brand + índices de filtro G2 (spec g2-listado, D5)
 * ------------------------------------------------------------
 * Añade products.brand (marca comercial) que CA3 del spec exige como
 * filtro de catálogo: la columna no existía y crear una tabla nueva
 * "products" es imposible (ya existe la del marketplace — Path A
 * ratificado, ver CHANGELOG-AUTOCOMMIT). Nullable a propósito: los
 * productos anteriores quedan sin marca antes que con una inventada.
 *
 * Índices btree de las tres claves de filtrado del sidebar G2
 * (category / brand / price). El índice GIN de technicalSpecs y el
 * btree compuesto (sellerId, categoryTier) ya existen desde la
 * InitSchema y no se tocan.
 */
export class G2ProductsBrandSchema1746000000000
  implements MigrationInterface
{
  name = 'G2ProductsBrandSchema1746000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" ADD "brand" character varying`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_products_brand" ON "products" ("brand")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_products_categoryTier" ON "products" ("categoryTier")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_products_unitPrice" ON "products" ("unitPrice")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_products_unitPrice"`);
    await queryRunner.query(`DROP INDEX "IDX_products_categoryTier"`);
    await queryRunner.query(`DROP INDEX "IDX_products_brand"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "brand"`);
  }
}
