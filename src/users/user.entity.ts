import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { GwsRole } from '../common/enums/gws-role.enum';

/**
 * GWS · Entidad User
 * ------------------------------------------------------------
 * Deliberadamente NO contiene ningún dato de pago (número de
 * tarjeta, token de procesador, balance de wallet). Eso vive en
 * un servicio/esquema separado (Payment_Vault / WalletService),
 * precisamente para que esta tabla —la más consultada de todo el
 * sistema— nunca sea la que un incidente de seguridad exponga
 * junto con datos financieros. Ver CLAUDE.md §3.1.
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column()
  email: string;

  @Index({ unique: true })
  @Column()
  username: string;

  @Column()
  fullName: string;

  /** Hash de contraseña (bcrypt/argon2). NUNCA se serializa en respuestas
   * de la API — ver DTO de salida en auth.service.ts. */
  @Column({ select: false })
  passwordHash: string;

  /** Secreto TOTP para 2FA, usado en la elevación de privilegio a modo
   * admin (CLAUDE.md §3.5). Null hasta que el usuario configure 2FA. */
  @Column({ nullable: true, select: false })
  totpSecret: string | null;

  @Column({ type: 'boolean', default: false })
  totpEnabled: boolean;

  /** Versión de la sesión JWT (gws-security-hardening). Cada incremento
   * invalida TODOS los tokens emitidos antes: se sube al activar/desactivar
   * 2FA y al cambiar el rol de la cuenta. JwtAuthGuard compara este valor
   * contra el del payload del token — un token "viejo" deja de servir de
   * inmediato, sin esperar la expiración de 2 h. */
  @Column({ type: 'int', default: 0 })
  tokenVersion: number;

  /** Rol base de la cuenta. El rol ADMIN por sí solo NO habilita acciones
   * críticas — ver ACTIONS_REQUIRING_ELEVATION y ElevatedSession. */
  @Column({ type: 'enum', enum: GwsRole, default: GwsRole.SUBSCRIBER })
  role: GwsRole;

  @Column({ default: 'es' })
  preferredLanguage: string;

  /** ISO 4217 — moneda de exhibición elegida por el usuario (selector de
   * la Portada). Solo display: la liquidación es del Payment_Vault (§3.1). */
  @Column({ default: 'USD' })
  preferredCurrency: string;

  @Column({ type: 'boolean', default: false })
  emailVerified: boolean;

  /** Traza mínima de consentimiento — para acompañar la Política de
   * Privacidad (aún pendiente de validación legal, ver CLAUDE.md §4). */
  @Column({ type: 'timestamptz', nullable: true })
  privacyAcceptedAt: Date | null;

  @Column({ nullable: true })
  privacyPolicyVersion: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
