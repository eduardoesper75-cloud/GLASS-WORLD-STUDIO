import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

/**
 * GWS · HealthModule — Monitoreo de estado (A.2)
 * -----------------------------------------------
 * Expone /health y /api/health. El DataSource de TypeOrmModule.forRoot()
 * es global, por lo que basta el controller; no se requiere forFeature.
 */
@Module({
  controllers: [HealthController],
})
export class HealthModule {}