import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { EscrowService } from './escrow.service';

const SWEEP_JOB_NAME = 'escrow-pending-releases-sweep';

/**
 * GWS · EscrowScheduler — Sweep programado de liberación de escrow (P6)
 * ------------------------------------------------------------
 * Hoy la liberación automática se deriva en cada LECTURA (sweep lazy,
 * escrow.service.ts deriveStatus). Este scheduler convierte esa maquinaria
 * en un proceso activo: corre cada hora y llama a
 * processPendingAutoReleases() para persistir la transición
 * HELD → RELEASED de las retenciones cuya ventana de reclamo ya venció.
 *
 * Seguridad (heredada y respetada):
 *   - El movimiento REAL de fondos es del Payment_Vault (§3.1): esto solo
 *     cambia el ESTADO de la máquina de estados, nunca ejecuta transferencias.
 *   - Optimistic lock por fila (@Version, E2): un conflicto concurrente con
 *     un reclamo jamás pisa ni doble-libera (saveWithLock en el servicio).
 *   - Ventana de gracia de reclamo (claimableUntil, E3): lo que vence es la
 *     ventana COMPLETA; dentro de la gracia no se libera nada.
 *
 * Activación — protocolo §3.4 de CLAUDE.md:
 *   El job nace APAGADO (disabled:true). En onApplicationBootstrap se
 *   enciende solo si ESCROW_SWEEP_ENABLED=true en el entorno que corresponda
 *   (banco de pruebas/Codespace primero, staging después, nunca directo a
 *   producción sin el go del Comando). Se usa SchedulerRegistry.start() en
 *   vez de la opción estática para que el valor del .env (cargado por
 *   ConfigModule) ya esté disponible. Rollback determinado: apagar la
 *   variable y reiniciar.
 */
@Injectable()
export class EscrowScheduler implements OnApplicationBootstrap {
  private readonly logger = new Logger(EscrowScheduler.name);

  constructor(
    private readonly escrowService: EscrowService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  onApplicationBootstrap(): void {
    const job = this.schedulerRegistry.getCronJob(SWEEP_JOB_NAME);
    if (process.env.ESCROW_SWEEP_ENABLED === 'true') {
      job.start();
      this.logger.log('Sweep de escrow HABILITADO (ESCROW_SWEEP_ENABLED=true).');
    } else {
      this.logger.warn(
        'Sweep de escrow APAGADO (ESCROW_SWEEP_ENABLED != "true"): las liberaciones automáticas siguen lazy (por lectura).',
      );
    }
  }

  /** Sweep cada hora en UTC (las ventanas de liberación son >= 48 h). */
  @Cron('0 * * * *', {
    name: SWEEP_JOB_NAME,
    timeZone: 'UTC',
    disabled: true,
  })
  async sweepPendingReleases(): Promise<void> {
    try {
      const summary = await this.escrowService.processPendingAutoReleases();
      this.logger.log(
        `Escrow sweep OK: processed=${summary.processed} released=${summary.released} skipped=${summary.skipped}`,
      );
    } catch (err) {
      // No se propaga: el tick fallido no tira abajo la app y el próximo
      // tick horario reintenta. El sweep es idempotente (optimistic lock).
      this.logger.error(
        `Escrow sweep falló (reintento en 1h): ${(err as Error).message}`,
        (err as Error).stack,
      );
    }
  }
}