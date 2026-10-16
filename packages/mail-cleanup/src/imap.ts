// =====================================================================
// Motor IMAP del CLI (imapflow)
// ---------------------------------------------------------------------
// Conexión de solo lectura para auditar, y movimiento a Trash para la
// purga controlada. Nunca borra de forma permanente.
// =====================================================================

import { ImapFlow } from 'imapflow';
import type { FetchMessageObject } from 'imapflow';

import { parseListUnsubscribeHeaders } from './list-unsubscribe.js';
import type { MailboxAccount, MessageHeader } from './types.js';

export interface ScanOptions {
  /** Carpeta a escanear (por defecto `INBOX`). */
  mailbox: string;
  /** Ventana de antigüedad en días. */
  lookbackDays: number;
  /** Máximo de mensajes a analizar por casilla. */
  limit: number;
}

export interface ScanResult {
  headers: MessageHeader[];
  mailboxTotal: number;
}

interface EnvelopeAddress {
  name?: string;
  address?: string;
}

/**
 * Abre una conexión IMAP, ejecuta `fn` y garantiza el cierre. Fuerza TLS y
 * `logger: false` (imapflow no imprime mensajes ni credenciales).
 */
export async function withAccount<T>(
  account: MailboxAccount,
  fn: (client: ImapFlow) => Promise<T>,
): Promise<T> {
  const client = new ImapFlow({
    host: account.host,
    port: account.port,
    secure: true,
    tls: { host: account.host },
    auth: { user: account.username, pass: account.password },
    logger: false,
  });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    try {
      await client.logout();
    } catch {
      // El cierre no debe enmascarar el resultado real del bloque.
    }
  }
}

function pickSender(envelope: FetchMessageObject['envelope']): EnvelopeAddress {
  const from = envelope?.from as EnvelopeAddress[] | undefined;
  const first = from?.[0];
  return first ?? {};
}

function isoDate(value: Date | string | undefined): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string' && value.length > 0) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
  }
  return '';
}

function toHeader(
  accountKey: string,
  mailbox: string,
  message: FetchMessageObject,
): MessageHeader | null {
  const uid = message.uid;
  if (uid === undefined) return null;

  const sender = pickSender(message.envelope);
  const address = (sender.address ?? '').toLowerCase();
  const domain = address.includes('@') ? (address.split('@')[1] ?? '') : '';
  const listHeaders = parseListUnsubscribeHeaders(message.headers);

  const header: MessageHeader = {
    accountKey,
    mailbox,
    uid,
    fromName: sender.name ?? '',
    fromAddress: address,
    domain,
    subject: message.envelope?.subject ?? '',
    date: isoDate(message.envelope?.date ?? message.internalDate),
    ...(listHeaders.listUnsubscribe !== undefined
      ? { listUnsubscribe: listHeaders.listUnsubscribe }
      : {}),
    ...(listHeaders.listUnsubscribePost !== undefined
      ? { listUnsubscribePost: listHeaders.listUnsubscribePost }
      : {}),
  };
  return header;
}

/**
 * Escanea una carpeta y devuelve las cabeceras relevantes. Solo lectura:
 * usa una búsqueda por fecha (`since`) y limita el número de mensajes.
 */
export async function scanMailbox(
  account: MailboxAccount,
  options: ScanOptions,
): Promise<ScanResult> {
  return withAccount(account, async (client) => {
    const lock = await client.getMailboxLock(options.mailbox);
    try {
      const mailbox = client.mailbox;
      const mailboxTotal = mailbox && typeof mailbox === 'object' ? mailbox.exists : 0;

      const since = new Date(Date.now() - options.lookbackDays * 86_400_000);
      const headers: MessageHeader[] = [];

      for await (const message of client.fetch(
        { since },
        {
          uid: true,
          envelope: true,
          internalDate: true,
          headers: ['list-unsubscribe', 'list-unsubscribe-post'],
        },
      )) {
        const header = toHeader(account.key, options.mailbox, message);
        if (header) headers.push(header);
        if (headers.length >= options.limit) break;
      }

      return { headers, mailboxTotal };
    } finally {
      lock.release();
    }
  });
}

/** Resuelve la carpeta Papelera usando su rol SPECIAL-USE (`\Trash`). */
export async function resolveTrashPath(client: ImapFlow): Promise<string> {
  const folders = await client.list();
  const trash = folders.find((folder) => folder.specialUse === '\\Trash');
  if (trash) return trash.path;
  const byName = folders.find((folder) => /(^|[./])trash$/i.test(folder.path));
  return byName?.path ?? 'Trash';
}

export interface MovePlanItem {
  mailbox: string;
  uids: number[];
}

/**
 * Mueve a Trash los UIDs indicados, agrupados por carpeta. Devuelve cuántos
 * mensajes se movieron realmente. Requiere `dryRun=false` para actuar.
 */
export async function moveToTrash(
  account: MailboxAccount,
  plan: readonly MovePlanItem[],
  options: { dryRun: boolean },
): Promise<number> {
  return withAccount(account, async (client) => {
    const trashPath = await resolveTrashPath(client);
    let moved = 0;
    for (const group of plan) {
      if (group.uids.length === 0) continue;
      if (options.dryRun) {
        moved += group.uids.length;
        continue;
      }
      const lock = await client.getMailboxLock(group.mailbox);
      try {
        for (let i = 0; i < group.uids.length; i += 100) {
          const chunk = group.uids.slice(i, i + 100);
          const result = await client.messageMove(chunk, trashPath, { uid: true });
          if (result) moved += chunk.length;
        }
      } finally {
        lock.release();
      }
    }
    return moved;
  });
}
