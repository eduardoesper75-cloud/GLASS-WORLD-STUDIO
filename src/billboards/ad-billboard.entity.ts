import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DecimalTransformer } from '../common/transformers/decimal.transformer';
import { AD_BASE_RATE_USD_PER_DAY } from './billboards.const';

/**
 * GWS · AdBillboard — espacio publicitario de una Galaxia
 * ------------------------------------------------------------
 * Una cartelera = un espacio que ALBERGA una campaña a la vez. Si está
 * ocupada, el motor encola (AdCampaign.status = queued). El precio base
 * es fijo USD 1/día (Orden Suprema) pero vive como dato configurable
 * para ajuste futuro por Jorge — no por agentes (§3.1).
 */
@Entity('ad_billboards')
@Index(['galaxy', 'slotKey'], { unique: true })
export class AdBillboard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Galaxia dueña del espacio (g1, g2, g4, g5, g6). */
  @Column({ length: 8 })
  galaxy: string;

  /** Clave de posición (ej: "main"). */
  @Column({ length: 32 })
  slotKey: string;

  @Column({ length: 120 })
  label: string;

  /** Tarifa plana diaria en USD (default 1.00). */
  @Column({
    type: 'decimal',
    precision: 8,
    scale: 2,
    default: AD_BASE_RATE_USD_PER_DAY,
    transformer: new DecimalTransformer(),
  })
  baseRatePerDayUsd: number;

  /** Pausa/activa la cartelera (admin + elevación, acción
   * 'manage_billboards'). */
  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
