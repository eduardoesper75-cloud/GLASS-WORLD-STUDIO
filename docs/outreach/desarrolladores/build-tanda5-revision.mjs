#!/usr/bin/env node
// Revisión de la Tanda 5 (devs pre-curados) — Glass World Studio.
// Genera un documento versionado (sólo datos PÚBLICOS de GitHub) para la revisión humana
// y la definición de la estrategia de contacto manual.
//
// Uso: node docs/outreach/desarrolladores/build-tanda5-revision.mjs

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const IN = resolve(here, 'github-tanda5-curados.csv');
const OUT = resolve(here, 'GWS_Tanda5_Revision.md');

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

const rows = parseCsv(readFileSync(IN, 'utf8'));
const head = rows[0].map((h) => h.trim().toLowerCase());
const items = rows.slice(1).map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] ?? '').trim()])));

const ejes = { multiagente: [], datos: [], i18n: [] };
for (const it of items) (ejes[it.perfil] || (ejes[it.perfil] = [])).push(it);

const LABEL = {
  multiagente: 'MCP / agentes / orquestación',
  datos: 'Datos / BI',
  i18n: 'i18n / multi-región',
};

const hoy = new Date().toISOString().slice(0, 10);
const L = [];
L.push('# Tanda 5 — Revisión de devs pre-curados (GitHub)');
L.push('');
L.push(`> Generado por \`build-tanda5-revision.mjs\` el ${hoy}. Sólo datos **públicos** de GitHub.`);
L.push('> **Estrategia de contacto: LinkedIn / redes, MANUAL** (omitido 100%: sin automatización ni scraping).');
L.push('> Revisión humana pendiente: decidir a quién se contacta y con qué hook.');
L.push('> Contacto al pie: **Eduardo Esper · esper.eduardo@gmail.com · +54 9 385 582-6289**');
L.push('');
L.push(`**Total pre-curados:** ${items.length} · ` +
  Object.entries(ejes).map(([k, v]) => `${LABEL[k] || k}: ${v.length}`).join(' · '));
L.push('');
L.push('---');
L.push('');

for (const [eje, lista] of Object.entries(ejes)) {
  if (!lista.length) continue;
  L.push(`## ${LABEL[eje] || eje} · ${lista.length}`);
  L.push('');
  L.push('| # | Dev | Empresa | Foco / bio (público) | GitHub | Estado |');
  L.push('|---|---|---|---|---|---|');
  lista.forEach((it, i) => {
    const bio = (it.hook || '').replace(/\|/g, '/').slice(0, 140);
    const empresa = it.empresa_o_fondo || '—';
    L.push(`| ${i + 1} | ${it.nombre} | ${empresa} | ${bio} | [perfil](${it.url}) | Pendiente (manual) |`);
  });
  L.push('');
}

L.push('---');
L.push('');
L.push('## Estrategia de contacto (manual)');
L.push('');
L.push('1. **Canal:** LinkedIn / GitHub / redes. Nada automatizado.');
L.push('2. **Hook:** citar el trabajo REAL del dev (MCP, agentes, datos) — sin eso, no se envía.');
L.push('3. **Ritmo:** humano, máximo **3 toques**.');
L.push('4. **Objetivo:** sumar al núcleo técnico (ver `GWS_Perfil_Tecnico_Buscado.md`).');
L.push('5. **Base de datos:** los pre-curados viven en `github-tanda5-curados.csv` (ignorado por git).');
L.push('');
L.push('> Cuando se decida sumar un perfil al pool, agregarlo a `prospects_devs.csv` y regenerar');
L.push('> el pool con `node docs/outreach/desarrolladores/generate-envios.mjs` si corresponde.');
L.push('');

writeFileSync(OUT, `${L.join('\n')}\n`, 'utf8');
console.log(`Escrito: ${OUT} (${items.length} perfiles)`);
