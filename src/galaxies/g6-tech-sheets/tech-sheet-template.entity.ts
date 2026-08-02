import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { G6TechFamily } from './g6-tech-sheets.const';

/**
 * GWS · G6TechSheetTemplate — patrón precargado de ficha técnica (Galaxia 6)
 * ------------------------------------------------------------
 * El catálogo inteligente: cada template es un producto estandarizado con su
 * ficha técnica OFICIAL (rangos de temperatura, curvas sugeridas, voltaje,
 * materiales compatibles). El autopredictor matchea el nombre ingresado por
 * el comerciante contra `keywords` y `brands` y autocompleta la ficha.
 *
 * Seedeado por la migración 1741000000000 (con fuente curada); el vendedor
 * siempre puede corregir la ficha antes de publicar (nunca auto-publicada).
 */
@Entity('g6_tech_sheet_templates')
@Index(['family'])
export class G6TechSheetTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Slug único de la referencia (ej: 'grisaille_750'). */
  @Column({ length: 120, unique: true })
  slug: string;

  @Column({ length: 32 })
  family: G6TechFamily;

  @Column({ length: 200 })
  name: string;

  /** Marcas/alias de catálogo reconocidos (para matching). */
  @Column({ type: 'jsonb', default: () => "'[]'" })
  brands: string[];

  /** Palabras clave de matching (normalizadas sin acentos). */
  @Column({ type: 'jsonb', default: () => "'[]'" })
  keywords: string[];

  /** Ficha técnica OFICIAL precargada (json estructurado). */
  @Column({ type: 'jsonb', default: () => "'{}'" })
  officialSpecs: Record<string, unknown>;

  /** Fuente de curaduría (normativa/catálogo/fabricante) — trazabilidad. */
  @Column({ type: 'jsonb', default: () => "'{}'" })
  sourceRef: Record<string, unknown>;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
