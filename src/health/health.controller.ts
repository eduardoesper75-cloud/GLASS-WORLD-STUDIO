import { Controller, Get, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

interface HealthReport {
  status: 'ok' | 'degraded';
  db: 'ok' | 'error';
  version: string;
  timestamp: string;
}

/**
 * GWS · HealthController — Health check del backend (A.2)
 * ------------------------------------------------------------
 * Endpoint de monitoreo para infraestructura: la app no usa prefijo
 * '/api' global (rutas canónicas en raíz, p.ej. /ux/manifest), por eso
 * el canonical es /health y se expone además el alias /api/health para
 * health checks de proxys/gateways que asumen el prefijo. Nunca lanza:
 * si la DB falla responde HTTP 200 con db:'error' para que el orquestador
 * decida, sin derribar el check por una transición.
 */
@Controller()
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Get('health')
  async health(): Promise<HealthReport> {
    return this.report();
  }

  @Get('api/health')
  async apiHealth(): Promise<HealthReport> {
    return this.report();
  }

  private async report(): Promise<HealthReport> {
    let db: HealthReport['db'] = 'ok';
    try {
      await this.dataSource.query('SELECT 1');
    } catch (err) {
      db = 'error';
      this.logger.error(
        `Health check: DB inalcanzable — ${(err as Error).message}`,
        (err as Error).stack,
      );
    }
    return {
      status: db === 'ok' ? 'ok' : 'degraded',
      db,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}