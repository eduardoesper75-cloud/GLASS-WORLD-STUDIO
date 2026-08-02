import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * GWS · SubscriptionPlan — Tarifario oficial por Galaxia
 * ------------------------------------------------------------
 * Seedado en la migración SubscriptionSchema con el tarifario que
 * dictó Jorge en la Orden Maestra §2:
 *   G3 = $15/mes (per cápita), G1/G2/G4/G6 = $25/mes, G5 = $40/mes.
 *
 * Es CONFIGURACIÓN, no ejecución de cobro (CLAUDE.md §3.1): ningún
 * agente cambia estos precios de forma autónoma. Un cambio requiere
 * la acción elevada 'change_subscription_pricing' (ElevationGuard +
 * TOTP) y la confirmación explícita de Jorge en el momento. El cobro
 * real vive en Payment_Vault, fuera del alcance de este módulo.
 */
@Entity('subscription_plans')
@Index(['galaxy'], { unique: true })
export class SubscriptionPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Galaxia a la que aplica el plan (g1..g6 — galaxies.const.ts). */
  @Column({ length: 8 })
  galaxy: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  monthlyPriceUsd: number;

  @Column({ length: 8, default: 'USD' })
  currency: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
