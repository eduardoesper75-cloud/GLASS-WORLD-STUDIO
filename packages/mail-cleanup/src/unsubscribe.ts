// =====================================================================
// Ejecución de bajas
// ---------------------------------------------------------------------
// - `one-click`: POST RFC 8058 (`List-Unsubscribe=One-Click`).
// - `mailto`: correo de baja por SMTP (misma contraseña de aplicación).
// - `manual`: solo se reporta el enlace (requiere navegador).
// Por defecto NO actúa: `apply` debe ser true de forma explícita.
// =====================================================================

import nodemailer from 'nodemailer';

import { parseMailto } from './list-unsubscribe.js';
import type { MailboxAccount, UnsubscribeResult, UnsubscribeTarget } from './types.js';

export type FetchLike = typeof globalThis.fetch;

export interface UnsubscribeDeps {
  /** Inyectable en tests; por defecto `globalThis.fetch`. */
  fetchImpl?: FetchLike;
  /** Inyectable en tests; por defecto nodemailer sobre smtp.gmail.com:465. */
  sendMail?: (account: MailboxAccount, to: string, subject: string) => Promise<void>;
}

const DEFAULT_MAILTO_SUBJECT = 'unsubscribe';
const SMTP_HOST = 'smtp.gmail.com';
const SMTP_PORT = 465;

async function defaultSendMail(
  account: MailboxAccount,
  to: string,
  subject: string,
): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: true,
    auth: { user: account.username, pass: account.password },
  });
  try {
    await transporter.sendMail({
      from: account.address,
      to,
      subject,
      text: subject,
    });
  } finally {
    transporter.close();
  }
}

/** Normaliza el `mailto:` mínimo de cabecera (`unsubscribe` sin parámetros). */
function resolveMailto(endpoint: string | undefined): { to: string; subject: string } | undefined {
  if (endpoint === undefined) return undefined;
  const parsed = parseMailto(endpoint);
  if (parsed.to.length === 0 || !parsed.to.includes('@')) return undefined;
  return { to: parsed.to, subject: parsed.subject ?? DEFAULT_MAILTO_SUBJECT };
}

export async function performUnsubscribe(
  target: UnsubscribeTarget,
  account: MailboxAccount,
  options: { apply: boolean } & UnsubscribeDeps,
): Promise<UnsubscribeResult> {
  const base = { domain: target.domain, method: target.method };

  if (target.method === 'manual') {
    return {
      ...base,
      status: 'skipped',
      detail:
        target.manualLink !== undefined
          ? `baja manual (enlace): ${target.manualLink}`
          : 'sin cabecera ni enlace de baja',
    };
  }

  if (!options.apply) {
    return {
      ...base,
      ...(target.endpoint !== undefined ? { endpoint: target.endpoint } : {}),
      status: 'skipped',
      detail: `dry-run: se enviaría baja ${target.method} a ${target.endpoint ?? '(sin destino)'}`,
    };
  }

  if (target.method === 'one-click') {
    const endpoint = target.endpoint;
    if (endpoint === undefined) {
      return { ...base, status: 'error', detail: 'one-click sin URL' };
    }
    const fetchImpl = options.fetchImpl ?? globalThis.fetch;
    try {
      const response = await fetchImpl(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'List-Unsubscribe=One-Click',
        redirect: 'follow',
      });
      return {
        ...base,
        endpoint,
        status: response.ok ? 'ok' : 'error',
        detail: `POST RFC 8058 → HTTP ${response.status}`,
      };
    } catch (error) {
      return {
        ...base,
        endpoint,
        status: 'error',
        detail: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // method === 'mailto'
  const mailto = resolveMailto(target.endpoint);
  if (!mailto) {
    return { ...base, status: 'error', detail: 'mailto inválido' };
  }
  const sendMail = options.sendMail ?? defaultSendMail;
  try {
    await sendMail(account, mailto.to, mailto.subject);
    return { ...base, endpoint: mailto.to, status: 'ok', detail: `correo de baja a ${mailto.to}` };
  } catch (error) {
    return {
      ...base,
      endpoint: mailto.to,
      status: 'error',
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}
