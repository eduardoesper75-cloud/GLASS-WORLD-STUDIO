#!/usr/bin/env node
// =====================================================================
// GWS · Alta de cuentas para `imap-mcp-server` (headless, sin secretos)
// ---------------------------------------------------------------------
// Crea/actualiza `~/.imap-mcp/accounts.json` con las casillas objetivo, en
// modo "credenciales gestionadas por entorno": el usuario y la contraseña
// quedan VACÍOS y el servidor los resuelve al arrancar leyendo:
//
//   IMAP_MCP_ACCOUNT_<NOMBRE>_IMAP_USERNAME
//   IMAP_MCP_ACCOUNT_<NOMBRE>_IMAP_PASSWORD
//
// <NOMBRE> = nombre de la cuenta en MAYÚSCULAS con todo lo no alfanumérico
// reemplazado por "_". Ej.: "eduardoesper75" -> EDUARDOESPER75.
//
// Así NINGÚN secreto se escribe en disco: solo viven en `.env` / `.env.local`
// y en memoria del proceso (ver `launch.mjs`).
//
// Uso:
//   node provision-accounts.mjs
//   node provision-accounts.mjs --mailbox "eduardoesper75=eduardoesper75@gmail.com"
//   node provision-accounts.mjs --remove "nombre"
// =====================================================================

import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

const STORE_DIR = join(homedir(), '.imap-mcp');
const ACCOUNTS_PATH = join(STORE_DIR, 'accounts.json');
const KEY_PATH = join(STORE_DIR, '.key');

// Casilla oficial de Gmail de GWS (canal secundario). La casilla institucional
// (edu.esper@glassworldstudio.com.ar) no es de Gmail y se configura aparte.
const DEFAULT_MAILBOXES = [
  { name: 'eduardoesper75', email: 'eduardoesper75@gmail.com' },
];

const IMAP_HOST = 'imap.gmail.com';
const IMAP_PORT = 993;

/** Reproduce `envAccountKey` del servidor: nombre -> clave de variable. */
function envAccountKey(name) {
  return name.toUpperCase().replace(/[^A-Z0-9]/g, '_');
}

function parseArgs(argv) {
  const mailboxes = [];
  const remove = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === '--mailbox' && next) {
      const eq = next.indexOf('=');
      if (eq === -1) throw new Error(`Formato inválido para --mailbox: ${next}`);
      mailboxes.push({ name: next.slice(0, eq).trim(), email: next.slice(eq + 1).trim() });
      i += 1;
    } else if (arg === '--remove' && next) {
      remove.push(next.trim());
      i += 1;
    }
  }
  return { mailboxes, remove };
}

/** Garantiza la clave AES-256 del store (la crea si no existe). */
function ensureKey() {
  if (!existsSync(STORE_DIR)) mkdirSync(STORE_DIR, { recursive: true, mode: 0o700 });
  if (!existsSync(KEY_PATH)) {
    const key = randomUUID().replace(/-/g, '') + randomUUID().replace(/-/g, '');
    writeFileSync(KEY_PATH, key.slice(0, 64), { mode: 0o600 });
    return { created: true, key };
  }
  return { created: false, key: readFileSync(KEY_PATH, 'utf8') };
}

function loadAccounts() {
  if (!existsSync(ACCOUNTS_PATH)) return [];
  try {
    const parsed = JSON.parse(readFileSync(ACCOUNTS_PATH, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    throw new Error(`accounts.json ilegible: ${error instanceof Error ? error.message : error}`);
  }
}

function upsert(accounts, mailbox) {
  const existing = accounts.find((account) => account.name === mailbox.name);
  const record = {
    // `user` y `password` vacíos = credenciales gestionadas por entorno.
    id: existing?.id ?? randomUUID(),
    name: mailbox.name,
    email: mailbox.email,
    host: IMAP_HOST,
    port: IMAP_PORT,
    tls: true,
    user: '',
    password: '',
  };
  if (existing) {
    Object.assign(existing, record);
    return { action: 'actualizada', record: existing };
  }
  accounts.push(record);
  return { action: 'creada', record };
}

function main() {
  const { mailboxes, remove } = parseArgs(process.argv.slice(2));
  const target = mailboxes.length > 0 ? mailboxes : DEFAULT_MAILBOXES;

  const key = ensureKey();
  const accounts = loadAccounts();

  for (const name of remove) {
    const index = accounts.findIndex((account) => account.name === name);
    if (index >= 0) {
      accounts.splice(index, 1);
      process.stdout.write(`- eliminada: ${name}\n`);
    }
  }

  for (const mailbox of target) {
    const { action, record } = upsert(accounts, mailbox);
    const varBase = `IMAP_MCP_ACCOUNT_${envAccountKey(mailbox.name)}`;
    process.stdout.write(
      `✔ ${action}: "${mailbox.name}" <${mailbox.email}> (${IMAP_HOST}:${IMAP_PORT})\n` +
        `    usuario  -> ${varBase}_IMAP_USERNAME\n` +
        `    password -> ${varBase}_IMAP_PASSWORD\n`,
    );
    void record;
  }

  writeFileSync(ACCOUNTS_PATH, JSON.stringify(accounts, null, 2), { mode: 0o600 });
  process.stdout.write(
    `\nStore: ${ACCOUNTS_PATH}  (clave ${key.created ? 'creada' : 'existente'} en .key)\n` +
      'Recordatorio: define las variables en .env.local y arranca el MCP. Ningún secreto se guardó aquí.\n',
  );
}

main();
