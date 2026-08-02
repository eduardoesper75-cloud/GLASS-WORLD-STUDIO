import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommissionRule } from './commission-rule.entity';
import { AuditLog } from '../audit/audit-log.entity';
import { UpdateCommissionRuleDto } from './dto/update-commission-rules.dto';
import { G1_TRANSACTION_TYPES, SUPPORTED_GALAXIES } from './commissions.const';

/**
 * GWS · CommissionsService — Política de comisiones
 * ------------------------------------------------------------
 * Lectura pública (display) + edición ADMIN con elevación. Cada cambio
 * queda en audit_logs como 'liquidation_rules_updated' con la marca
 * requiredElevation: true (CLAUDE.md §3.1/§3.5) y el diff aplicado.
 *
 * Esta tabla NO mueve dinero: es la política que usará la liquidación
 * cuando el Payment_Vault esté integrado (zona de exclusión §3.1).
 */
@Injectable()
export class CommissionsService {
  constructor(
    @InjectRepository(CommissionRule) private ruleRepo: Repository<CommissionRule>,
    @InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>,
  ) {}

  /** Lectura pública: reglas activas, agrupadas y proyectadas para UI. */
  async list() {
    const rules = await this.ruleRepo.find({
      where: { active: true },
      order: { galaxy: 'ASC', transactionType: 'ASC' },
    });
    return {
      version: '2026.08.02',
      disclaimer:
        'Estructura de comisiones confirmada por la dirección de GWS. Display-only: no se ejecuta cobro desde este módulo.',
      rules: rules.map((r) => ({
        galaxy: r.galaxy,
        transactionType: r.transactionType,
        percent: r.percent,
        labelEs: r.labelEs,
      })),
    };
  }

  /** Devuelve el porcentaje aplicable a una venta de una galaxia. */
  async percentFor(galaxy: string, transactionType?: string): Promise<number | null> {
    if (!SUPPORTED_GALAXIES.includes(galaxy as (typeof SUPPORTED_GALAXIES)[number])) {
      return null;
    }
    const rule = await this.ruleRepo.findOne({
      where: {
        galaxy,
        transactionType: galaxy === 'G1' ? transactionType ?? null : null,
        active: true,
      },
    });
    return rule ? rule.percent : null;
  }

  /** Edición elevada (ADMIN + sesión elevada, validado por el guard). */
  async updateRules(
    rules: UpdateCommissionRuleDto[],
    adminId: string,
    ipAddress: string,
  ) {
    const changes: Array<Record<string, unknown>> = [];

    for (const dto of rules) {
      if (!SUPPORTED_GALAXIES.includes(dto.galaxy as (typeof SUPPORTED_GALAXIES)[number])) {
        throw new BadRequestException(`Galaxia inválida: ${dto.galaxy}`);
      }
      // G1 exige tipo de transacción; el resto lo prohíbe (regla global).
      if (dto.galaxy === 'G1') {
        if (!dto.transactionType || !G1_TRANSACTION_TYPES.includes(dto.transactionType as any)) {
          throw new BadRequestException(
            'En G1 la comisión se define por tipo de transacción (artwork_sale | product_line)',
          );
        }
      } else if (dto.transactionType) {
        throw new BadRequestException(
          `transactionType solo aplica en G1; ${dto.galaxy} usa una regla global única`,
        );
      }

      const existing = await this.ruleRepo.findOne({
        where: { galaxy: dto.galaxy, transactionType: dto.transactionType ?? null },
      });
      if (!existing) {
        throw new NotFoundException(
          `No existe regla para ${dto.galaxy}${
            dto.transactionType ? ` / ${dto.transactionType}` : ''
          }`,
        );
      }

      const previous = existing.percent;
      existing.percent = dto.percent;
      existing.active = true;
      existing.version += 1;
      await this.ruleRepo.save(existing);

      changes.push({
        galaxy: dto.galaxy,
        transactionType: dto.transactionType ?? null,
        from: previous,
        to: dto.percent,
        version: existing.version,
      });
    }

    await this.auditRepo.save(
      this.auditRepo.create({
        userId: adminId,
        action: 'liquidation_rules_updated',
        targetResource: 'CommissionRules',
        metadata: { changes },
        ipAddress,
        requiredElevation: true,
      }),
    );

    return this.list();
  }
}
