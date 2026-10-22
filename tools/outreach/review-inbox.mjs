#!/usr/bin/env node
// =====================================================================
// Revisor IMAP de SOLO LECTURA — Campaña de Alianzas GWS
// ---------------------------------------------------------------------
// Lee la casilla configurada en `.env.local`, busca mensajes desde una
// fecha y clasifica los eventos de la campaña:
//   respuesta · bounce · autorespuesta · out_of_office · unsubscribe · sin_novedad
//
// Escribe:
//   docs/outreach/respuestas.jsonl      (registro canónico, append-only)
//   docs/outreach/respuestas-scan.json  (resumen de la corrida)
//
// Garantías:
//   - No envía correo.
//   - No mueve, marca ni borra mensajes.
//   - No imprime credenciales.
//
// Uso:
//   node --use-system-ca tools/outreach/review-inbox.mjs --since=2026-10-15
//   node --use-system-ca tools/outreach/review-inbox.mjs --since=2026-10-15 --dry-run
// =====================================================================

import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ENV_LOCAL = resolve(ROOT, '.env.local');
const LOG = resolve(ROOT, 'docs/logistica/send-log.jsonl');
const RESP = resolve(ROOT, 'docs/outreach/respuestas.jsonl');
const SCAN = resolve(ROOT, 'docs/outreach/respuestas-scan.json');
const IMAPFLOW = resolve(ROOT, 'packages/mail-cleanup/node_modules/imapflow/dist/esm/imap-flow.js');

const CAMPAIGN = 'alianzas-2026-10';
const args = process.argv.slice(2);
const opt = (k, d = '') => {
  const a = args.find((x) => x.startsWith(`--${k}=`));
  return a ? a.slice(k.length + 3) : d;
};
const flag = (k) => args.includes(`--${k}`);
const SINCE = opt('since', '2026-10-15');
const MAILBOX = opt('mailbox', 'INBOX');
const MAX = Number(opt('max', '500'));
const DRY = flag('dry-run');
const DEBUG = flag('debug');
const ACCOUNT_KEY = opt('account', 'IMAP_MCP_ACCOUNT_EDUARDOESPER75');

function readEnv(path) {
  const env = {};
  if (!existsSync(path)) return env;
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return env;
}

function readJsonl(path) {
  if (!existsSync(path)) return [];
  return readFileSync(path, 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.trim())
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

const env = readEnv(ENV_LOCAL);
const user = env[`${ACCOUNT_KEY}_IMAP_USERNAME`] || '';
const pass = env[`${ACCOUNT_KEY}_IMAP_PASSWORD`] || '';
if (!user || !pass) {
  console.error(`Faltan credenciales IMAP para ${ACCOUNT_KEY} en .env.local.`);
  process.exit(1);
}

const log = readJsonl(LOG).filter((r) => r.ok);
const recipients = new Map(); // email -> { company, segment }
for (const r of log) {
  const to = String(r.to || '').toLowerCase();
  if (!to) continue;
  recipients.set(to, {
    company: r.company || '',
    segment: r.perfil || r.categoria || r.tag || '(sin segmento)',
  });
}
if (recipients.size === 0) {
  console.error('El registro de envíos no tiene destinatarios OK. Nada que medir.');
  process.exit(1);
}

function decodeBody(raw, headerBlock) {
  const parts = raw.split(/\r?\n\r?\n/);
  let body = parts.slice(1).join('\n\n');
  const cte = (headerBlock.match(/^content-transfer-encoding:\s*(.+)$/im) || [])[1]?.trim().toLowerCase() || '';
  if (cte === 'base64') {
    const b64 = body.replace(/[^A-Za-z0-9+/=]/g, '');
    try {
      body = Buffer.from(b64, 'base64').toString('utf8');
    } catch {
      /* se usa el crudo */
    }
  } else if (cte === 'quoted-printable') {
    body = body
      .replace(/=\r?\n/g, '')
      .replace(/=([0-9A-F]{2})/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
  }
  if (/text\/html/i.test(headerBlock)) {
    body = body
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<[^>]+>/g, ' ');
  }
  return body.replace(/\s+/g, ' ').trim();
}

function findRecipient(text) {
  const lower = text.toLowerCase();
  return [...recipients.keys()].find((r) => lower.includes(r)) || '';
}

function classify(fromAddr, subject, text, autoSubmitted) {
  const from = fromAddr.toLowerCase();
  const subjectText = subject || '';
  const fullText = `${subjectText}\n${text}`;

  if (recipients.has(from)) {
    const neg = /(no (me )?interesa|no gracias|desuscrib|dar de baja|remove me|unsubscribe|stop emailing|no molestar)/i.test(fullText);
    const pos = /(me interesa|interesad|reuni[oó]n|llamada|agend|disponib|informaci[oó]n|propuesta|colabor|avancemos|hablemos|coordin)/i.test(fullText);
    return {
      tipo: 'respuesta',
      clasificacion: neg ? 'no_interesado' : pos ? 'interesado' : 'requiere_seguimiento',
      to: from,
    };
  }

  const bounceFrom = /mailer-daemon|postmaster|no-?reply.*(bounce|mailer)|bounce/i.test(from);
  const bounceSubj = /(undeliver|delivery status|mail delivery|failure notice|returned mail|no se pudo entregar|entrega no realizada|delivery has failed)/i.test(subjectText);
  if (bounceFrom || bounceSubj) {
    return { tipo: 'bounce', clasificacion: 'no_valido', to: findRecipient(text) };
  }

  const looksAuto =
    (autoSubmitted && !/^no$/i.test(autoSubmitted.trim())) ||
    /^(auto:|automatic reply|out of office|fuera de la oficina|respuesta autom|ausencia|vacaciones|abwesenheit)/i.test(subjectText);
  if (looksAuto) {
    const ooo = /(out of office|fuera de la oficina|ausencia|vacaciones|abwesenheit|on leave|de vacaciones)/i.test(fullText);
    return {
      tipo: ooo ? 'out_of_office' : 'autorespuesta',
      clasificacion: 'requiere_seguimiento',
      to: recipients.has(from) ? from : findRecipient(text),
    };
  }

  if (/\b(baja|unsubscribe|remove me|dar de baja)\b/i.test(fullText)) {
    return { tipo: 'unsubscribe', clasificacion: 'no_interesado', to: recipients.has(from) ? from : findRecipient(text) };
  }

  return null;
}

function mapEstado(tipo, clasificacion) {
  if (tipo === 'bounce') return 'REBOTADO';
  if (tipo === 'unsubscribe') return 'BAJA';
  if (tipo === 'autorespuesta' || tipo === 'out_of_office') return 'PAUSA';
  if (tipo === 'sin_novedad') return 'SIN_NOVEDAD';
  if (tipo === 'respuesta') return clasificacion === 'no_interesado' ? 'BAJA' : 'RESPONDIO';
  return 'RESPONDIO';
}

const { ImapFlow } = await import(pathToFileURL(IMAPFLOW).href);
const client = new ImapFlow({
  host: 'imap.gmail.com',
  port: 993,
  secure: true,
  auth: { user, pass },
  logger: false,
  tls: { host: 'imap.gmail.com' },
});

if (flag('folders')) {
  await client.connect();
  const list = await client.list();
  console.log('Carpetas IMAP:');
  for (const f of list) console.log(`  ${f.path}${f.specialUse ? ` (${f.specialUse})` : ''}`);
  await client.logout();
  process.exit(0);
}

const existing = readJsonl(RESP);
const existingKeys = new Set(
  existing.map((r) =>
    r.tipo === 'sin_novedad'
      ? `k:sin_novedad:${r.to}:${r.campaign}`
      : r.message_id
        ? `mid:${r.message_id}`
        : `k:${r.tipo}:${r.to}:${r.ts}`,
  ),
);

const events = [];
let scanned = 0;
let skipped = 0;

await client.connect();
try {
  const lock = await client.getMailboxLock(MAILBOX);
  try {
    const since = new Date(`${SINCE}T00:00:00Z`);
    for await (const msg of client.fetch(
      { since },
      { uid: true, envelope: true, internalDate: true, source: { start: 0, maxLength: 12000 } },
    )) {
      scanned += 1;
      if (scanned > MAX) break;
      const raw = msg.source ? msg.source.toString('utf8') : '';
      const headerBlock = raw.split(/\r?\n\r?\n/)[0] || '';
      const fromAddr = (msg.envelope?.from?.[0]?.address || '').toLowerCase();
      const subject = msg.envelope?.subject || '';
      const date = (msg.envelope?.date || msg.internalDate || new Date()).toISOString();
      if (flag('raw-list')) {
        const toAddr = (msg.envelope?.to?.[0]?.address || '').toLowerCase();
        console.error(`[${date.slice(0, 10)}] FROM ${fromAddr || '?'} TO ${toAddr || '?'} | ${subject.slice(0, 80)}`);
        skipped += 1;
        continue;
      }
      // Nunca interpretar nuestros propios envíos como respuestas/bajas.
      if (fromAddr === user.toLowerCase()) {
        skipped += 1;
        continue;
      }
      const autoSubmitted = (headerBlock.match(/^auto-submitted:\s*(.+)$/im) || [])[1] || '';
      const body = decodeBody(raw, headerBlock);
      const hit = classify(fromAddr, subject, body, autoSubmitted);
      if (DEBUG) {
        const tag = hit ? `${hit.tipo}/${hit.clasificacion} -> ${hit.to || '(sin atribuir)'}` : 'ignorado';
        console.error(`  [${date.slice(0, 10)}] ${fromAddr || '(sin from)'} | ${subject.slice(0, 70)} | ${tag}`);
      }
      if (!hit || !hit.to) {
        skipped += 1;
        continue;
      }
      const info = recipients.get(hit.to) || { company: '', segment: '' };
      const messageId = msg.envelope?.messageId || `${fromAddr}|${date}|${subject}`;
      const key = `mid:${messageId}`;
      if (existingKeys.has(key)) continue;
      existingKeys.add(key);
      events.push({
        ts: date,
        campaign: CAMPAIGN,
        to: hit.to,
        company: info.company,
        segment: info.segment,
        tipo: hit.tipo,
        clasificacion: hit.clasificacion,
        estado: mapEstado(hit.tipo, hit.clasificacion),
        asunto: subject.slice(0, 200),
        extracto: body.slice(0, 280),
        from: fromAddr,
        message_id: messageId,
        fuente: `imap:${MAILBOX}`,
      });
    }
  } finally {
    lock.release();
  }
} finally {
  await client.logout();
}

// Contactos sin evento: se registra "sin_novedad" para dejar el barrido completo.
const withEvent = new Set(events.map((e) => e.to));
for (const [to, info] of recipients) {
  if (withEvent.has(to)) continue;
  const key = `k:sin_novedad:${to}:${CAMPAIGN}`;
  if (existingKeys.has(key)) continue;
  existingKeys.add(key);
  events.push({
    ts: new Date().toISOString(),
    campaign: CAMPAIGN,
    to,
    company: info.company,
    segment: info.segment,
    tipo: 'sin_novedad',
    clasificacion: 'requiere_seguimiento',
    estado: 'SIN_NOVEDAD',
    asunto: '',
    extracto: 'Sin respuesta detectada en el barrido de solo lectura.',
    from: '',
    message_id: key,
    fuente: `scan:${SINCE}`,
  });
}

events.sort((a, b) => String(a.ts).localeCompare(String(b.ts)));

const counts = {};
for (const e of events) counts[e.tipo] = (counts[e.tipo] || 0) + 1;

const summary = {
  generatedAt: new Date().toISOString(),
  campaign: CAMPAIGN,
  mailbox: user.replace(/(.{2}).*(@.*)/, '$1***$2'),
  imapMailbox: MAILBOX,
  since: SINCE,
  scannedMessages: scanned,
  ignoredMessages: skipped,
  newEvents: events.length,
  counts,
  perContact: [...recipients.entries()].map(([to, info]) => {
    const ev = events.filter((e) => e.to === to);
    const last = ev[ev.length - 1];
    return {
      company: info.company,
      segment: info.segment,
      to,
      tipo: last?.tipo || 'sin_novedad',
      clasificacion: last?.clasificacion || 'requiere_seguimiento',
      estado: last?.estado || 'SIN_NOVEDAD',
      ts: last?.ts || '',
      asunto: last?.asunto || '',
    };
  }),
};

if (!DRY) {
  mkdirSync(dirname(RESP), { recursive: true });
  if (events.length > 0) {
    appendFileSync(RESP, `${events.map((e) => JSON.stringify(e)).join('\n')}\n`, 'utf8');
  }
  writeFileSync(SCAN, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
}

console.log(`Casilla: ${summary.mailbox} · carpeta: ${MAILBOX} · desde: ${SINCE}`);
console.log(`Mensajes leídos: ${scanned} · ignorados (no campaña): ${skipped}`);
console.log(`Eventos nuevos: ${events.length}`);
for (const [tipo, n] of Object.entries(counts)) console.log(`  ${tipo.padEnd(14)} ${n}`);
console.log(DRY ? '(dry-run) No se escribió nada.' : `Registro: ${RESP}`);
console.log(DRY ? '' : `Resumen:  ${SCAN}`);
