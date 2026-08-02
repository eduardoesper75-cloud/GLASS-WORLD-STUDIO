import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { Product } from '../../marketplace/product.entity';
import { G6TechFamily, G6TechSheetSource } from './g6-tech-sheets.const';

/**
 * GWS · G6TechSheet — ficha técnica de un producto (Galaxia 6)
 * ------------------------------------------------------------
 * Resultado del autopredictor (source='autocomplete', copia de la ficha
 * oficial del template) o del formulario manual (source='manual', piezas de
 * autor/exóticas). El vendedor SIEMPRE puede editar antes de publicar.
 */
@Entity('g6_tech_sheets')
@Index(['sellerId'])
@Index(['productId'])
export class G6TechSheet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  seller: User;

  @Column()
  sellerId: string;

  /** Producto del marketplace asociado (opcional al crear). */
  @ManyToOne(() => Product, { onDelete: 'SET NULL', nullable: true })
  product: Product | null;

  @Column({ type: 'uuid', nullable: true })
  productId: string | null;

  @Column({ length: 32 })
  family: G6TechFamily;

  /** Nombre del producto tal como lo ve el comerciante. */
  @Column({ length: 200 })
  productName: string;

  /** 'autocomplete' (patrón del catálogo) o 'manual' (formulario limpio). */
  @Column({ length: 16 })
  source: G6TechSheetSource;

  /** Template aplicado (solo source='autocomplete'). */
  @Column({ type: 'uuid', nullable: true })
  templateId: string | null;

  /** Ficha técnica (autocompletada del template o cargada a mano). */
  @Column({ type: 'jsonb', default: () => "'{}'" })
  specs: Record<string, unknown>;

  @Column({ length: 16, default: 'draft' })
  status: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
