import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../users/user.entity';

/**
 * GWS · FoundingClaim — Cupo de fundación tomado por un usuario
 * ------------------------------------------------------------
 * UNIQUE(userId, galaxy): un usuario puede tomar UN cupo por
 * galaxia (puede tomar en varias, una por cada una). Es la prueba
 * de membresía fundadora que evalúa GalaxyAccessGuard: si una
 * galaxia agotó sus cupos, entrar requiere tener claim o ser admin.
 *
 * No guarda ningún dato de pago (ver CLAUDE.md §3.1): el claim es
 * la intención de fundar; la liquidación de la contribución fundadora
 * es asunto del Payment_Vault, fuera del alcance de esta sesión.
 */
@Entity('founding_claims')
@Index(['userId', 'galaxy'], { unique: true })
@Index(['galaxy'])
export class FoundingClaim {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: string;

  /** Id de galaxia (g1..g6) — ver galaxies.const.ts. */
  @Column({ length: 8 })
  galaxy: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
