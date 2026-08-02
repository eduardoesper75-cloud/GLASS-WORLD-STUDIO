import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { DecimalTransformer } from '../common/transformers/decimal.transformer';

/**
 * GWS · CommissionRule — Política de comisiones por Galaxia
 * ------------------------------------------------------------
 * Confirmada por Jorge (2026-08-02):
 *   · G1 artwork_sale  = 30.00 %  (obras de arte y piezas de colección).
 *   · G1 product_line  = 18.00 %  (herramientas, materiales, insumos,
 *     cursos y libros propios — misma base que el marketplace universal).
 *   · G2/G3/G4/G6      = 18.00 %  (estándar).
 *   · G5               = 20.00 %  (gran industria).
 *
 * La diferenciación por tipo de transacción existe SOLO en G1
 * (transactionType NULL = regla global de la galaxia).
 *
 * Esta tabla es POLÍTICA display + base de la liquidación futura. NO
 * mueve dinero: el cobro/liquidación es del Payment_Vault (§3.1), zona
 * de exclusión. La edición exige ADMIN + sesión elevada
 * ('edit_liquidation_rules', §3.1/§3.5) con audit log inmutable.
 */
@Entity('commission_rules')
@Index(['galaxy', 'transactionType'], { unique: true })
export class CommissionRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Galaxia G1..G6. */
  @Column({ length: 2 })
  galaxy: string;

  /** Tipo de transacción (solo G1): 'artwork_sale' | 'product_line' | null. */
  @Column({ name: 'transactionType', type: 'varchar', length: 32, nullable: true })
  transactionType: string | null;

  /** Comisión en % (0-100). */
  @Column({
    type: 'numeric',
    precision: 5,
    scale: 2,
    transformer: new DecimalTransformer(),
  })
  percent: number;

  @Column({ length: 200 })
  labelEs: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  /** Se incrementa en cada edición elevada (trazabilidad de versiones). */
  @Column({ type: 'int', default: 1 })
  version: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
