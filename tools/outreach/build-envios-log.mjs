#!/usr/bin/env node
// Genera el log de envíos (docs/outreach/GWS_Log_Envios.md) a partir de:
//   - docs/logistica/logistica_aliados.csv             (ignorado por git)
//   - docs/outreach/desarrolladores/prospects_devs.csv  (ignorado por git)
//   - docs/logistica/send-log.jsonl                     (ignorado por git; lo escribe send-batch.mjs)
//   - los correos canónicos (logística P3, P4-6, institucionales)
//
// El archivo generado NO contiene direcciones de correo (solo organización/nombre, canal y estado).
// Uso: node tools/outreach/build-envios-log.mjs

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const LOGISTICA = resolve(ROOT, 'docs/logistica/logistica_aliados.csv');
const DEVS = resolve(ROOT, 'docs/outreach/desarrolladores/prospects_devs.csv');
const SENDLOG = resolve(ROOT, 'docs/logistica/send-log.jsonl');
const OUT = resolve(ROOT, 'docs/outreach/GWS_Log_Envios.md');

const CORREOS_L2 = [
  { file: resolve(ROOT, 'docs/logistica/GWS_Correos_Forwarders.md'), grupo: 'Logística P3 (forwarders)', src: 'docs/logistica/GWS_Correos_Forwarders.md' },
  { file: resolve(ROOT, 'docs/logistica/GWS_Correos_Logistica_Cierre.md'), grupo: 'Logística P4–P6 (cierre)', src: 'docs/logistica/GWS_Correos_Logistica_Cierre.md' },
  { file: resolve(ROOT, 'docs/outreach/inversores/GWS_Correos_Institucionales.md'), grupo: 'Institucionales / inversores', src: 'docs/outreach/inversores/GWS_Correos_Institucionales.md' },
];

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

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

function objects(path) {
  if (!existsSync(path)) return [];
  const rows = parseCsv(readFileSync(path, 'utf8'));
  const head = rows[0].map((h) => h.trim().toLowerCase());
  return rows.slice(1).map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] ?? '').trim()])));
}

function correosConEmail(path) {
  if (!existsSync(path)) return [];
  const out = [];
  for (const b of readFileSync(path, 'utf8').split(/\n## /).slice(1)) {
    const company = (b.match(/^([^\n·]+)/) || [])[1];
    const to = (b.match(/\*\*Para:\*\*\s*([^\s\n]+)/) || [])[1];
    if (company && to && to.includes('@')) out.push({ company: company.trim(), to: to.trim() });
  }
  return out;
}

function readLog() {
  const map = new Map();
  if (!existsSync(SENDLOG)) return map;
  for (const line of readFileSync(SENDLOG, 'utf8').split(/\r?\n/)) {
    if (!line.trim()) continue;
    try { const r = JSON.parse(line); map.set((r.to || r.company).toLowerCase(), r); } catch { /* noop */ }
  }
  return map;
}

const fmt = (iso) => {
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

const log = readLog();
const logistica = objects(LOGISTICA);
const devs = objects(DEVS);

const estadoDe = (row) => {
  const key = (row.to || row.email_contacto || '').toLowerCase();
  const rec = log.get(key);
  if (rec && rec.ok) return `✅ ENVIADO (${fmt(rec.ts)})`;
  if (rec && !rec.ok) return '⚠️ Error de envío (reintentar)';
  return 'Pendiente de envío';
};

const lote1 = logistica.filter((r) => r.prioridad === '1' || r.prioridad === '2');
const lote2 = logistica.filter((r) => ['3', '4', '5', '6'].includes(r.prioridad));
const devsPri = devs.filter((r) => r.perfil === 'multiagente' || r.perfil === 'b2b').sort((a, b) => a.perfil.localeCompare(b.perfil));
const sentOk = [...log.values()].filter((r) => r.ok);
const sentErr = [...log.values()].filter((r) => !r.ok);

const nw = new Date();
const p2 = (n) => String(n).padStart(2, '0');

const L = [];
L.push('# Log de envíos — Frente 2 (Outreach)');
L.push('');
L.push('> **Glass World Studio (GWS) busca Alianzas Estratégicas: Inversores, Desarrolladores y Logística.**');
L.push('> Orden de prioridad: 1) **Inversores y capital** · 2) **Desarrolladores** · 3) **Logística** (pilar operativo).');
L.push('> **Archivo generado automáticamente** por `tools/outreach/build-envios-log.mjs`. No editar a mano.');
L.push('> **Estado real, sin inventar.** Nada se marca «enviado» sin registro en `send-log.jsonl`.');
L.push('> Los correos viven en los CSV **ignorados por git**: acá solo van organización/nombre, canal y estado.');
L.push('> Contacto al pie: **Eduardo Esper · esper.eduardo@gmail.com · +54 9 385 582-6289**');
L.push('');
L.push(`Actualizado: ${nw.getFullYear()}-${p2(nw.getMonth() + 1)}-${p2(nw.getDate())} ${p2(nw.getHours())}:${p2(nw.getMinutes())} (hora local)`);
L.push('');
L.push('---');
L.push('');
L.push('## Estado del canal de envío');
L.push('');
L.push('| Canal | Estado |');
L.push('|---|---|');
L.push('| **SMTP Gmail** (`tools/outreach/send-batch.mjs`) | 🟢 Operativo (envío automatizado con throttling) |');
L.push('| **Runner OpenOutreach** | 🔴 Bloqueado — faltan `OPENOUTFIND_LLM_API_KEY` y `OPENOUTFIND_BETTERCONTACT_API_KEY` |');
L.push('| **MCP IMAP** | 🔵 Solo lectura (no envía) |');
L.push('| **Devs (GitHub/LinkedIn)** | ⚪ Manual (LinkedIn omitido 100%) |');
L.push('');
L.push('---');
L.push('');
L.push(`## ✅ Lote 1 — Logística (P1 + P2) · ${lote1.length} destinatarios`);
L.push('');
L.push('| # | Prioridad | Organización | Cobertura | Canal | Estado |');
L.push('|---|---|---|---|---|---|');
lote1.forEach((r, i) => {
  const hasEmail = EMAIL_RE.test(r.email_contacto || '');
  L.push(`| ${i + 1} | P${r.prioridad} | ${r.empresa} | ${r.pais_cobertura || '—'} | ${hasEmail ? 'email' : 'formulario web'} | ${hasEmail ? estadoDe(r) : 'Formulario web (manual)'} |`);
});
L.push('');
L.push('---');
L.push('');
L.push(`## ⏸️ Lote 2 — Preparado (SIN ENVIAR) · logística P3–P6 + institucionales`);
L.push('');
L.push('> Base lista. Se dispara **sólo** con orden expresa, tras medir la respuesta del Lote 1.');
L.push('> Comando por subgrupo (throttling 60 s por defecto):');
L.push('');
L.push('```powershell');
CORREOS_L2.forEach((c) => L.push(`node tools/outreach/send-batch.mjs --execute --tag=lote2 --source=${c.src}`));
L.push('```');
L.push('');

const fuenteLote2 = CORREOS_L2.map((c) => ({ ...c, items: correosConEmail(c.file) }));
let totL2 = 0;
for (const c of fuenteLote2) {
  totL2 += c.items.length;
  L.push(`### ${c.grupo} · ${c.items.length} destinatarios`);
  L.push('');
  L.push('| # | Organización | Canal | Estado |');
  L.push('|---|---|---|---|');
  c.items.forEach((it, i) => L.push(`| ${i + 1} | ${it.company} | email | ${estadoDe(it)} |`));
  L.push('');
}
L.push(`> **Lote 2 total: ${totL2} con correo.** Además, hay organizaciones **sin correo** (sólo formulario web):`);
L.push(`> ${lote1.concat(lote2).filter((r) => !EMAIL_RE.test(r.email_contacto || '')).map((r) => r.empresa).join(' · ')}`);
L.push('');
L.push('---');
L.push('');
L.push(`## Lote 1 — Devs (multiagente + B2B) · ${devsPri.length} destinatarios`);
L.push('');
L.push('> Los devs **no tienen correo** en la lista: canal **GitHub/LinkedIn**, **manual** (LinkedIn omitido 100%).');
L.push('');
L.push('| # | Perfil | Dev | Empresa / foco | Estado |');
L.push('|---|---|---|---|---|');
devsPri.forEach((r, i) => L.push(`| ${i + 1} | ${r.perfil} | ${r.nombre} | ${r.empresa_o_fondo || '—'} | Pendiente (manual) |`));
L.push('');
L.push('---');
L.push('');
L.push('## Tanda 5 — Devs (revisión lista)');
L.push('');
L.push('- **45 pre-curados** (35 multiagente · 8 datos/BI · 2 i18n) → revisión en `docs/outreach/desarrolladores/GWS_Tanda5_Revision.md`.');
L.push('- Datos crudos en `github-tanda5-curados.csv` (ignorado por git). Contacto **manual**.');
L.push('');
L.push('---');
L.push('');
L.push('## Registro de envíos (automático)');
L.push('');
if (!sentOk.length && !sentErr.length) {
  L.push('_Sin envíos registrados todavía._');
} else {
  L.push('| Fecha | Lote | Organización | Resultado |');
  L.push('|---|---|---|---|');
  [...log.values()].forEach((r) => L.push(`| ${fmt(r.ts)} | ${r.tag || 'lote1'} | ${r.company} | ${r.ok ? '✅ enviado' : '⚠️ error'} |`));
}
L.push('');
L.push('---');
L.push('');
L.push('## Métricas (estado real)');
L.push('');
L.push('| Métrica | Valor |');
L.push('|---|---|');
L.push(`| **Enviados** | **${sentOk.length}** (logística Lote 1) |`);
L.push(`| Fallidos (reintentar) | **${sentErr.length}** |`);
L.push(`| Lote 2 preparado (con correo) | **${totL2}** |`);
L.push(`| Devs en pool | **${devs.length}** |`);
L.push(`| — priorizados multiagente | **${devs.filter((r) => r.perfil === 'multiagente').length}** |`);
L.push(`| — priorizados B2B | **${devs.filter((r) => r.perfil === 'b2b').length}** |`);
L.push(`| Logística en pool | **${logistica.length}** |`);
L.push(`| — prioridad 1 | **${logistica.filter((r) => r.prioridad === '1').length}** |`);
L.push(`| — prioridad 2 | **${logistica.filter((r) => r.prioridad === '2').length}** |`);
L.push(`| — prioridad 3–6 (Lote 2) | **${lote2.length}** |`);
L.push('| Tanda 5 (pre-curados) | **45** |');
L.push('');

writeFileSync(OUT, `${L.join('\n')}\n`, 'utf8');
console.log(`Log escrito: ${OUT}`);
console.log(`Enviados OK: ${sentOk.length} · Lote 2 con correo: ${totL2} · devs priorizados: ${devsPri.length}`);
