import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * GWS · FoundingSlot — Cupos de fundación por Galaxia
 * ------------------------------------------------------------
 * No es un simple contador: es el total configurable (1000/1000/
 * 2000/1000/1000/1000) que se seeda en la migración FoundationSlots.
 * El "cuántos quedan" se calcula contra founding_claims (count),
 * nunca se persiste como número restante — un número persistido se
 * desincronizaría en concurrente. El claim transaccional (service)
 * lee el slot con pesimistic_write y cuenta claims dentro de la misma
 * transacción: así el límite es duro, no aproximado.
 *
 * enabled=false corta nuevos claims sin borrar el histórico ni los
 * cupos ya tomados (sirve para pausar la fundación de una galaxia).
 */
@Entity('founding_slots')
@Index(['galaxy'], { unique: true })
export class FoundingSlot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Id de galaxia (g1..g6) — ver galaxies.const.ts. Único por fila. */
  @Column({ length: 8 })
  galaxy: string;

  @Column({ type: 'int' })
  totalSlots: number;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
