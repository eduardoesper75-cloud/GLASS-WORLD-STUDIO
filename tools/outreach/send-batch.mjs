#!/usr/bin/env node
// Envío automatizado de correos de outreach (logística / institucionales) — Glass World Studio.
//
// Compone cada correo con el copy CANÓNICO del archivo indicado y lo envía por SMTP usando
// curl, con *throttling* entre envíos y registro JSONL por correo. Emisor por defecto: la
// casilla institucional (Don Web).
// Sólo envía a destinatarios con correo real (`**Para:**`); los de formulario web NO se tocan.
// Es IDEMPOTENTE: omite los correos ya enviados OK (usar --force para reenviar).
//
// Autorización: el dueño pidió expresamente automatizar el envío (16-10-2026).
// Las credenciales se leen de `.env.local` (nunca se versionan ni se imprimen).
//
// Uso:
//   node tools/outreach/send-batch.mjs                                   (dry-run, Lote 1)
//   node tools/outreach/send-batch.mjs --execute
//   node tools/outreach/send-batch.mjs --execute --tag=lote2 --source=docs/logistica/GWS_Correos_Forwarders.md
//   node tools/outreach/send-batch.mjs --execute --throttle=60000 --only=user@dominio.com

import { readFileSync, appendFileSync, existsSync, writeFileSync, unlinkSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ENV_LOCAL = resolve(ROOT, '.env.local');
const LOG = resolve(ROOT, 'docs/logistica/send-log.jsonl');
// Modo operativo VERSIONADO (docs/outreach/GWS_Modo_Operativo.md): `reposo` deja el sistema en
// modo consulta e investigación pasiva y bloquea el envío real. Cambiarlo es un acto explícito.
const MODO_PATH = resolve(ROOT, 'docs/outreach/GWS_Modo_Operativo.md');
function modoOperativo() {
  if (!existsSync(MODO_PATH)) return 'activo';
  const m = readFileSync(MODO_PATH, 'utf8').match(/^estado:\s*(\S+)/m);
  return (m ? m[1] : 'activo').toLowerCase();
}

// Transporte SMTP por defecto: la casilla INSTITUCIONAL (Don Web/Ferozo, canal primario).
// Configurable por entorno; si sólo hay credenciales de Gmail, cae al canal secundario.
const DEFAULT_SMTP = { host: 'mail.glassworldstudio.com.ar', port: 465 };

const args = process.argv.slice(2);
const opt = (k, d) => {
  const a = args.find((x) => x.startsWith(`--${k}=`));
  return a ? a.slice(k.length + 3) : d;
};
const flag = (k) => args.includes(`--${k}`);
const EXECUTE = flag('execute');
const THROTTLE = Number(opt('throttle', '60000'));
const ONLY = opt('only', '');
const TAG = opt('tag', 'lote1');
const SOURCE = resolve(ROOT, opt('source', 'docs/logistica/GWS_Correos_Logistica.md'));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function readEnv(path) {
  const env = {};
  if (!existsSync(path)) return env;
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return env;
}

function parseCorreos(md) {
  const out = [];
  for (const b of md.split(/\n## /).slice(1)) {
    const company = (b.match(/^([^\n·]+)/) || [])[1];
    const to = (b.match(/\*\*Para:\*\*\s*([^\s\n]+)/) || [])[1];
    const asunto = (b.match(/\*\*Asunto:\*\*\s*([^\n]+)/) || [])[1];
    const perfil = (b.match(/\*\*Perfil:\*\*\s*([^\s·]+)/) || [])[1] || (b.match(/\*\*Categoría:\*\*\s*([^\s·]+)/) || [])[1] || '';
    const bodyM = b.match(/```\n([\s\S]*?)\n```/);
    if (company && to && to.includes('@') && asunto && bodyM) {
      out.push({ company: company.trim(), to: to.trim(), asunto: asunto.trim(), perfil, body: bodyM[1] });
    }
  }
  return out;
}

const b64hdr = (s) => `=?UTF-8?B?${Buffer.from(s, 'utf8').toString('base64')}?=`;
const wrap76 = (s) => s.replace(/(.{76})/g, '$1\r\n');

const OPTOUT =
  '\n\n—\nRecibís este mensaje porque tu organización figura en el ecosistema del vidrio.\n' +
  'Si preferís no recibir más, respondé "BAJA" y te damos de baja de inmediato.';

function buildMessage({ from, to, subject, body }) {
  const headers = [
    `From: "Eduardo Esper - Glass World Studio" <${from}>`,
    `To: <${to}>`,
    `Subject: ${b64hdr(subject)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${randomUUID()}@glassworldstudio.gws>`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    `List-Unsubscribe: <mailto:${from}?subject=BAJA>`,
    'List-Unsubscribe-Post: List-Unsubscribe=One-Click',
    'X-Mailer: GWS-Outreach',
  ];
  const raw = `${headers.join('\r\n')}\r\n\r\n${wrap76(Buffer.from(body + OPTOUT, 'utf8').toString('base64'))}`;
  return raw;
}

function curlSend({ from, to, pass, raw, insecure, host, port }) {
  const file = resolve(tmpdir(), `gws-${randomUUID()}.eml`);
  writeFileSync(file, raw, 'utf8');
  const a = [
    '--silent', '--show-error',
    '--url', `smtp://${host}:${port}`, '--ssl-reqd',
    '--user', `${from}:${pass}`,
    '--mail-from', from, '--mail-rcpt', to, '--upload-file', file,
  ];
  if (insecure) a.push('-k');
  try {
    execFileSync('curl.exe', a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { ok: true };
  } catch (e) {
    const err = `${e.stderr || ''}${e.stdout || ''}${e.message || ''}`;
    return { ok: false, err: err.trim().slice(0, 300) };
  } finally {
    try { unlinkSync(file); } catch { /* noop */ }
  }
}

// Resuelve el emisor SMTP a partir del entorno local.
//   1) Casilla institucional en Don Web (primario): OUTSEND_MAILBOX_*.
//   2) Respaldo: canal secundario de Gmail, si hay app password configurada.
function describeTransport(env) {
  const institutional = {
    address: env.OUTSEND_MAILBOX_ADDRESS || '',
    password: env.OUTSEND_MAILBOX_PASSWORD || '',
    host: env.OUTSEND_SMTP_HOST || DEFAULT_SMTP.host,
    port: Number(env.OUTSEND_SMTP_PORT || DEFAULT_SMTP.port),
    label: 'institucional (Don Web)',
  };
  if (institutional.address && institutional.password) return institutional;

  const gmail = {
    address: env.IMAP_MCP_ACCOUNT_EDUARDOESPER75_IMAP_USERNAME || '',
    password: env.IMAP_MCP_ACCOUNT_EDUARDOESPER75_IMAP_PASSWORD || '',
    host: 'smtp.gmail.com',
    port: 587,
    label: 'personal Gmail (respaldo)',
  };
  if (gmail.address && gmail.password) return gmail;

  // Sin credenciales: se informa el emisor PREVISTO (canal primario) y se exige
  // la contraseña recién al enviar de verdad.
  return { ...institutional, label: 'institucional (Don Web) · SIN CREDENCIALES' };
}

async function main() {
  const env = readEnv(ENV_LOCAL);
  const modo = modoOperativo();
  const transport = describeTransport(env);
  const { address: from, password: pass, host, port } = transport;
  console.log(`Emisor SMTP: ${from} · ${host}:${port} · ${transport.label}`);
  console.log(
    `Modo operativo: ${modo}${modo === 'activo' ? '' : ' · ENVÍO BLOQUEADO (consulta e investigación)'}`,
  );

  const done = new Set();
  if (existsSync(LOG)) {
    for (const line of readFileSync(LOG, 'utf8').split(/\r?\n/)) {
      if (!line.trim()) continue;
      try { const r = JSON.parse(line); if (r.ok) done.add(r.to?.toLowerCase()); } catch { /* noop */ }
    }
  }
  const all = parseCorreos(readFileSync(SOURCE, 'utf8')).filter((t) => !ONLY || t.to === ONLY);
  const targets = all.filter((t) => flag('force') || !done.has(t.to.toLowerCase()));
  const omitted = all.length - targets.length;
  console.log(`Lote: ${TAG} · fuente: ${SOURCE}`);
  console.log(
    `Modo: ${EXECUTE ? 'ENVÍO REAL' : 'DRY-RUN'} · con email en la fuente: ${all.length} · ` +
      `ya enviados (se omiten): ${omitted} · a enviar: ${targets.length} · ` +
      `en el log OK (global): ${done.size} · throttle ${THROTTLE}ms`,
  );
  targets.forEach((t, i) => console.log(`  ${i + 1}. ${t.company} <${t.to}> — ${t.asunto}`));
  if (!EXECUTE) {
    console.log('\n(dry-run) No se envió nada. Agregá --execute para enviar.');
    return;
  }
  if (modo !== 'activo') {
    console.error(
      `Envío bloqueado: el modo operativo es "${modo}" (${MODO_PATH}).\n` +
        'Ese estado deja el sistema en consulta e investigación pasiva (pausa institucional).\n' +
        'Para habilitar el envío: poné `estado: activo` en ese archivo, con fecha y motivo, y volvé a intentar.',
    );
    process.exitCode = 1;
    return;
  }
  if (!from || !pass) {
    console.error(
      'Faltan credenciales SMTP en .env.local: definí OUTSEND_MAILBOX_ADDRESS y ' +
        'OUTSEND_MAILBOX_PASSWORD para la casilla institucional, o las variables explícitas ' +
        'del canal Gmail de respaldo. No hay direcciones por defecto.',
    );
    process.exitCode = 1;
    return;
  }

  let sent = 0;
  let failed = 0;
  for (let i = 0; i < targets.length; i += 1) {
    const t = targets[i];
    const raw = buildMessage({ from, to: t.to, subject: t.asunto, body: t.body });
    let r = curlSend({ from, to: t.to, pass, raw, insecure: false, host, port });
    if (!r.ok && /certificate|ssl|schannel|self-signed/i.test(r.err || '')) {
      r = curlSend({ from, to: t.to, pass, raw, insecure: true, host, port });
    }
    const rec = {
      ts: new Date().toISOString(),
      tag: TAG,
      company: t.company,
      to: t.to,
      perfil: t.perfil,
      ok: r.ok,
      err: r.err || '',
    };
    appendFileSync(LOG, `${JSON.stringify(rec)}\n`, 'utf8');
    if (r.ok) {
      sent += 1;
      console.log(`  [OK]  enviado -> ${t.company} <${t.to}>`);
    } else {
      failed += 1;
      console.log(`  [ERR] fallo -> ${t.company}: ${r.err}`);
    }
    if (i < targets.length - 1) await sleep(THROTTLE);
  }
  console.log(`\nResultado: ${sent} enviados · ${failed} fallidos. Log: ${LOG}`);
}

main();
