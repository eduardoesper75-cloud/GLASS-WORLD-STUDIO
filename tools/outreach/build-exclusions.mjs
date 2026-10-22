#!/usr/bin/env node
// Genera la lista de exclusión de Fase 3 — Glass World Studio.
//
// Fuente canónica: docs/logistica/send-log.jsonl (envíos reales).
// Complemento: docs/outreach/respuestas.jsonl (bajas, bounces, rechazos).
//
// No envía nada. Por defecto hace un dry-run; con --apply escribe el CSV.
//
// Uso:
//   node tools/outreach/build-exclusions.mjs
//   node tools/outreach/build-exclusions.mjs --apply

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SEND_LOG = resolve(ROOT, 'docs/logistica/send-log.jsonl');
const RESP = resolve(ROOT, 'docs/outreach/respuestas.jsonl');
const OUT = resolve(ROOT, 'docs/outreach/scouting/exclusiones-fase3.csv');
const APPLY = process.argv.includes('--apply');

const readJsonl = (p) => {
  if (!existsSync(p)) return [];
  return readFileSync(p, 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.trim())
    .map((l) => {
      try { return JSON.parse(l); } catch { return null; }
    })
    .filter(Boolean);
};

const normEmail = (v) => String(v || '').trim().toLowerCase();
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

const map = new Map();
for (const s of readJsonl(SEND_LOG)) {
  const email = normEmail(s.to);
  if (!isEmail(email)) continue;
  map.set(email, {
    email,
    company: s.company || '[COMPLETAR]',
    categoria: s.categoria || s.perfil || s.segmento || s.segment || '[COMPLETAR]',
    ts_utc: s.ts || '',
    motivo: s.ok === false ? 'envio_fallido' : 'primer_toque',
  });
}

const EXCLUIR = new Set(['baja', 'unsubscribe', 'bounce', 'rechazo', 'no_valido']);
for (const e of readJsonl(RESP)) {
  const email = normEmail(e.to);
  if (!isEmail(email)) continue;
  const tipo = String(e.tipo || e.evento || '').toLowerCase();
  if (!EXCLUIR.has(tipo)) continue;
  const prev = map.get(email) || {
    email,
    company: e.company || '[COMPLETAR]',
    categoria: e.segment || '[COMPLETAR]',
    ts_utc: e.ts || '',
    motivo: 'primer_toque',
  };
  prev.motivo = `exclusion_${tipo}`;
  map.set(email, prev);
}

const rows = [...map.values()].sort((a, b) => a.email.localeCompare(b.email));
const header = ['email', 'company', 'categoria', 'ts_utc', 'motivo'];
const csvCell = (v) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csv = [header, ...rows.map((r) => header.map((h) => r[h]))]
  .map((r) => r.map(csvCell).join(','))
  .join('\n') + '\n';

const porMotivo = rows.reduce((acc, r) => {
  acc[r.motivo] = (acc[r.motivo] || 0) + 1;
  return acc;
}, {});

console.log('=== LISTA DE EXCLUSIÓN FASE 3 (sin envíos) ===');
console.log(`Envíos leídos       : ${readJsonl(SEND_LOG).length}`);
console.log(`Eventos leídos      : ${readJsonl(RESP).length}`);
console.log(`Emails excluidos    : ${rows.length}`);
console.log(`Por motivo          : ${Object.entries(porMotivo).map(([k, v]) => `${k}=${v}`).join(' · ') || '(ninguno)'}`);
console.log(`Salida              : ${OUT}`);

if (APPLY) {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, csv, 'utf8');
  console.log('Escrito: OK');
} else {
  console.log('Dry-run: no se escribió nada. Usá --apply para generar el CSV.');
}
