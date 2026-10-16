#!/usr/bin/env node
// Genera el log de envíos (docs/outreach/GWS_Log_Envios.md) a partir de:
//   - docs/logistica/logistica_aliados.csv            (ignorado por git)
//   - docs/outreach/desarrolladores/prospects_devs.csv (ignorado por git)
//   - docs/logistica/send-log.jsonl                    (ignorado por git; lo escribe send-lote1.mjs)
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

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 1; } else { inQuotes = false; }
      } else field += ch;
    } else if (ch === '"') inQuotes = true;
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

function readSent() {
  const map = new Map();
  if (!existsSync(SENDLOG)) return map;
  for (const line of readFileSync(SENDLOG, 'utf8').split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const r = JSON.parse(line);
      map.set(r.company, r); // el último gana
    } catch { /* noop */ }
  }
  return map;
}

const fmt = (iso) => {
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

const sent = readSent();
const logistica = objects(LOGISTICA);
const devs = objects(DEVS);

const lote1 = logistica
  .filter((r) => r.prioridad === '1' || r.prioridad === '2')
  .sort((a, b) => a.prioridad.localeCompare(b.prioridad) || a.empresa.localeCompare(b.empresa));

const devsPri = devs.filter((r) => r.perfil === 'multiagente' || r.perfil === 'b2b').sort((a, b) => a.perfil.localeCompare(b.perfil));

const sentOk = [...sent.values()].filter((r) => r.ok);
const sentErr = [...sent.values()].filter((r) => !r.ok);

const L = [];
L.push('# Log de envíos — Frente 2 (Outreach)');
L.push('');
L.push('> **Archivo generado automáticamente** por `tools/outreach/build-envios-log.mjs`. No editar a mano.');
L.push('> **Estado real, sin inventar.** Nada se marca «enviado» sin registro en `send-log.jsonl`.');
L.push('> Los correos viven en los CSV **ignorados por git**: acá solo van organización/nombre, canal y estado.');
L.push('> Contacto al pie: **Eduardo Esper · esper.eduardo@gmail.com · +54 9 385 582-6289**');
L.push('');
const nowLocal = new Date();
const lp = (n) => String(n).padStart(2, '0');
L.push(`Actualizado: ${nowLocal.getFullYear()}-${lp(nowLocal.getMonth() + 1)}-${lp(nowLocal.getDate())} ${lp(nowLocal.getHours())}:${lp(nowLocal.getMinutes())} (hora local)`);
L.push('');
L.push('---');
L.push('');
L.push('## Estado del canal de envío');
L.push('');
L.push('| Canal | Estado |');
L.push('|---|---|');
L.push('| **SMTP Gmail** (`tools/outreach/send-lote1.mjs`) | 🟢 Operativo (envío automatizado con throttling) |');
L.push('| **Runner OpenOutreach** | 🔴 Bloqueado — faltan `OPENOUTFIND_LLM_API_KEY` y `OPENOUTFIND_BETTERCONTACT_API_KEY` |');
L.push('| **MCP IMAP** | 🔵 Solo lectura (no envía) |');
L.push('');
L.push('---');
L.push('');
L.push(`## Lote 1 — Logística (P1 + P2) · ${lote1.length} destinatarios`);
L.push('');
L.push('| # | Prioridad | Organización | Cobertura | Canal | Estado |');
L.push('|---|---|---|---|---|---|');
lote1.forEach((r, i) => {
  const rec = sent.get(r.empresa);
  const hasEmail = EMAIL_RE.test(r.email_contacto || '');
  let canal = hasEmail ? 'email' : 'formulario web';
  let estado;
  if (rec && rec.ok) estado = `✅ ENVIADO (${fmt(rec.ts)})`;
  else if (rec && !rec.ok) estado = '⚠️ Error de envío (reintentar)';
  else estado = hasEmail ? 'Pendiente de envío' : 'Pendiente (formulario web)';
  L.push(`| ${i + 1} | P${r.prioridad} | ${r.empresa} | ${r.pais_cobertura || '—'} | ${canal} | ${estado} |`);
});
L.push('');
L.push(`## Lote 1 — Devs (multiagente + B2B) · ${devsPri.length} destinatarios`);
L.push('');
L.push('> Los devs **no tienen correo** en la lista: el canal es **GitHub/LinkedIn**, que está **omitido 100%**');
L.push('> (sin automatización ni scraping). Se contactan a mano.');
L.push('');
L.push('| # | Perfil | Dev | Empresa / foco | Canal | Estado |');
L.push('|---|---|---|---|---|---|');
devsPri.forEach((r, i) => {
  L.push(`| ${i + 1} | ${r.perfil} | ${r.nombre} | ${r.empresa_o_fondo || '—'} | GitHub/LinkedIn | Pendiente (manual) |`);
});
L.push('');
L.push('---');
L.push('');
L.push('## Registro de envíos (automático)');
L.push('');
if (sentOk.length === 0 && sentErr.length === 0) {
  L.push('_Sin envíos registrados todavía._');
} else {
  L.push('| Fecha | Organización | Resultado |');
  L.push('|---|---|---|');
  [...sent.values()].forEach((r) => L.push(`| ${fmt(r.ts)} | ${r.company} | ${r.ok ? '✅ enviado' : '⚠️ error'} |`));
}
L.push('');
L.push('---');
L.push('');
L.push('## Métricas (estado real)');
L.push('');
L.push('| Métrica | Valor |');
L.push('|---|---|');
L.push(`| **Enviados (logística)** | **${sentOk.length}** |`);
L.push(`| Fallidos (reintentar) | **${sentErr.length}** |`);
L.push('| Devs en pool | **' + devs.length + '** (todos `nuevo`) |');
L.push(`| — priorizados multiagente | **${devs.filter((r) => r.perfil === 'multiagente').length}** |`);
L.push(`| — priorizados B2B | **${devs.filter((r) => r.perfil === 'b2b').length}** |`);
L.push(`| Logística en pool | **${logistica.length}** |`);
L.push(`| — prioridad 1 | **${logistica.filter((r) => r.prioridad === '1').length}** |`);
L.push(`| — prioridad 2 | **${logistica.filter((r) => r.prioridad === '2').length}** |`);
L.push('| Candidatos Tanda 5 | **45** (pendientes de curación) |');
L.push('');

writeFileSync(OUT, `${L.join('\n')}\n`, 'utf8');
console.log(`Log escrito: ${OUT}`);
console.log(`Enviados OK: ${sentOk.length} · fallidos: ${sentErr.length} · logística P1+P2: ${lote1.length} · devs priorizados: ${devsPri.length}`);
