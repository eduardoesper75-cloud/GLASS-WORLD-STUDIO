// =====================================================================
// Carga de entorno y descubrimiento de cuentas
// ---------------------------------------------------------------------
// Los secretos se leen EXCLUSIVAMENTE de `.env` / `.env.local` (o del
// entorno del proceso). Nunca de código, config ni argumentos de línea.
// =====================================================================

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { MailboxAccount } from './types.js';

/** Raíz del monorepo (resuelve igual desde `src/` con tsx y desde `dist/`). */
export const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

const DEFAULT_IMAP_HOST = 'imap.gmail.com';
const DEFAULT_IMAP_PORT = 993;

export interface Environment {
  values: Record<string, string>;
  files: string[];
}

/** Parser mínimo de `.env` (primer `=`, `export`, comillas, comentarios). */
function parseEnvFile(text: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const withoutExport = line.startsWith('export ') ? line.slice(7).trim() : line;
    const eq = withoutExport.indexOf('=');
    if (eq === -1) continue;
    const key = withoutExport.slice(0, eq).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
    let value = withoutExport.slice(eq + 1).trim();
    if (value.length >= 2) {
      const quote = value[0];
      if ((quote === '"' || quote === "'") && value.endsWith(quote)) {
        value = value.slice(1, -1);
      }
    }
    result[key] = value;
  }
  return result;
}

/**
 * Carga `.env`, `.env.local` y cualquier archivo adicional indicado. El
 * entorno del proceso (variables ya exportadas) tiene la última palabra.
 */
export function loadEnvironment(extraFiles: readonly string[] = []): Environment {
  const candidates = [
    ...extraFiles,
    join(REPO_ROOT, '.env'),
    join(REPO_ROOT, '.env.local'),
  ];
  const values: Record<string, string> = {};
  const files: string[] = [];
  for (const file of candidates) {
    if (!existsSync(file)) continue;
    try {
      Object.assign(values, parseEnvFile(readFileSync(file, 'utf8')));
      files.push(file);
    } catch {
      // Archivo ilegible: se ignora (no es crítico para el diagnóstico).
    }
  }
  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value === 'string' && value.length > 0 && /^(IMAP_MCP_|OUTSEND_)/.test(key)) {
      values[key] = value;
    }
  }
  return { values, files };
}

/** Nombre canónico de la variable de credencial para una clave de cuenta. */
export function credentialVarNames(key: string): { username: string; password: string } {
  const normalized = key.toUpperCase().replace(/[^A-Z0-9]/g, '_');
  return {
    username: `IMAP_MCP_ACCOUNT_${normalized}_IMAP_USERNAME`,
    password: `IMAP_MCP_ACCOUNT_${normalized}_IMAP_PASSWORD`,
  };
}

export interface AccountDiscovery {
  accounts: MailboxAccount[];
  /** Cuentas configuradas sin contraseña en el entorno (no se usan). */
  missingPassword: string[];
}

const ACCOUNT_USERNAME_RE = /^IMAP_MCP_ACCOUNT_(.+)_IMAP_USERNAME$/;

/**
 * Descubre las cuentas a partir de `IMAP_MCP_ACCOUNT_<KEY>_IMAP_USERNAME` +
 * `_IMAP_PASSWORD`. Si no hay ninguna, acepta el fallback del proyecto
 * `OUTSEND_MAILBOX_ADDRESS` + `OUTSEND_MAILBOX_PASSWORD` (cuenta `OUTREACH`).
 */
export function discoverAccounts(
  env: Environment,
  only: readonly string[] = [],
): AccountDiscovery {
  const values = env.values;
  const wanted = new Set(only.map((value) => value.toUpperCase()));
  const accounts: MailboxAccount[] = [];
  const missingPassword: string[] = [];

  for (const [varName, username] of Object.entries(values)) {
    const match = ACCOUNT_USERNAME_RE.exec(varName);
    const key = match?.[1];
    if (key === undefined || username.length === 0) continue;
    if (wanted.size > 0 && !wanted.has(key.toUpperCase())) continue;

    const password = values[credentialVarNames(key).password] ?? '';
    if (password.length === 0) {
      missingPassword.push(key);
      continue;
    }
    accounts.push({
      key,
      address: username,
      username,
      password,
      host: DEFAULT_IMAP_HOST,
      port: DEFAULT_IMAP_PORT,
    });
  }

  const outreachAddress = values.OUTSEND_MAILBOX_ADDRESS;
  const outreachPassword = values.OUTSEND_MAILBOX_PASSWORD;
  const canUseOutreach =
    accounts.length === 0 &&
    missingPassword.length === 0 &&
    outreachAddress !== undefined &&
    outreachAddress.length > 0 &&
    outreachPassword !== undefined &&
    outreachPassword.length > 0;
  if (canUseOutreach && (wanted.size === 0 || wanted.has('OUTREACH'))) {
    accounts.push({
      key: 'OUTREACH',
      address: outreachAddress,
      username: outreachAddress,
      password: outreachPassword,
      host: DEFAULT_IMAP_HOST,
      port: DEFAULT_IMAP_PORT,
    });
  }

  return { accounts, missingPassword };
}
