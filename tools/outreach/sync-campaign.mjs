#!/usr/bin/env node
// =====================================================================
// Sincronizador de estado de campaña — GWS
// ---------------------------------------------------------------------
// Fuente canónica: docs/logistica/send-log.jsonl
// Destinos:
//   docs/outreach/linkedin/prospects.csv       (inversores / industria)
//   docs/logistica/logistica_aliados.csv       (logística)
//
// Marca `estado = "enviado"` en las filas cuyo `empresa_o_fondo`/`empresa`
// o `email_contacto` coincidan con un envío OK del registro.
//
// Seguro por defecto: sin `--apply` hace dry-run y no escribe.
//
// Uso:
//   node tools/outreach/sync-campaign.mjs
//   node tools/outreach/sync-campaign.mjs --apply
// =====================================================================

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const LOG = resolve(ROOT, 'docs/logistica/send-log.jsonl');
const TARGETS = [
  {
    path: resolve(ROOT, 'docs/outreach/linkedin/prospects.csv'),
    companyCol: 'empresa_o_fondo',
    emailCol: 'email_contacto',
    label: 'inversores / industria',
  },
  {
    path: resolve(ROOT, 'docs/logistica/logistica_aliados.csv'),
    companyCol: 'empresa',
    emailCol: 'email_contacto',
    label: 'logística',
  },
];

const APPLY = process.argv.includes('--apply');

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

/** Parser CSV mínimo con comillas y comas embebidas. */
function parseCsvLine(line) {
  const out = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      out.push(field);
      field = '';
    } else {
      field += ch;
    }
  }
  out.push(field);
  return out;
}

/** Serializa una fila de datos con el estilo del repo: todos los campos entre comillas. */
function quoteField(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}
function serializeRow(fields) {
  return fields.map(quoteField).join(',');
}

const log = readJsonl(LOG).filter((r) => r.ok);
if (log.length === 0) {
  console.error('El registro de envíos no tiene filas OK.');
  process.exit(1);
}

const INVESTOR_PROFILES = new Set(['fondo', 'angel', 'industrial']);
const LOGISTICS_PROFILES = new Set([
  'arte_fragil',
  'empaque_crating',
  'forwarder',
  'seguro_carga',
  'naviera',
  'courier',
  'carga_pesada',
]);
function segmentOf(r) {
  if (r.categoria && LOGISTICS_PROFILES.has(r.categoria)) return 'logistica';
  if (r.perfil && INVESTOR_PROFILES.has(r.perfil)) return 'inversores';
  if (r.perfil && LOGISTICS_PROFILES.has(r.perfil)) return 'logistica';
  return 'otro';
}

let globalChanged = 0;
let globalMatched = 0;

for (const target of TARGETS) {
  if (!existsSync(target.path)) {
    console.log(`- ${target.label}: no existe ${target.path} (se omite)`);
    continue;
  }
  const raw = readFileSync(target.path, 'utf8');
  const hasBom = raw.charCodeAt(0) === 0xfeff;
  const clean = hasBom ? raw.slice(1) : raw;
  const eol = clean.includes('\r\n') ? '\r\n' : '\n';
  const lines = clean.split(/\r?\n/);
  while (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();

  const header = parseCsvLine(lines[0]);
  const companyIdx = header.indexOf(target.companyCol);
  const emailIdx = header.indexOf(target.emailCol);
  const estadoIdx = header.indexOf('estado');
  if (companyIdx < 0 || emailIdx < 0 || estadoIdx < 0) {
    console.log(`- ${target.label}: faltan columnas requeridas (${target.companyCol}, ${target.emailCol}, estado)`);
    continue;
  }

  const targetSegment = target.label.startsWith('logística') ? 'logistica' : 'inversores';
  const relevantLog = log.filter((r) => segmentOf(r) === targetSegment);
  const rows = lines.slice(1).map((line) => parseCsvLine(line));
  const matchedLog = new Set();
  let matched = 0;
  let changed = 0;

  for (const row of rows) {
    const company = (row[companyIdx] || '').trim().toLowerCase();
    const email = (row[emailIdx] || '').trim().toLowerCase();
    const hit = relevantLog.find(
      (r) =>
        !matchedLog.has(r) &&
        (String(r.company || '').trim().toLowerCase() === company ||
          String(r.to || '').trim().toLowerCase() === email),
    );
    if (!hit) continue;
    matchedLog.add(hit);
    matched += 1;
    if ((row[estadoIdx] || '').trim().toLowerCase() !== 'enviado') {
      row[estadoIdx] = 'enviado';
      changed += 1;
    }
  }

  const output = [lines[0], ...rows.map(serializeRow)].join(eol) + eol;
  const unmatched = relevantLog.filter((r) => !matchedLog.has(r));

  console.log(`- ${target.label}: filas=${rows.length} · matched=${matched} · cambiadas=${changed}${APPLY ? '' : ' (dry-run)'}`);
  if (unmatched.length > 0) {
    for (const r of unmatched) console.log(`    sin match en este CSV: ${r.company} <${r.to}>`);
  }

  if (APPLY && changed > 0) writeFileSync(target.path, `${hasBom ? '\uFEFF' : ''}${output}`, 'utf8');
  globalChanged += changed;
  globalMatched += matched;
}

console.log('');
console.log(`Total: matched=${globalMatched} · cambiadas=${globalChanged}${APPLY ? ' · ESCRITO' : ' · dry-run (usar --apply)'}`);
