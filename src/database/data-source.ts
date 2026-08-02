import 'dotenv/config';
import { DataSource } from 'typeorm';
import { typeOrmEntities } from './entities';

/**
 * GWS · AppDataSource (CLI de TypeORM)
 * ------------------------------------------------------------
 * NO es un módulo de Nest — es la conexión que usa el CLI de
 * TypeORM (`typeorm migration:generate/run/revert`). Comparte la
 * lista de entidades con el AppModule vía typeOrmEntities.
 *
 * Las rutas de migrations usan __dirname con glob para que
 * funcionen igual compiladas (dist/database/migrations/*.js)
 * que en src (src/database/migrations/*.ts) con ts-node.
 *
 * Uso:
 *   npm run migration:generate -- src/database/migrations/Nombre
 *   npm run migration:run
 *   npm run migration:revert
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME ?? 'gws_dev',
  entities: typeOrmEntities,
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  // El CLI de migraciones NUNCA sincroniza el esquema solo.
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});
