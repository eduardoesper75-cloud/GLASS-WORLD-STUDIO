import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * GWS · VaultCategory — Taxonomía de la Bóveda del Conocimiento
 * ------------------------------------------------------------
 * Árbol jerárquico (ltree, mismo patrón que product_categories).
 * Códigos de referencia por diseño (benchmark IEC 61355/81355):
 *   AV · Arte y Vitrofusión     LW · Lampworking (Soplete)
 *   SB · Borosilicato y Aparatología   IN · Industria Pesada y Maquinaria
 * y subcategorías AV-1.1…IN-4.6 (ver migración VaultSchema).
 *
 * El documento NO cuelga del nodo por su "subject" suelto: usa
 * categoryId → la validación de metadatos requeridos se resuelve por
 * category.code (REQUIRED_METADATA_BY_CATEGORY en vault.const.ts).
 */
@Entity('vault_categories')
@Index(['code'], { unique: true })
export class VaultCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Código de referencia designación (ej. 'AV-1.1', 'IN-4.4'). */
  @Column({ length: 16 })
  code: string;

  @Column()
  name: string;

  /** Slug único (underscore: los labels ltree no admiten guiones). */
  @Column()
  slug: string;

  @ManyToOne(() => VaultCategory, { nullable: true, onDelete: 'CASCADE' })
  parent: VaultCategory | null;

  @Column({ nullable: true })
  parentId: string | null;

  @Column({ type: 'ltree' })
  path: string;

  @Column({ type: 'int', default: 0 })
  displayOrder: number;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
