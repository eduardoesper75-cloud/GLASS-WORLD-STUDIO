#!/usr/bin/env node
// Estado de seguimiento de la Campaña de Alianzas Estratégicas — Glass World Studio.
//
// Lee el registro real de envíos (docs/logistica/send-log.jsonl) y el registro
// canónico de respuestas (docs/outreach/respuestas.jsonl) y produce:
//   1) resumen por segmento (flecha / perfil / categoría),
//   2) estado por contacto (respuesta / bounce / pausa / sin novedad),
//   3) elegibilidad para el 2º toque (ritmo humano, máximo 3 toques),
//   4) un archivo de trabajo IGNORADO por git con el detalle.
//
// No inventa datos: sólo agrega lo que ya está registrado. Si no hay respuestas
// registradas, el informe lo dice explícitamente.
//
// Uso:
//   node tools/outreach/followup-status.mjs
//   node tools/outreach/followup-status.mjs --min-days=5
//   node tools/outreach/followup-status.mjs --respondio=info@empresa.com --nota="pidió el pitch deck"
//   node tools/outreach/followup-status.mjs --baja=info@empresa.com
//   node tools/outreach/followup-status.mjs --rebotado=info@empresa.com

import { readFileSync, appendFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const LOG = resolve(ROOT, 'docs/logistica/send-log.jsonl');
// Registro canónico (Fase 1): docs/outreach/respuestas.jsonl.
// Se conserva el path legacy sólo como lectura de compatibilidad.
const RESP = resolve(ROOT, 'docs/outreach/respuestas.jsonl');
const RESP_LEGACY = resolve(ROOT, 'docs/logistica/respuestas.jsonl');
const OUT = resolve(ROOT, 'docs/logistica/seguimiento.md');
const MAX_TOUCHES = 3; // regla del Manifiesto: máximo 3 toques, ritmo humano.

const args = process.argv.slice(2);
const opt = (k, d = '') => {
  const a = args.find((x) => x.startsWith(`--${k}=`));
  return a ? a.slice(k.length + 3) : d;
};
const MIN_DAYS = Number(opt('min-days', '5'));
const READ_MONTHS = 0; // reservado

const readJsonl = (path) => {
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
};

// Registro manual de una respuesta (append-only). Requiere un contacto explícito.
const estado = opt('respondio') ? 'RESPONDIO' : opt('baja') ? 'BAJA' : opt('rebotado') ? 'REBOTADO' : '';
const contacto = opt('respondio') || opt('baja') || opt('rebotado');
if (estado) {
  if (!contacto.includes('@')) {
    console.error('Indicá un correo válido, por ejemplo --respondio=contacto@empresa.com');
    process.exit(1);
  }
  const tipo = estado === 'REBOTADO' ? 'bounce' : estado === 'BAJA' ? 'unsubscribe' : 'respuesta';
  const clasificacion =
    tipo === 'respuesta' ? 'requiere_seguimiento' : tipo === 'bounce' ? 'no_valido' : 'no_interesado';
  const rec = {
    ts: new Date().toISOString(),
    campaign: 'alianzas-2026-10',
    to: contacto.toLowerCase(),
    tipo,
    clasificacion,
    estado,
    nota: opt('nota'),
  };
  mkdirSync(dirname(RESP), { recursive: true });
  appendFileSync(RESP, `${JSON.stringify(rec)}\n`, 'utf8');
  console.log(`Registrado: ${estado} · ${rec.to}${rec.nota ? ` · ${rec.nota}` : ''} -> ${RESP}`);
}

// ---------- Agregación real ----------
const log = readJsonl(LOG);
const resp = [...readJsonl(RESP), ...readJsonl(RESP_LEGACY)];
const respByTo = new Map();
for (const r of resp) {
  const to = String(r.to || '').toLowerCase();
  if (!to) continue;
  const prev = respByTo.get(to);
  // prioridad: BAJA > RESPONDIO > REBOTADO > PAUSA > SIN_NOVEDAD
  const rank = { BAJA: 5, RESPONDIO: 4, REBOTADO: 3, PAUSA: 2, SIN_NOVEDAD: 1 };
  if (!prev || (rank[r.estado] || 0) >= (rank[prev.estado] || 0)) respByTo.set(to, r);
}

const byTo = new Map();
for (const r of log) {
  const to = String(r.to || '').toLowerCase();
  if (!to) continue;
  const cur = byTo.get(to) || {
    to,
    company: r.company || '',
    segmento: r.perfil || r.categoria || r.tag || '(sin segmento)',
    ok: 0,
    fail: 0,
    first: r.ts,
    last: r.ts,
    lastErr: '',
  };
  if (r.ok) cur.ok += 1;
  else {
    cur.fail += 1;
    cur.lastErr = String(r.err || '').slice(0, 120);
  }
  if (r.ts < cur.first) cur.first = r.ts;
  if (r.ts > cur.last) cur.last = r.ts;
  if (!cur.company && r.company) cur.company = r.company;
  byTo.set(to, cur);
}

const now = Date.now();
const days = (iso) => Math.floor((now - new Date(iso).getTime()) / 86_400_000);
const rows = [...byTo.values()].map((c) => {
  const entry = respByTo.get(c.to);
  const estadoResp = entry?.estado || '';
  const tipoResp = entry?.tipo || '';
  const clasResp = entry?.clasificacion || '';
  const etapas = c.ok;
  let estadoFinal = 'ENVIADO (1er toque)';
  if (estadoResp === 'BAJA') estadoFinal = 'BAJA (no contactar)';
  else if (estadoResp === 'RESPONDIO') estadoFinal = 'RESPONDIÓ (seguir hilo)';
  else if (estadoResp === 'REBOTADO') estadoFinal = 'REBOTADO (corregir dirección)';
  else if (estadoResp === 'PAUSA') estadoFinal = 'PAUSA (autorespuesta / fuera de oficina)';
  else if (estadoResp === 'SIN_NOVEDAD') estadoFinal = 'ENVIADO (sin novedad)';
  else if (c.ok === 0) estadoFinal = 'SIN ENVIAR (sólo fallos)';
  else if (etapas >= 2) estadoFinal = `ENVIADO (toque ${etapas})`;
  const elegible =
    (!estadoResp || estadoResp === 'SIN_NOVEDAD') &&
    c.ok > 0 &&
    etapas < MAX_TOUCHES &&
    days(c.last) >= MIN_DAYS;
  return { ...c, estadoResp, tipoResp, clasResp, estadoFinal, elegible, dias: days(c.last) };
});
rows.sort((a, b) => b.ok - a.ok || a.company.localeCompare(b.company));

const reales = rows.filter(
  (r) => r.estadoResp === 'RESPONDIO' || r.estadoResp === 'BAJA' || r.estadoResp === 'REBOTADO',
);
const pausas = rows.filter((r) => r.estadoResp === 'PAUSA');
const sinNovedad = rows.filter((r) => !r.estadoResp || r.estadoResp === 'SIN_NOVEDAD');
const elegibles = rows.filter((r) => r.elegible);
const porSegmento = {};
for (const r of rows) {
  porSegmento[r.segmento] = porSegmento[r.segmento] || { contactos: 0, ok: 0, fail: 0, resp: 0, pausa: 0 };
  porSegmento[r.segmento].contactos += 1;
  porSegmento[r.segmento].ok += r.ok;
  porSegmento[r.segmento].fail += r.fail;
  if (r.estadoResp === 'RESPONDIO' || r.estadoResp === 'BAJA' || r.estadoResp === 'REBOTADO') {
    porSegmento[r.segmento].resp += 1;
  }
  if (r.estadoResp === 'PAUSA') porSegmento[r.segmento].pausa += 1;
}

// ---------- Informe ----------
const L = [];
L.push('# GWS · Seguimiento de la Campaña de Alianzas');
L.push('');
L.push(`*Generado: ${new Date().toISOString()} · archivo de trabajo (ignorado por git).*`);
L.push('');
L.push('## Resumen');
L.push('');
L.push(`- Contactos registrados: **${rows.length}**`);
L.push(`- Envíos OK: **${rows.reduce((s, r) => s + r.ok, 0)}** · Fallos: **${rows.reduce((s, r) => s + r.fail, 0)}**`);
L.push(`- Respuestas reales registradas: **${reales.length}**${reales.length ? '' : ' (ninguna: no hay respuesta/bounce/baja registrados)'}`);
L.push(`- Autorespuestas / fuera de oficina (pausa): **${pausas.length}**`);
L.push(`- Contactos sin novedad: **${sinNovedad.length}**`);
L.push(`- Elegibles para 2º toque (≥ ${MIN_DAYS} días sin respuesta y < ${MAX_TOUCHES} toques): **${elegibles.length}**`);
L.push('');
L.push('## Por segmento');
L.push('');
L.push('| Segmento | Contactos | Envíos OK | Fallos | Respuestas | Pausas |');
L.push('| --- | --- | --- | --- | --- | --- |');
for (const [s, v] of Object.entries(porSegmento).sort((a, b) => b[1].contactos - a[1].contactos)) {
  L.push(`| ${s} | ${v.contactos} | ${v.ok} | ${v.fail} | ${v.resp} | ${v.pausa} |`);
}
L.push('');
L.push('## Detalle por contacto');
L.push('');
L.push('| Organización | Segmento | Toques OK | Último envío | Días | Tipo | Clasificación | Estado |');
L.push('| --- | --- | --- | --- | --- | --- | --- | --- |');
for (const r of rows) {
  L.push(
    `| ${r.company || '(s/d)'} | ${r.segmento} | ${r.ok} | ${String(r.last).slice(0, 10)} | ${r.dias} | ${r.tipoResp || '—'} | ${r.clasResp || '—'} | ${r.estadoFinal} |`,
  );
}
L.push('');
L.push('## Próximos pasos (regla del Manifiesto)');
L.push('');
L.push(`- 2º toque sólo con ≥ ${MIN_DAYS} días desde el último envío y sin respuesta registrada; máximo ${MAX_TOUCHES} toques por contacto.`);
L.push('- Antes de tocar: revisar la bandeja (solo lectura) y registrar el evento real.');
L.push('- Registrar la respuesta en cuanto llegue: `node tools/outreach/followup-status.mjs --respondio=<correo> --nota="..."`.');
L.push('- Registrar bajas y rebotes para no volver a contactar.');
L.push('');
L.push('> Este informe agrega datos reales del registro de envíos y del registro de respuestas. No contiene métricas estimadas.');
L.push('');
writeFileSync(OUT, L.join('\n'), 'utf8');

console.log('');
console.log(`Contactos: ${rows.length} · envíos OK: ${rows.reduce((s, r) => s + r.ok, 0)} · fallos: ${rows.reduce((s, r) => s + r.fail, 0)}`);
console.log(
  `Respuestas reales: ${reales.length} · pausas: ${pausas.length} · sin novedad: ${sinNovedad.length} · elegibles (≥${MIN_DAYS} días): ${elegibles.length}`,
);
for (const [s, v] of Object.entries(porSegmento).sort((a, b) => b[1].contactos - a[1].contactos)) {
  console.log(`  ${s.padEnd(16)} contactos=${v.contactos} ok=${v.ok} fail=${v.fail} resp=${v.resp} pausa=${v.pausa}`);
}
console.log('');
console.log(`Informe: ${OUT}`);
void READ_MONTHS;
