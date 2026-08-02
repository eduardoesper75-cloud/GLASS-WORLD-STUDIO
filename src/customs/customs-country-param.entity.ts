import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { DecimalTransformer } from '../common/transformers/decimal.transformer';

/**
 * GWS · CustomsCountryParam — Parámetros de importación por país de destino
 * ------------------------------------------------------------
 * IVA/GST, tasa de estadística, aranceles específicos (dutyOverride),
 * fees aduaneros (MPF/HMF/DTA…) y percepciones (AR: RG 2281/2937).
 * Los valores son ESTIMADOS ORIENTATIVOS con fuente y fecha; no son
 * asesoramiento fiscal ni aduanero.
 */
@Entity('customs_country_params')
@Index(['countryCode'], { unique: true })
export class CustomsCountryParam {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** ISO 3166-1 alpha-2 (mayúsculas). */
  @Column({ length: 2 })
  countryCode: string;

  @Column({ length: 80 })
  countryName: string;

  /** IVA/GST estándar en %. null = no aplica IVA federal (ej. EE.UU.). */
  @Column({
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    transformer: new DecimalTransformer(),
  })
  vatRate: number | null;

  /** Tasa de estadística (AR 3 %, con tope) en %. */
  @Column({
    type: 'numeric',
    precision: 5,
    scale: 2,
    default: 0,
    transformer: new DecimalTransformer(),
  })
  statisticalFeeRate: number;

  /** Arancel específico del país; si es null se usa el arancel regional
   * por HS (Mercosur/US/EU). */
  @Column({
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    transformer: new DecimalTransformer(),
  })
  dutyOverride: number | null;

  /** [{ label, rate, min?, max?, note? }] — fees aduaneros del país. */
  @Column({ type: 'jsonb', default: () => "'[]'" })
  fees: Array<{
    label: string;
    rate: number;
    min?: number;
    max?: number;
    note?: string;
  }>;

  /** [{ label, rate, note? }] — percepciones/anticipos sobre importación. */
  @Column({ type: 'jsonb', default: () => "'[]'" })
  withholdings: Array<{ label: string; rate: number; note?: string }>;

  /** Prima de seguro estimada como % del valor (típico 0.3-0.4 %). */
  @Column({
    type: 'numeric',
    precision: 6,
    scale: 4,
    default: 0.003,
    transformer: new DecimalTransformer(),
  })
  insuranceRate: number;

  /** Región para mapeo de bandas de flete: mercosur | nafta | eu | latam. */
  @Column({ length: 16 })
  regionKey: string;

  @Column({ length: 220 })
  sourceRef: string;

  @Column({ type: 'date' })
  effectiveDate: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
