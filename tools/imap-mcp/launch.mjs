#!/usr/bin/env node
// =====================================================================
// GWS · Launcher del servidor MCP `imap-mcp-server`
// ---------------------------------------------------------------------
// Arranca `nikolausm/imap-mcp-server` (MIT) como servidor MCP stdio para
// OpenCode. Hace tres cosas y nada más:
//
//   1. Carga las credenciales EXCLUSIVAMENTE desde `.env` / `.env.local`
//      (nunca se escriben secretos en la configuración ni en el código).
//   2. Fuerza el modo READ-ONLY salvo que se pida lo contrario (Fase 1).
//   3. Lanza el servidor instalado fuera del repo, en `gws-tools`.
//
// REGLA DE ORO: por stdio el canal de stdout es el protocolo JSON-RPC del
// MCP. TODOS los mensajes de diagnóstico de este script van a stderr.
//
// Variables reconocidas:
//   IMAP_MCP_SERVER_ENTRY   Ruta a `dist/index.js` del servidor instalado.
//   IMAP_MCP_READ_ONLY      "true" (por defecto) | "false".
//   IMAP_MCP_ENABLED_TOOLS  Allowlist opcional de tools (pasa tal cual).
//   IMAP_MCP_ACCOUNT_<K>_IMAP_USERNAME / _IMAP_PASSWORD
//                           Credenciales por cuenta (las lee el servidor).
//   GWS_IMAP_ENV_FILE       `.env` adicional a cargar (p. ej. el de
//                           `gws-tools/openoutreach`), de menor prioridad.
// =====================================================================

import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..', '..');

/** Escribe diagnóstico en stderr (stdout está reservado al protocolo MCP). */
function log(message) {
  process.stderr.write(`[imap-mcp-launcher] ${message}\n`);
}

/** Ruta por defecto del servidor instalado junto al resto del tooling MCP. */
function defaultEntry() {
  const localAppData = process.env.LOCALAPPDATA ?? join(homedir(), 'AppData', 'Local');
  return join(
    localAppData,
    'gws-tools',
    'imap-mcp-server',
    'node_modules',
    'imap-mcp-server',
    'dist',
    'index.js',
  );
}

/**
 * Parser mínimo de `.env`: corta en el primer `=`, tolera `export`, comillas
 * simples/dobles y comentarios. No soporta interpolación (no la necesitamos).
 * @returns {Record<string, string>}
 */
function parseEnvFile(text) {
  const result = {};
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
 * Carga, en orden de prioridad creciente (lo último gana), los archivos de
 * entorno disponibles. Los secretos viven solo aquí.
 */
function loadEnvFiles() {
  const candidates = [
    process.env.GWS_IMAP_ENV_FILE, // p. ej. gws-tools/openoutreach/.env
    join(REPO_ROOT, '.env'),
    join(REPO_ROOT, '.env.local'),
  ].filter((value) => typeof value === 'string' && value.length > 0);

  const merged = {};
  const loaded = [];
  for (const file of candidates) {
    if (!existsSync(file)) continue;
    try {
      Object.assign(merged, parseEnvFile(readFileSync(file, 'utf8')));
      loaded.push(file);
    } catch (error) {
      log(`No se pudo leer ${file}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  return { merged, loaded };
}

function main() {
  const entry = process.env.IMAP_MCP_SERVER_ENTRY ?? defaultEntry();
  if (!existsSync(entry)) {
    log(`No se encontró el servidor en: ${entry}`);
    log('Instalalo con: npm i imap-mcp-server  (en gws-tools/imap-mcp-server)');
    process.exit(1);
  }

  const { merged, loaded } = loadEnvFiles();

  // El entorno cargado desde `.env*` pisa al de proceso, sin borrar el resto.
  const childEnv = { ...process.env, ...merged };

  // TLS: si el sistema tiene un CA raíz propio (antivirus con escaneo de
  // correo, proxy corporativo), Node no lo confía por defecto y la conexión
  // IMAPS falla con "self-signed certificate in certificate chain". Node
  // ≥ 22.15 admite `--use-system-ca`, que agrega el almacén del sistema.
  if (
    process.allowedNodeEnvironmentFlags.has('--use-system-ca') &&
    !/\b--use-system-ca\b/.test(childEnv.NODE_OPTIONS ?? '')
  ) {
    childEnv.NODE_OPTIONS = [childEnv.NODE_OPTIONS, '--use-system-ca']
      .filter((value) => typeof value === 'string' && value.length > 0)
      .join(' ');
    log('TLS: confiando en el almacén de certificados del sistema (--use-system-ca)');
  }

  // Modo READ-ONLY por defecto: la primera pasada es solo lectura.
  if (childEnv.IMAP_MCP_READ_ONLY === undefined || childEnv.IMAP_MCP_READ_ONLY === '') {
    childEnv.IMAP_MCP_READ_ONLY = 'true';
  }

  // Comodidad: si solo hay credenciales de envío del proyecto (OUTSEND_*),
  // se exponen como la cuenta "OUTREACH" de imap-mcp-server.
  const hasAccountVars = Object.keys(childEnv).some((key) =>
    /^IMAP_MCP_ACCOUNT_.+_IMAP_(USERNAME|PASSWORD)$/.test(key),
  );
  if (!hasAccountVars && childEnv.OUTSEND_MAILBOX_ADDRESS && childEnv.OUTSEND_MAILBOX_PASSWORD) {
    childEnv.IMAP_MCP_ACCOUNT_OUTREACH_IMAP_USERNAME = childEnv.OUTSEND_MAILBOX_ADDRESS;
    childEnv.IMAP_MCP_ACCOUNT_OUTREACH_IMAP_PASSWORD = childEnv.OUTSEND_MAILBOX_PASSWORD;
  }

  const accountKeys = Object.keys(childEnv)
    .filter((key) => /^IMAP_MCP_ACCOUNT_.+_IMAP_PASSWORD$/.test(key))
    .map((key) => key.replace(/^IMAP_MCP_ACCOUNT_/, '').replace(/_IMAP_PASSWORD$/, ''));

  log(`servidor: ${entry}`);
  log(`.env cargados: ${loaded.length ? loaded.join(' | ') : '(ninguno)'}`);
  log(`read-only: ${childEnv.IMAP_MCP_READ_ONLY}`);
  log(
    `cuentas con contraseña en entorno: ${accountKeys.length ? accountKeys.join(', ') : '(ninguna)'}`,
  );

  const child = spawn(process.execPath, [entry], {
    stdio: 'inherit',
    env: childEnv,
  });

  child.on('error', (error) => {
    log(`Error al iniciar el servidor: ${error.message}`);
    process.exit(1);
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      log(`Servidor terminado por señal ${signal}`);
      process.exit(0);
    }
    process.exit(code ?? 0);
  });
}

main();
