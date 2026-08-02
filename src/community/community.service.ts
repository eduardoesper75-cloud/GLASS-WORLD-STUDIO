import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from './chat-message.entity';
import { AuditLog } from '../audit/audit-log.entity';
import {
  detectContactLeak,
  CONTACT_LEAK_POLICY_MESSAGE,
} from './anti-leak/contact-leak-filter';

const MAX_MESSAGE_LENGTH = 2000;

@Injectable()
export class CommunityService {
  constructor(
    @InjectRepository(ChatMessage) private messageRepo: Repository<ChatMessage>,
    @InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>,
  ) {}

  async postMessage(authorId: string, channelId: string, content: string, ipAddress: string): Promise<ChatMessage> {
    const trimmed = content.trim();
    if (!trimmed) {
      throw new BadRequestException('El mensaje no puede estar vacío');
    }
    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      throw new BadRequestException(`El mensaje excede el máximo de ${MAX_MESSAGE_LENGTH} caracteres`);
    }

    // Soberanía de la plataforma (CLAUDE.md §3.6): el detector anti-fuga
    // corre SIEMPRE server-side, antes de guardar. Si el mensaje intenta
    // sacar contacto/operación fuera de GWS, se BLOQUEA (no se guarda) y
    // se audita. Decisión explícita de Jorge: bloquear, no solo marcar.
    const verdict = detectContactLeak(trimmed);
    if (verdict.blocked) {
      await this.auditRepo.save(
        this.auditRepo.create({
          userId: authorId,
          action: 'chat_contact_leak_blocked',
          targetResource: `Channel:${channelId}`,
          metadata: {
            categories: verdict.categories,
            samples: verdict.samples,
            content: trimmed,
          },
          ipAddress,
          requiredElevation: false,
        }),
      );
      throw new BadRequestException({
        message: CONTACT_LEAK_POLICY_MESSAGE,
        blockedCategories: verdict.categories,
        samples: verdict.samples,
      });
    }

    const message = this.messageRepo.create({
      authorId,
      channelId,
      content: trimmed,
      // Ingress blocking: ningún mensaje almacenado contiene datos de contacto
      // (se rechazan antes de llegar acá). El campo se conserva en el esquema
      // para poder auditar/analizar históricos y para un futuro escaneo
      // retroactivo de mensajes ya guardados.
      containsContactInfo: false,
    });
    return this.messageRepo.save(message);
  }

  async listChannelMessages(channelId: string, limit = 50): Promise<ChatMessage[]> {
    return this.messageRepo.find({
      where: { channelId, hiddenByModeration: false },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['author'],
    });
  }

  /**
   * Acción de moderador (requiere rol MODERATOR_G3 o ADMIN vía RolesGuard
   * en el controller — no requiere ElevationGuard porque no es una acción
   * de las listadas en ACTIONS_REQUIRING_ELEVATION; moderar contenido de
   * comunidad es operativo, no crítico-financiero).
   */
  async hideMessage(
    messageId: string,
    moderatorId: string,
    reason: string,
    ipAddress: string,
  ): Promise<void> {
    await this.messageRepo.update(messageId, { hiddenByModeration: true, hiddenReason: reason });
    await this.auditRepo.save(
      this.auditRepo.create({
        userId: moderatorId,
        action: 'hide_chat_message',
        targetResource: `ChatMessage:${messageId}`,
        metadata: { reason },
        ipAddress,
        requiredElevation: false,
      }),
    );
  }
}
