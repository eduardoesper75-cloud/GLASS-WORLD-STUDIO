import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { BunkerSpecialist } from './bunker-specialist.entity';
import { BunkerRequestStatus } from './bunker.const';
import { DecimalTransformer } from '../common/transformers/decimal.transformer';

/**
 * GWS · BunkerServiceRequest — ticket técnico "Service On-Demand"
 * ------------------------------------------------------------
 * Cualquier usuario con una máquina parada o con fallas ingresa el
 * síntoma (códigos de error, curvas térmicas inestables, vibraciones en
 * mesas de corte). El sistema conecta con el especialista disponible en
 * la región o por soporte remoto avanzado y fija honorarios de forma
 * transparente bajo las reglas del Búnker (CERO comisión).
 */
@Entity('bunker_service_requests')
@Index(['requesterId'])
@Index(['assignedSpecialistId'])
export class BunkerServiceRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  requester: User;

  @Column()
  requesterId: string;

  @Column({ length: 120 })
  title: string;

  /** Descripción del síntoma (códigos de error, comportamiento térmico). */
  @Column({ type: 'text' })
  symptom: string;

  /** Ver BUNKER_MACHINE_TYPES (flat_glass, borosilicate, crucible_kiln...). */
  @Column({ length: 32 })
  machineType: string;

  @Column({ type: 'jsonb', default: [] })
  errorCodes: string[];

  /** Descripción libre de la curva térmica si aplica. */
  @Column({ type: 'text', nullable: true })
  thermalCurve: string | null;

  @Column({ length: 16, default: 'standard' })
  urgency: string;

  @Column({ length: 24, default: BunkerRequestStatus.NEW })
  status: BunkerRequestStatus;

  @ManyToOne(() => BunkerSpecialist, { nullable: true, onDelete: 'SET NULL' })
  assignedSpecialist: BunkerSpecialist | null;

  @Column({ nullable: true })
  assignedSpecialistId: string | null;

  /** Honorario transparente fijado por el especialista (comisión 0%). */
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: new DecimalTransformer(),
  })
  quotedFeeUsd: number | null;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  /** Política del Búnker: CERO comisión (rectificación de la Orden). */
  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    transformer: new DecimalTransformer(),
  })
  commissionRatePct: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
