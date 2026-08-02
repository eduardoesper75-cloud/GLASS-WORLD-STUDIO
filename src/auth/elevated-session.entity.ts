import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { User } from '../users/user.entity';

/**
 * GWS · ElevatedSession
 * ------------------------------------------------------------
 * Implementa CLAUDE.md §3.5: la elevación a modo admin es un
 * evento con ventana de tiempo, no un estado permanente del rol.
 * Toda sesión elevada:
 *   - Requiere reautenticación (password + TOTP) — ver auth.service.ts
 *   - Expira sola (expiresAt), sin necesidad de "cerrar sesión" manual
 *   - Queda registrada con IP, para poder auditar después quién y
 *     cuándo operó con privilegios elevados
 */
@Entity('elevated_sessions')
export class ElevatedSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: string;

  @Column()
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string | null;

  /** Ventana de validez — recomendado 20-30 minutos (CLAUDE.md §3.5). */
  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ type: 'boolean', default: false })
  revokedManually: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
