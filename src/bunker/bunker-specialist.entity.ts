import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { DecimalTransformer } from '../common/transformers/decimal.transformer';

/** Registro de credencial de un especialista (matrícula, homologación). */
export interface SpecialistCredential {
  title: string;
  issuer: string;
  credentialId?: string;
}

/**
 * GWS · BunkerSpecialist — perfil de ingeniero/técnico de élite
 * ------------------------------------------------------------
 * Se cuelga de una cuenta User (1:1). `verified` lo marca SOLO Jorge
 * (admin + elevación 'verify_bunker_specialist'): es el sello de la
 * cartera élite. `credentials` (jsonb) es la matriz de credenciales:
 * matrículas, homologaciones, certificaciones — validada por el escuadrón
 * de investigación contra los estándares internacionales.
 */
@Entity('bunker_specialists')
@Index(['countryCode'])
@Index(['verified'])
export class BunkerSpecialist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: string;

  @Column({ length: 120 })
  publicName: string;

  /** Nombre y apellido completo (alta/matriculación — privado, no público). */
  @Column({ length: 160 })
  fullName: string;

  /** Correo profesional de contacto (privado — solo despacho del Búnker). */
  @Column({ length: 200 })
  professionalEmail: string;

  /** Teléfono directo E.164 con código internacional (privado). */
  @Column({ length: 20 })
  phoneE164: string;

  /** Nacionalidad del profesional (datos de matriculación). */
  @Column({ length: 64 })
  nationality: string;

  /** Título habilitante (Ing. Mecánico, Electricista, Mecatrónico...). */
  @Column({ length: 200 })
  academicTitle: string;

  /** Nº de matrícula profesional / colegiación vigente. */
  @Column({ length: 80 })
  registrationNumber: string;

  /** Institución u organismo expedidor del título. */
  @Column({ length: 200 })
  issuingInstitution: string;

  /** Años de experiencia documentada en la industria del vidrio. */
  @Column({ type: 'int' })
  yearsExperience: number;

  /** Tipos de soporte ofertado: remote_global / regional_on_site /
   * plant_emergency (ver bunker.const.ts). */
  @Column({ type: 'jsonb', default: [] })
  supportTypes: string[];

  @Column()
  headline: string;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  /** Ej: [{ title: 'Ing. Mecánico (matrícula)', issuer: 'UTN', credentialId: 'M-4521' }] */
  @Column({ type: 'jsonb', default: [] })
  credentials: SpecialistCredential[];

  /** Ej: ["hornos_industriales", "plc", "templado"] — ver bunker.const.ts. */
  @Column({ type: 'jsonb', default: [] })
  specialties: string[];

  /** ISO 3166-1 alpha-2 — base de la asignación por región. */
  @Column({ length: 2 })
  countryCode: string;

  @Column({ nullable: true })
  region: string | null;

  /** Honorario referencial por hora (display; la cotización real la fija
   * el especialista por ticket con comisión 0%). */
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: new DecimalTransformer(),
  })
  hourlyRateUsd: number | null;

  /** Sello de la cartera élite — solo Jorge (admin + elevación). */
  @Column({ type: 'boolean', default: false })
  verified: boolean;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
