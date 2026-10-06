import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from './data-source';
import { Product } from '../marketplace/product.entity';
import { User } from '../users/user.entity';
import { G2_SEED_PRODUCTS } from './seed-g2.data';

/**
 * GWS · Seed del catálogo G2 (spec g2-listado, CA2)
 * ------------------------------------------------------------
 * Genera >= 40 productos de desarrollo en las 4 categorías con >= 5
 * marcas. Uso: `npm run seed:g2` (compila y corre desde dist/).
 *
 * Guardas de seguridad (gws-security-hardening):
 *  - Se NIEGA a correr si DB_NAME no es 'gws_dev', salvo
 *    GWS_SEED_ALLOW=1 explícito (decision del operador).
 *  - Idempotente: si ya hay >= 40 productos no inserta nada.
 *  - Vendedor: reusa un usuario existente; solo si no hay NINGUNO
 *    crea uno dev con hash bcrypt (contraseña de seed, no login real).
 *
 * Es un script manual, NO una migración: los datos no viajan en el
 * historial de esquema (los seeds por migración solo aplican a
 * catálogos de esquema como product_categories).
 */
const CA2_TARGET = 40;

async function main(): Promise<void> {
  const dbName = process.env.DB_NAME ?? 'gws_dev';
  const allow = process.env.GWS_SEED_ALLOW === '1';
  if (dbName !== 'gws_dev' && !allow) {
    console.error(
      `[seed:g2] Abortado: DB_NAME="${dbName}" no es gws_dev. ` +
        `Si realmente querés sembrar esa DB, exportá GWS_SEED_ALLOW=1.`,
    );
    process.exit(1);
  }

  await AppDataSource.initialize();
  try {
    const productRepo = AppDataSource.getRepository(Product);
    const userRepo = AppDataSource.getRepository(User);

    const existing = await productRepo.count();
    if (existing >= CA2_TARGET) {
      console.log(
        `[seed:g2] Ya hay ${existing} productos (>= ${CA2_TARGET}); nada que sembrar.`,
      );
      return;
    }

    let seller = await userRepo.findOne({
      where: { email: 'seed.seller@gwe2e.dev' },
    });
    if (!seller) {
      const any = await userRepo.find({
        order: { createdAt: 'ASC' },
        take: 1,
      });
      seller = any[0] ?? null;
    }
    if (!seller) {
      seller = await userRepo.save(
        userRepo.create({
          email: 'g2.seed.seller@gws.local',
          username: 'g2seed',
          fullName: 'Vendedor seed G2 (dev)',
          passwordHash: bcrypt.hashSync('seed-g2-dev-only', 10),
        }),
      );
      console.log(`[seed:g2] Creado vendedor dev: ${seller.email}`);
    }

    const rows = G2_SEED_PRODUCTS.map((p) =>
      productRepo.create({
        ...p,
        sellerId: seller!.id,
        sellerCountryCode: 'AR',
        requiresMsds: false,
        active: true,
      }),
    );
    await productRepo.save(rows);

    const total = await productRepo.count();
    const brands = new Set(
      G2_SEED_PRODUCTS.map((p) => p.brand).filter((b): b is string => !!b),
    );
    const tiers = new Set(G2_SEED_PRODUCTS.map((p) => p.categoryTier));
    console.log(
      `[seed:g2] OK — insertados ${rows.length}; total en DB: ${total}; ` +
        `marcas: ${brands.size}; categorías: ${tiers.size}.`,
    );
    if (total < CA2_TARGET) {
      console.warn(
        `[seed:g2] AVISO: total ${total} < ${CA2_TARGET} (hay productos previos distintos al seed).`,
      );
    }
  } finally {
    await AppDataSource.destroy();
  }
}

main().catch((err) => {
  console.error('[seed:g2] Falló:', err);
  process.exit(1);
});
