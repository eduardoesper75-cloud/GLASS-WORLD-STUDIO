#!/usr/bin/env node
// =====================================================================
// GWS · CLI de limpieza de correo
// ---------------------------------------------------------------------
// Subcomandos:
//   accounts     Lista las cuentas detectadas en el entorno.
//   audit        Escanea (solo lectura) y genera el ranking de remitentes.
//   unsubscribe  Procesa bajas List-Unsubscribe / RFC 8058 (dry-run nativo).
//   purge        Mueve a Trash los remitentes aprobados (dry-run nativo).
//
// Seguridad: los secretos se leen solo de `.env` / `.env.local`. Nada se
// ejecuta sin `--apply` (y `--yes` para la purga).
// =====================================================================

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { buildReport, renderMarkdown, type AccountMeta } from './audit.js';
import { REPO_ROOT, discoverAccounts, loadEnvironment, type Environment } from './env.js';
import { scanMailbox } from './imap.js';
import { resolveUnsubscribeTarget } from './list-unsubscribe.js';
import { purgeMessages } from './purge.js';
import { performUnsubscribe } from './unsubscribe.js';
import type {
  AuditReport,
  MailboxAccount,
  MessageHeader,
  SenderStats,
  UnsubscribeResult,
} from './types.js';

const DEFAULT_OUT_DIR = join(REPO_ROOT, 'data', 'mail-cleanup');
const DEFAULT_REPORT = join(REPO_ROOT, 'docs', 'outreach', 'herramientas', 'GWS_Reporte_Ranking_Correo.md');

const USAGE = `GWS · CLI de limpieza de correo (@gws/mail-cleanup)

Uso: mail-cleanup <comando> [opciones]

Comandos:
  accounts      Lista las cuentas detectadas en el entorno (.env/.env.local).
  audit         Escanea (solo lectura) y genera el ranking de remitentes.
  unsubscribe   Procesa bajas List-Unsubscribe / RFC 8058 (dry-run por defecto).
  purge         Mueve a Trash los remitentes aprobados (dry-run por defecto).

Opciones:
  --accounts k1,k2   Filtra por clave de cuenta (EDUARDOESPER75, ESPER_EDUARDO).
  --days <n>         Ventana de antigüedad en días (audit). Def: 365.
  --limit <n>        Máximo de mensajes por casilla (audit). Def: 2000.
  --mailbox <nombre> Carpeta a escanear (audit). Def: INBOX.
  --top <n>          Filas del ranking en el informe. Def: 40.
  --senders a,b      Remitentes/dominios a procesar (unsubscribe/purge).
  --kinds k1,k2      Tipos a procesar: cobros,boletines,suscripcion,trial,spam,otro.
  --from <archivo>   JSON de auditoría a usar (def: el más reciente en --out).
  --out <dir>        Directorio de datos. Def: data/mail-cleanup.
  --report <archivo> Ruta del informe Markdown. Def: el informe del repo.
  --env <archivo>    .env adicional (repetible o separado por comas).
  --apply            Ejecuta de verdad (sin él, dry-run).
  --yes              Confirma la purga (obligatorio junto a --apply).
  --json             Imprime el resultado en JSON.
  --help             Muestra esta ayuda.
`;

interface Options {
  command: string;
  accountKeys: string[];
  days: number;
  limit: number;
  mailbox: string;
  top: number;
  senders: string[];
  kinds: string[];
  from?: string;
  out: string;
  report: string;
  envFiles: string[];
  apply: boolean;
  yes: boolean;
  json: boolean;
}

const VALUE_OPTIONS = new Set([
  'accounts', 'days', 'limit', 'mailbox', 'top', 'senders', 'kinds', 'from', 'out', 'report', 'env',
]);
const BOOLEAN_OPTIONS = new Set(['apply', 'yes', 'json', 'help']);

function splitList(value: string): string[] {
  return value.split(',').map((item) => item.trim()).filter((item) => item.length > 0);
}

function parseIntOption(value: string | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseArgs(argv: readonly string[]): Options {
  const positionals: string[] = [];
  const values = new Map<string, string>();
  const flags = new Set<string>();
  const envFiles: string[] = [];

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === undefined) continue;
    if (!token.startsWith('--')) {
      positionals.push(token);
      continue;
    }
    const eq = token.indexOf('=');
    const name = (eq === -1 ? token.slice(2) : token.slice(2, eq)).toLowerCase();
    if (BOOLEAN_OPTIONS.has(name)) {
      flags.add(name);
      continue;
    }
    if (!VALUE_OPTIONS.has(name)) {
      throw new Error(`Opción desconocida: ${token}`);
    }
    const inlineValue = eq === -1 ? undefined : token.slice(eq + 1);
    const nextValue = inlineValue ?? argv[i + 1];
    if (nextValue === undefined) throw new Error(`Falta el valor de --${name}`);
    if (inlineValue === undefined) i += 1;
    if (name === 'env') envFiles.push(...splitList(nextValue));
    else values.set(name, nextValue);
  }

  return {
    command: positionals[0] ?? 'help',
    accountKeys: splitList(values.get('accounts') ?? ''),
    days: parseIntOption(values.get('days'), 365),
    limit: parseIntOption(values.get('limit'), 2000),
    mailbox: values.get('mailbox') ?? 'INBOX',
    top: parseIntOption(values.get('top'), 40),
    senders: splitList(values.get('senders') ?? ''),
    kinds: splitList(values.get('kinds') ?? '').map((kind) => kind.toLowerCase()),
    ...(values.get('from') !== undefined ? { from: values.get('from') } : {}),
    out: values.get('out') ?? DEFAULT_OUT_DIR,
    report: values.get('report') ?? DEFAULT_REPORT,
    envFiles,
    apply: flags.has('apply'),
    yes: flags.has('yes'),
    json: flags.has('json'),
  };
}

function printAccounts(env: Environment, accountKeys: readonly string[]): number {
  const { accounts, missingPassword } = discoverAccounts(env, accountKeys);
  process.stdout.write(`Archivos de entorno: ${env.files.length ? env.files.join(' | ') : '(ninguno)'}\n\n`);
  if (accounts.length === 0) {
    process.stdout.write('No hay cuentas con credenciales completas.\n');
  }
  for (const account of accounts) {
    process.stdout.write(`✔ ${account.key}  <${account.address}>  ${account.host}:${account.port}\n`);
  }
  if (missingPassword.length > 0) {
    process.stdout.write('\n⚠ Cuentas sin contraseña (define *_IMAP_PASSWORD en .env.local):\n');
    for (const key of missingPassword) process.stdout.write(`   - ${key}\n`);
  }
  return accounts.length > 0 ? 0 : 1;
}

async function runAudit(options: Options): Promise<number> {
  const env = loadEnvironment(options.envFiles);
  const { accounts, missingPassword } = discoverAccounts(env, options.accountKeys);
  if (missingPassword.length > 0) {
    process.stderr.write(
      `⚠ Sin contraseña en el entorno para: ${missingPassword.join(', ')}\n`,
    );
  }
  if (accounts.length === 0) {
    process.stderr.write(
      'No hay cuentas utilizables. Define IMAP_MCP_ACCOUNT_<CLAVE>_IMAP_USERNAME/PASSWORD en .env.local.\n',
    );
    return 1;
  }

  const metas: AccountMeta[] = [];
  const messages: MessageHeader[] = [];
  for (const account of accounts) {
    process.stdout.write(`• Auditando ${account.address} (${options.mailbox}, ${options.days}d)…\n`);
    const result = await scanMailbox(account, {
      mailbox: options.mailbox,
      lookbackDays: options.days,
      limit: options.limit,
    });
    metas.push({
      key: account.key,
      address: account.address,
      scanned: result.headers.length,
      mailboxTotal: result.mailboxTotal,
    });
    messages.push(...result.headers);
    process.stdout.write(
      `  ${result.headers.length} mensajes analizados (total en carpeta: ${result.mailboxTotal})\n`,
    );
  }

  const report = buildReport(metas, messages, options.days);
  mkdirSync(options.out, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const jsonPath = join(options.out, `audit-${stamp}.json`);
  writeFileSync(jsonPath, JSON.stringify(report, null, 2));

  mkdirSync(dirname(options.report), { recursive: true });
  writeFileSync(options.report, renderMarkdown(report, options.top));

  process.stdout.write(`\n✔ Informe: ${options.report}\n✔ Datos:   ${jsonPath}\n`);
  process.stdout.write(`  Remitentes distintos: ${report.senders.length}\n`);
  if (options.json) {
    process.stdout.write(
      `${JSON.stringify({ jsonPath, reportPath: options.report, top: report.senders.slice(0, options.top) }, null, 2)}\n`,
    );
  }
  return 0;
}

function loadAudit(options: Options): AuditReport {
  let path = options.from;
  if (path === undefined) {
    if (!existsSync(options.out)) {
      throw new Error(`No hay datos de auditoría en ${options.out}. Ejecuta primero: audit`);
    }
    const candidates = readdirSync(options.out)
      .filter((name) => name.startsWith('audit-') && name.endsWith('.json'))
      .sort();
    const latest = candidates[candidates.length - 1];
    if (latest === undefined) {
      throw new Error(`No hay archivos audit-*.json en ${options.out}. Ejecuta primero: audit`);
    }
    path = join(options.out, latest);
  }
  process.stdout.write(`• Usando auditoría: ${path}\n`);
  return JSON.parse(readFileSync(path, 'utf8')) as AuditReport;
}

function matchesSender(sender: SenderStats, options: Options): boolean {
  if (options.kinds.length > 0 && !options.kinds.includes(sender.kind)) return false;
  if (options.senders.length === 0) return true;
  const haystack = `${sender.address} ${sender.domain}`.toLowerCase();
  return options.senders.some((token) => haystack.includes(token.toLowerCase()));
}

function messagesForSender(report: AuditReport, sender: SenderStats): MessageHeader[] {
  return report.messages.filter(
    (message) =>
      (sender.address.length > 0 && message.fromAddress === sender.address) ||
      (sender.address.length === 0 && message.domain === sender.domain),
  );
}

function accountMap(accounts: readonly MailboxAccount[]): Map<string, MailboxAccount> {
  return new Map(accounts.map((account) => [account.key, account]));
}

function writeJson(path: string, value: unknown): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(value, null, 2));
}

async function runUnsubscribe(options: Options): Promise<number> {
  const report = loadAudit(options);
  const env = loadEnvironment(options.envFiles);
  const { accounts } = discoverAccounts(env, options.accountKeys);
  const byKey = accountMap(accounts);

  const selected = report.senders.filter((sender) => matchesSender(sender, options));
  const selectedMessages = selected.flatMap((sender) => messagesForSender(report, sender));
  const accountKeys = [...new Set(selectedMessages.map((message) => message.accountKey))];

  const results: UnsubscribeResult[] = [];
  const seen = new Set<string>();

  for (const accountKey of accountKeys) {
    const account = byKey.get(accountKey);
    if (!account) continue;
    const messages = selectedMessages.filter((message) => message.accountKey === accountKey);
    const domains = [...new Set(messages.map((message) => message.domain))];
    for (const domain of domains) {
      const domainMessages = messages.filter((message) => message.domain === domain);
      const address = domainMessages[0]?.fromAddress ?? '';
      const target = resolveUnsubscribeTarget(domain, address, domainMessages);
      const dedupeKey = `${target.method}|${target.endpoint ?? target.manualLink ?? domain}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);
      const result = await performUnsubscribe(target, account, { apply: options.apply });
      results.push(result);
      process.stdout.write(
        `  [${result.status}] ${domain} (${result.method}) — ${result.detail}\n`,
      );
    }
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const jsonPath = join(options.out, `unsubscribe-${stamp}.json`);
  writeJson(jsonPath, { applied: options.apply, generatedAt: new Date().toISOString(), results });

  const ok = results.filter((result) => result.status === 'ok').length;
  const skipped = results.filter((result) => result.status === 'skipped').length;
  const errors = results.filter((result) => result.status === 'error').length;
  process.stdout.write(
    `\n✔ Bajas: ${ok} ok · ${skipped} omitidas · ${errors} con error${options.apply ? '' : ' (DRY-RUN)'}\n`,
  );
  process.stdout.write(`✔ Resultado: ${jsonPath}\n`);
  return errors > 0 ? 1 : 0;
}

async function runPurge(options: Options): Promise<number> {
  if (options.apply && !options.yes) {
    process.stderr.write('La purga real exige --apply --yes (confirmación explícita).\n');
    return 1;
  }
  const report = loadAudit(options);
  const env = loadEnvironment(options.envFiles);
  const { accounts } = discoverAccounts(env, options.accountKeys);
  const byKey = accountMap(accounts);

  const selected = report.senders.filter((sender) => matchesSender(sender, options));
  if (selected.length === 0) {
    process.stderr.write('Ningún remitente coincide con la selección.\n');
    return 1;
  }
  const chosen = new Set(selected.map((sender) => sender.address || sender.domain));
  const messages = report.messages.filter(
    (message) => chosen.has(message.fromAddress) || chosen.has(message.domain),
  );

  const perAccount = new Map<string, MessageHeader[]>();
  for (const message of messages) {
    const list = perAccount.get(message.accountKey) ?? [];
    list.push(message);
    perAccount.set(message.accountKey, list);
  }

  const dryRun = !options.apply;
  const summary: Array<{ account: string; requested: number; moved: number }> = [];
  for (const [accountKey, accountMessages] of perAccount) {
    const account = byKey.get(accountKey);
    if (!account) continue;
    const result = await purgeMessages(account, accountMessages, { dryRun });
    summary.push({ account: account.address, requested: accountMessages.length, moved: result.moved });
    process.stdout.write(
      `  ${dryRun ? '[dry-run] ' : ''}${account.address}: ${result.moved} mensajes → Trash\n`,
    );
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const jsonPath = join(options.out, `purge-${stamp}.json`);
  writeJson(jsonPath, { applied: options.apply, generatedAt: new Date().toISOString(), summary });

  const total = summary.reduce((sum, item) => sum + item.moved, 0);
  process.stdout.write(
    `\n✔ Purga${dryRun ? ' (DRY-RUN, nada se movió)' : ''}: ${total} mensajes a Trash\n`,
  );
  process.stdout.write(`✔ Resumen: ${jsonPath}\n`);
  return 0;
}

async function main(argv: readonly string[]): Promise<number> {
  let options: Options;
  try {
    options = parseArgs(argv);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n\n${USAGE}`);
    return 1;
  }

  switch (options.command) {
    case 'accounts':
      return printAccounts(loadEnvironment(options.envFiles), options.accountKeys);
    case 'audit':
      return runAudit(options);
    case 'unsubscribe':
      return runUnsubscribe(options);
    case 'purge':
      return runPurge(options);
    case 'help':
    case undefined:
      process.stdout.write(USAGE);
      return 0;
    default:
      process.stderr.write(`Comando desconocido: ${options.command}\n\n${USAGE}`);
      return 1;
  }
}

process.exitCode = await main(process.argv.slice(2));
