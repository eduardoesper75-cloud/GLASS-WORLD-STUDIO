import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { DecimalTransformer } from '../common/transformers/decimal.transformer';

/**
 * GWS · CustomsHsCode — Clasificación HS/NCM de referencia (motor aduanero)
 * ------------------------------------------------------------
 * Códigos HS (6 dígitos, base WCO) con aranceles de referencia por región:
 *   · dutyMercosur → Arancel Externo Común (NCM/AEC, AFIP).
 *   · dutyUsMfn    → US HTS General (MFN) 2026.
 *   · dutyEuCct    → EU Common Customs Tariff (terceros países), orientativo.
 * Cada fila lleva sourceRef + effectiveDate. La clasificación vinculante la
 * determina siempre la aduana del país de destino — este dato es ESTIMADOR,
 * no cotización (ver customs.const.ts → DISCLAIMER).
 */
@Entity('customs_hs_codes')
@Index(['productType'])
export class CustomsHsCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Código HS de 6 dígitos (ej. '7013.99'). */
  @Column({ length: 12, unique: true })
  code: string;

  @Column({ length: 220 })
  description: string;

  /** Clave de categoría lógica para el mapeo por tipo de producto. */
  @Column({ length: 32 })
  productType: string;

  @Column({
    type: 'numeric',
    precision: 5,
    scale: 2,
    transformer: new DecimalTransformer(),
  })
  dutyMercosur: number;

  @Column({
    type: 'numeric',
    precision: 5,
    scale: 2,
    transformer: new DecimalTransformer(),
  })
  dutyUsMfn: number;

  @Column({
    type: 'numeric',
    precision: 5,
    scale: 2,
    transformer: new DecimalTransformer(),
  })
  dutyEuCct: number;

  @Column({ length: 220 })
  sourceRef: string;

  @Column({ type: 'date' })
  effectiveDate: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
