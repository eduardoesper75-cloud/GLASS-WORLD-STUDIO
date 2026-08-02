import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { DecimalTransformer } from '../common/transformers/decimal.transformer';

/**
 * GWS · CustomsFreightBand — Bandas de flete internacional (orientativo 2026)
 * ------------------------------------------------------------
 * Tarifas de referencia por modo (air/ocean LCL) y región de destino,
 * derivadas de índices públicos (Freightos FBX, Drewry WCI, Suaid Global,
 * Q1-Q3 2026). Son ORIENTATIVAS: el flete real depende de la ruta, temporada,
 * peso facturable (real vs volumétrico) y contrato con el forwarder.
 */
@Entity('customs_freight_bands')
@Index(['bandKey'], { unique: true })
export class CustomsFreightBand {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Ej. 'air_mercosur', 'ocean_eu'. */
  @Column({ length: 32 })
  bandKey: string;

  @Column({ length: 8 })
  mode: 'air' | 'ocean';

  /** Tarifa por unidad (USD por kg para aire; USD por m³ para marítimo LCL). */
  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: new DecimalTransformer(),
  })
  rate: number;

  @Column({ length: 12 })
  unit: string;

  @Column({ length: 160 })
  label: string;

  @Column({ length: 220 })
  sourceRef: string;

  @Column({ type: 'date' })
  effectiveDate: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
