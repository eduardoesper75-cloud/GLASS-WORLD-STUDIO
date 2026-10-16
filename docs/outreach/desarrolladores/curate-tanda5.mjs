#!/usr/bin/env node
// Pre-curación de la Tanda 5 de devs — Glass World Studio.
//
// Toma la cosecha cruda (github-tanda5.csv) y produce una lista PRE-CURADA
// (github-tanda5-curados.csv) con el esquema de prospects_devs.csv, aplicando sólo
// filtros objetivos (bio presente, dedupe, eje por consulta). La selección FINAL
// sigue siendo humana (el harvest no decide encaje cultural ni disponibilidad).
//
// Uso: node docs/outreach/desarrolladores/curate-tanda5.mjs

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const IN = resolve(here, 'github-tanda5.csv');
const EXISTING = resolve(here, 'prospects_devs.csv');
const OUT = resolve(here, 'github-tanda5-curados.csv');

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let q = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (q) {
      if (ch === '"') { if (text[i + 1] === '"') { field += '"'; i += 1; } else q = false; }
      else field += ch;
    } else if (ch === '"') q = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (ch !== '\r') field += ch;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

function objs(path) {
  if (!existsSync(path)) return [];
  const rows = parseCsv(readFileSync(path, 'utf8'));
  const head = rows[0].map((h) => h.trim().toLowerCase());
  return rows.slice(1).map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] ?? '').trim()])));
}

function eje(query) {
  const q = (query || '').toLowerCase();
  if (q.includes('model context protocol') || q.includes('mcp') || q.includes('ai agents')) return 'multiagente';
  if (q.includes('data engineering') || q.includes('business intelligence') || q.includes('dbt')) return 'datos';
  return 'i18n';
}

const existing = new Set();
if (existsSync(EXISTING)) {
  for (const m of readFileSync(EXISTING, 'utf8').matchAll(/github\.com\/([A-Za-z0-9-]+)/g)) existing.add(m[1]);
}

const cands = objs(IN);
const seen = new Set();
const out = [];
const stats = { total: cands.length, sinBio: 0, duplicado: 0, ok: 0 };

for (const c of cands) {
  const login = c.login;
  if (!login) continue;
  if (seen.has(login) || existing.has(login)) { stats.duplicado += 1; continue; }
  if (!c.nombre_bio || !c.nombre_bio.trim()) { stats.sinBio += 1; continue; }
  seen.add(login);
  stats.ok += 1;
  out.push({
    flecha: 'desarrolladores',
    nombre: login,
    empresa_o_fondo: c.empresa || '',
    cargo: '',
    url: c.url || `https://github.com/${login}`,
    perfil: eje(c.query),
    hook: c.nombre_bio.replace(/\s+/g, ' ').trim(),
    fuente: c.url || `https://github.com/${login}`,
    estado: 'nuevo',
  });
}

const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
const cols = ['flecha', 'nombre', 'empresa_o_fondo', 'cargo', 'url', 'perfil', 'hook', 'fuente', 'estado'];
const lines = [cols.join(',')];
for (const r of out) lines.push(cols.map((c) => esc(r[c])).join(','));
writeFileSync(OUT, `${lines.join('\n')}\n`, 'utf8');

console.log(`Entrada: ${stats.total} · curados: ${stats.ok} · sin bio: ${stats.sinBio} · duplicados: ${stats.duplicado}`);
console.log(`Escrito: ${OUT}`);
const porEje = out.reduce((a, r) => ((a[r.perfil] = (a[r.perfil] || 0) + 1), a), {});
console.log(`Por eje: ${JSON.stringify(porEje)}`);
console.log('Revisión humana pendiente antes de sumar a prospects_devs.csv.');
