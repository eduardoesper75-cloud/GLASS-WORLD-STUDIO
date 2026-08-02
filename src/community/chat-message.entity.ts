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
 * GWS · ChatMessage (Galaxia 3 · Comunidad)
 * ------------------------------------------------------------
 * Soberanía de la plataforma (CLAUDE.md §3.6): el chat interno es la
 * única vía de contacto/negociación, y el backend BLOQUEA en el
 * servidor cualquier mensaje con datos de contacto externos (ver
 * anti-leak/contact-leak-filter.ts). Por eso todo mensaje guardado
 * tiene containsContactInfo=false: los que intentarían fugarse nunca
 * llegan a esta tabla — se rechazan con 400 y se auditan como
 * chat_contact_leak_blocked. La validación del navegador solo
 * advierte antes de enviar; la real es esta, server-side.
 *
 * containsContactInfo se conserva en el esquema para auditar y
 * analizar históricos, y para un futuro escaneo retroactivo de
 * mensajes guardados antes de la política de bloqueo.
 */
@Entity('chat_messages')
@Index(['channelId', 'createdAt'])
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Por ahora, un solo canal general de comunidad. Cuando se necesiten
   * canales temáticos o privados, esto se separa a una entidad Channel
   * propia — no se sobre-diseña ahora sin ese requisito concreto. */
  @Column({ default: 'general' })
  channelId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  author: User;

  @Column()
  authorId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'boolean', default: false })
  containsContactInfo: boolean;

  @Column({ type: 'boolean', default: false })
  hiddenByModeration: boolean;

  @Column({ nullable: true })
  hiddenReason: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
