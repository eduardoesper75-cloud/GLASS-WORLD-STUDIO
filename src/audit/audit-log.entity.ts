import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

/**
 * GWS · AuditLog
 * ------------------------------------------------------------
 * Log inmutable de toda acción tomada en modo admin o sobre
 * componentes críticos (CLAUDE.md §3.1, §3.5). "Inmutable" acá
 * significa a nivel de aplicación: este servicio NUNCA expone un
 * método update() ni delete() sobre esta entidad — solo create()
 * y lecturas. La inmutabilidad real a nivel de base de datos
 * (revocar permisos UPDATE/DELETE al rol de la app sobre esta
 * tabla) se configura en la migración de infraestructura, no acá.
 */
@Entity('audit_logs')
@Index(['userId', 'createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  action: string;

  /** Qué entidad/recurso fue afectado (ej. "LiquidationRule:uuid",
   * "User:uuid"). Permite reconstruir "qué pasó con X" sin tener que
   * revisar todo el log. */
  @Column({ nullable: true })
  targetResource: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @Column()
  ipAddress: string;

  @Column({ type: 'boolean', default: false })
  requiredElevation: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
