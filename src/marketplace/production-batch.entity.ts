import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Product } from './product.entity';
import { UnitOfMeasure } from './marketplace.enums';

/**
 * GWS · ProductionBatch (Galaxia 2 · Industrial Glass Lab)
 * ------------------------------------------------------------
 * El inventario industrial es tridimensional: cantidad + lote +
 * certificado — no un número suelto. Cada lote es trazable de forma
 * independiente, porque un comprador industrial necesita saber de
 * QUÉ lote específico proviene su compra (para reclamos de calidad,
 * trazabilidad regulatoria, etc.), no solo "cuánto queda".
 */
@Entity('production_batches')
@Index(['productId', 'batchNumber'], { unique: true })
export class ProductionBatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (product) => product.batches, { onDelete: 'CASCADE' })
  product: Product;

  @Column()
  productId: string;

  /** Identificador de trazabilidad, definido por el proveedor — no
   * autogenerado por GWS, porque el proveedor ya tiene su propia
   * numeración de lote en su proceso productivo. */
  @Column()
  batchNumber: string;

  @Column({ type: 'decimal', precision: 14, scale: 3 })
  volumeAvailable: number;

  @Column({ type: 'enum', enum: UnitOfMeasure })
  unitOfMeasure: UnitOfMeasure;

  /** Certificado de Análisis — obligatorio para insumos críticos
   * (ver brief original de G2). No se valida el contenido del PDF acá,
   * solo se almacena la URL; la validación de que el archivo sea
   * legítimo es un proceso de moderación separado, fuera del alcance
   * de esta entidad. */
  @Column()
  coaUrl: string;

  @Column({ nullable: true })
  msdsUrl: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  manufacturedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
