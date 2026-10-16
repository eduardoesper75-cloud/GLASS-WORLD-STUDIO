// =====================================================================
// Purga controlada: mover a Trash (NUNCA borrado permanente en esta fase)
// =====================================================================

import { moveToTrash, type MovePlanItem } from './imap.js';
import type { MailboxAccount, MessageHeader } from './types.js';

export interface PurgeResult {
  moved: number;
  plan: MovePlanItem[];
}

/** Agrupa los mensajes por carpeta para moverlos en bloque. */
export function buildMovePlan(messages: readonly MessageHeader[]): MovePlanItem[] {
  const byMailbox = new Map<string, number[]>();
  for (const message of messages) {
    const uids = byMailbox.get(message.mailbox) ?? [];
    uids.push(message.uid);
    byMailbox.set(message.mailbox, uids);
  }
  return [...byMailbox.entries()].map(([mailbox, uids]) => ({ mailbox, uids }));
}

/**
 * Mueve a la Papelera los mensajes indicados. Con `dryRun` no toca el
 * servidor: solo cuenta lo que se movería.
 */
export async function purgeMessages(
  account: MailboxAccount,
  messages: readonly MessageHeader[],
  options: { dryRun: boolean },
): Promise<PurgeResult> {
  const plan = buildMovePlan(messages);
  const moved = await moveToTrash(account, plan, { dryRun: options.dryRun });
  return { moved, plan };
}
