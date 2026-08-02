import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * GWS · Migración — UX Multimedia Industrial (Orden Suprema)
 * ------------------------------------------------------------
 * Añade `media` (JSONB, nullable) a las vitrinas de alto valor:
 *   - g1_masters            → canal/demostraciones del maestro en su perfil.
 *   - g1_master_catalog_items → video de masterclass/taller/libro.
 *   - products              → demo técnica (mesa de corte por agua, horno).
 *
 * El contenido lo resuelve `src/common/media/gws-media.validate.ts` antes de
 * persistir: SOLO hosts de exhibición (YouTube/Vimeo/CDN propios) y NUNCA
 * canales de contacto (soberanía §3.6, defensa en profundidad). La columna
 * es nullable para no romper filas existentes. Sin índices GIN: la v1 no
 * filtra por media (COE/temperatura sí lo hacen, ya tipados).
 */
export class UXMultimediaSchema1737000000000 implements MigrationInterface {
  name = 'UXMultimediaSchema1737000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "g1_masters" ADD COLUMN IF NOT EXISTS "media" jsonb`);
    await queryRunner.query(
      `ALTER TABLE "g1_master_catalog_items" ADD COLUMN IF NOT EXISTS "media" jsonb`,
    );
    await queryRunner.query(`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "media" jsonb`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "g1_masters" DROP COLUMN IF EXISTS "media"`);
    await queryRunner.query(`ALTER TABLE "g1_master_catalog_items" DROP COLUMN IF EXISTS "media"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "media"`);
  }
}
