#!/usr/bin/env node
// Curaduría de la base de "puertas institucionales" — Glass World Studio.
//
// Modo INVESTIGACIÓN: no envía nada. Toma la base de candidatos que cargás a mano
// y la convierte en una **base limpia y auditable**, con el motivo del descarte de
// cada fila. Principios:
//   - Sin scraping y sin bases compradas: cada fila debe citar una FUENTE pública.
//   - Sólo canal corporativo publicado; los correos de proveedor gratuito se marcan.
//   - Nada se inventa: lo que falta es `[COMPLETAR]` y la fila queda `a validar`.
//   - Deduplicación real contra el registro de envíos y las bases ya existentes.
//
// Uso:
//   node tools/outreach/scout-curate.mjs --init      # crea la base de trabajo (sólo encabezado)
//   node tools/outreach/scout-curate.mjs             # valida y emite la base limpia
//   node tools/outreach/scout-curate.mjs --report    # además escribe el informe en markdown
//   node tools/outreach/scout-curate.mjs --file=<ruta.csv>

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIR = resolve(ROOT, 'docs/outreach/scouting');
const TEMPLATE = resolve(DIR, 'puertas.template.csv');
const REPORT = resolve(DIR, 'GWS_Scouting_Informe.md');

const args = process.argv.slice(2);
const opt = (k, d = '') => {
  const a = args.find((x) => x.startsWith(`--${k}=`));
  return a ? a.slice(k.length + 3) : d;
};
const flag = (k) => args.includes(`--${k}`);

// Orden oficial de prioridad de los ejes (Manifiesto).
const EJE_ORDEN = { inversores: 1, desarrolladores: 2, logistica: 3 };
const PERFILES = {
  inversores: ['fondo', 'angel', 'industrial', 'mecenas', ''],
  desarrolladores: ['fullstack', 'b2b', 'multiagente', 'arquitecto', 'seguridad', 'datos', ''],
  logistica: ['forwarder', 'naviera', 'courier', 'arte_fragil', 'empaque_crating', 'seguro_carga', 'carga_pesada', ''],
};
const ESTADOS = ['nuevo', 'a validar', 'contactado', 'respondio', 'baja', 'archivado'];
const CANALES = ['email_corporativo', 'formulario', 'perfil_publico', 'red_calida', 'evento', 'presencial'];
const FREE_MAIL = /@(gmail|googlemail|hotmail|outlook|live|msn|yahoo|ymail|icloud|me|protonmail|proton|gmx|aol|zoho)\.[a-z.]+$/i;

const COLUMNS = [
  'eje',
  'perfil',
  'organizacion',
  'ambito',
  'rol_decisor',
  'fundamento',
  'fuente',
  'url',
  'canal',
  'email_contacto',
  'prioridad',
  'estado',
  'notas',
];

// ---------- CSV mínimo (RFC 4180 sin saltos embebidos) ----------
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let q = false;
  const t = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < t.length; i += 1) {
    const c = t[i];
    if (q) {
      if (c === '"') {
        if (t[i + 1] === '"') { cell += '"'; i += 1; } else q = false;
      } else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (c !== '\r') cell += c;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((v) => String(v).trim() !== ''));
}

const csvCell = (v) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const toCsv = (rows) => `${rows.map((r) => r.map(csvCell).join(',')).join('\n')}\n`;

// ---------- Inicialización ----------
if (flag('init')) {
  mkdirSync(DIR, { recursive: true });
  const target = resolve(DIR, 'puertas.csv');
  if (existsSync(target)) {
    console.log(`Ya existe la base de trabajo: ${target} (no se sobrescribe).`);
  } else {
    writeFileSync(target, `${COLUMNS.join(',')}\n`, 'utf8');
    console.log(`Base de trabajo creada: ${target}`);
    console.log('Cargá una fila por puerta institucional. La plantilla documentada está en:');
    console.log(`  ${TEMPLATE}`);
  }
  process.exit(0);
}

const FILE = resolve(opt('file', resolve(DIR, 'puertas.csv')));

if (!existsSync(FILE)) {
  console.log('Base de candidatos: VACÍA (todavía no existe el archivo de trabajo).');
  console.log(`  Esperado en: ${FILE}`);
  console.log('  Creala con:  node tools/outreach/scout-curate.mjs --init');
  console.log('');
  console.log('La plantilla con columnas y ejemplos documentados:');
  console.log(`  ${TEMPLATE}`);
  process.exit(0);
}

// ---------- Carga de contexto para deduplicar ----------
const readJsonl = (p) => {
  if (!existsSync(p)) return [];
  return readFileSync(p, 'utf8').split(/\r?\n/).filter((l) => l.trim())
    .map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
};
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const yaContactados = new Set(readJsonl(resolve(ROOT, 'docs/logistica/send-log.jsonl')).map((r) => String(r.to || '').toLowerCase()));
const basesExistentes = [
  'docs/logistica/logistica_aliados.csv',
  'docs/outreach/linkedin/prospects.csv',
  'docs/outreach/desarrolladores/prospects_devs.csv',
  'docs/outreach/desarrolladores/agencias_tech.csv',
  'docs/outreach/desarrolladores/github-tanda3.csv',
  'docs/outreach/desarrolladores/github-tanda4.csv',
  'docs/outreach/desarrolladores/github-tanda5.csv',
  'docs/outreach/desarrolladores/github-tanda5-curados.csv',
];
// Los encabezados no son uniformes: se detectan por nombre.
const COLS_ORG = ['organizacion', 'empresa', 'empresa_o_fondo', 'company', 'agencia', 'nombre', 'login', 'name'];
const existentes = { orgs: new Set(), emails: new Set(), urls: new Set() };
const detalleBases = [];
for (const rel of basesExistentes) {
  const p = resolve(ROOT, rel);
  if (!existsSync(p)) continue;
  const rows = parseCsv(readFileSync(p, 'utf8'));
  if (!rows.length) continue;
  const h = rows[0].map((x) => x.trim().toLowerCase());
  const iOrg = COLS_ORG.map((c) => h.indexOf(c)).find((i) => i >= 0);
  const iMail = h.findIndex((x) => /mail|correo/.test(x));
  const iUrl = h.findIndex((x) => /^(url|sitio_web|website|linkedin_url)$/.test(x));
  let nOrg = 0;
  for (const r of rows.slice(1)) {
    const org = iOrg !== undefined ? r[iOrg] : '';
    if (org && org !== '[COMPLETAR]') { existentes.orgs.add(norm(org)); nOrg += 1; }
    if (iMail >= 0 && r[iMail] && r[iMail].includes('@')) existentes.emails.add(r[iMail].trim().toLowerCase());
    if (iUrl >= 0 && r[iUrl]) existentes.urls.add(String(r[iUrl]).trim().toLowerCase().replace(/\/+$/, ''));
  }
  detalleBases.push(`${rel}: ${nOrg}`);
}

// ---------- Validación fila por fila ----------
const rows = parseCsv(readFileSync(FILE, 'utf8'));
if (!rows.length) {
  console.log('La base de trabajo está vacía (sólo encabezado o nada). Nada que curar todavía.');
  process.exit(0);
}
const header = rows[0].map((x) => x.trim());
const faltanCols = COLUMNS.filter((c) => !header.includes(c));
if (faltanCols.length) {
  console.error(`Faltan columnas obligatorias en el encabezado: ${faltanCols.join(', ')}`);
  console.error(`Encabezado esperado: ${COLUMNS.join(',')}`);
  process.exitCode = 1;
  process.exit();
}
const idx = Object.fromEntries(COLUMNS.map((c) => [c, header.indexOf(c)]));
const get = (r, c) => String(r[idx[c]] ?? '').trim();

const OK = [];
const RECHAZADAS = [];
const vistosOrg = new Map();
const vistosMail = new Map();

rows.slice(1).forEach((r, i) => {
  const linea = i + 2; // línea real en el archivo
  const motivos = [];
  const fila = Object.fromEntries(COLUMNS.map((c) => [c, get(r, c)]));
  const { eje, perfil, organizacion, fundamento, fuente, url, canal, email_contacto, prioridad, estado } = fila;

  if (!organizacion) motivos.push('sin_organizacion');
  if (/^ejemplo/i.test(organizacion)) motivos.push('fila_ejemplo_de_plantilla');
  if (!(eje in EJE_ORDEN)) motivos.push(`eje_invalido:${eje || '(vacío)'}`);
  if (eje in PERFILES && !PERFILES[eje].includes(perfil)) motivos.push(`perfil_fuera_del_eje:${perfil || '(vacío)'}`);
  if (!estado) motivos.push('sin_estado');
  else if (!ESTADOS.includes(estado)) motivos.push(`estado_invalido:${estado}`);
  if (!canal) motivos.push('sin_canal');
  else if (!CANALES.includes(canal)) motivos.push(`canal_invalido:${canal}`);
  if (!fuente) motivos.push('sin_fuente (el rigor exige fuente pública)');
  if (!url) motivos.push('sin_url');
  else if (!/^https?:\/\//i.test(url)) motivos.push('url_no_http');
  if (!fundamento) motivos.push('sin_fundamento (¿por qué es una puerta de alto valor?)');
  else if (fundamento.length < 15) motivos.push('fundamento_muy_corto');
  if (prioridad && !['1', '2', '3'].includes(prioridad)) motivos.push(`prioridad_invalida:${prioridad}`);
  if (email_contacto && email_contacto !== '[COMPLETAR]') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email_contacto)) motivos.push('email_malformado');
    else if (FREE_MAIL.test(email_contacto)) motivos.push('email_de_proveedor_gratuito (política: sólo canal corporativo)');
  }
  if (canal === 'email_corporativo' && (!email_contacto || email_contacto === '[COMPLETAR]')) {
    motivos.push('canal_email_sin_direccion');
  }

  const urlNorm = url ? url.trim().toLowerCase().replace(/\/+$/, '') : '';
  if (urlNorm && existentes.urls.has(urlNorm)) motivos.push('url_ya_en_la_base_existente');

  const no = norm(organizacion);
  const mail = email_contacto.toLowerCase();
  if (no && vistosOrg.has(no)) motivos.push(`duplicado_en_la_base (línea ${vistosOrg.get(no)})`);
  if (mail && mail.includes('@') && vistosMail.has(mail)) motivos.push(`email_duplicado (línea ${vistosMail.get(mail)})`);
  if (mail && yaContactados.has(mail)) motivos.push('ya_contactado (está en el registro de envíos)');
  if (no && existentes.orgs.has(no)) motivos.push('ya_en_la_base_existente');
  if (mail && existentes.emails.has(mail)) motivos.push('email_ya_en_la_base_existente');

  if (no) vistosOrg.set(no, linea);
  if (mail.includes('@')) vistosMail.set(mail, linea);

  if (motivos.length) RECHAZADAS.push({ linea, organizacion, eje, motivos });
  else {
    OK.push({
      ...fila,
      prioridad: prioridad || String(EJE_ORDEN[eje]),
      orden_eje: EJE_ORDEN[eje],
    });
  }
});

const CANAL_PREF = { email_corporativo: 1, red_calida: 2, formulario: 3, evento: 4, perfil_publico: 5, presencial: 6 };
OK.sort(
  (a, b) =>
    a.orden_eje - b.orden_eje ||
    Number(a.prioridad) - Number(b.prioridad) ||
    (CANAL_PREF[a.canal] || 9) - (CANAL_PREF[b.canal] || 9) ||
    a.organizacion.localeCompare(b.organizacion),
);

// ---------- Salida ----------
const porEje = {};
for (const r of OK) porEje[r.eje] = (porEje[r.eje] || 0) + 1;
const conEmail = OK.filter((r) => r.canal === 'email_corporativo').length;
const porFormulario = OK.filter((r) => r.canal === 'formulario').length;
const selectivas = OK.filter((r) => r.canal === 'email_corporativo' || r.canal === 'red_calida').length;

const outCsv = resolve(DIR, 'puertas-curadas.csv');
writeFileSync(
  outCsv,
  toCsv([[ ...COLUMNS, 'orden_eje' ], ...OK.map((r) => COLUMNS.map((c) => r[c]).concat(r.orden_eje))]),
  'utf8',
);

console.log('=== CURADURÍA DE PUERTAS INSTITUCIONALES (modo investigación, sin envíos) ===');
console.log(`Base de entrada : ${FILE}`);
console.log(`Filas leídas    : ${rows.length - 1}`);
console.log(`Puertas válidas : ${OK.length}   ·   Rechazadas: ${RECHAZADAS.length}`);
console.log(`Base limpia     : ${outCsv}`);
console.log('');
console.log('Deduplicación contra bases existentes:');
if (detalleBases.length) detalleBases.forEach((d) => console.log(`  ${d}`));
else console.log('  (no se encontraron bases existentes)');
console.log(`  Registro de envíos: ${yaContactados.size} destinatarios ya contactados`);
console.log('');
console.log('Puertas válidas por eje (orden de prioridad del Manifiesto):');
for (const eje of Object.keys(EJE_ORDEN)) {
  if (porEje[eje]) console.log(`  ${String(EJE_ORDEN[eje])}) ${eje.padEnd(16)} ${porEje[eje]}`);
}
console.log(`  Con email corporativo: ${conEmail} · Por formulario: ${porFormulario} · Contacto selectivo disponible: ${selectivas}`);
if (RECHAZADAS.length) {
  console.log('');
  console.log('Rechazadas (motivo auditable):');
  for (const r of RECHAZADAS.slice(0, 40)) {
    console.log(`  L${r.linea} ${r.organizacion || '(sin nombre)'} [${r.eje || '-'}] → ${r.motivos.join('; ')}`);
  }
  if (RECHAZADAS.length > 40) console.log(`  … y ${RECHAZADAS.length - 40} más`);
}

if (flag('report')) {
  const L = [];
  L.push('# GWS · Informe de Scouting de Puertas de Alto Valor');
  L.push('');
  L.push(`*Generado: ${new Date().toISOString()} · archivo de trabajo (ignorado por git).*`);
  L.push('');
  L.push('> Modo investigación: este informe **no** dispara envíos. Sólo describe la base de candidatos.');
  L.push('');
  L.push('## Resumen');
  L.push('');
  L.push(`- Filas leídas: **${rows.length - 1}**`);
  L.push(`- Puertas válidas: **${OK.length}** · Rechazadas: **${RECHAZADAS.length}**`);
  L.push(`- Con email corporativo: **${conEmail}** · Por formulario: **${porFormulario}**`);
  L.push('');
  L.push('## Válidas por eje');
  L.push('');
  L.push('| Orden | Eje | Puertas |');
  L.push('| --- | --- | --- |');
  for (const [eje, n] of Object.entries(porEje)) L.push(`| ${EJE_ORDEN[eje]} | ${eje} | ${n} |`);
  L.push('');
  L.push('## Puertas válidas (ordenadas para contacto selectivo)');
  L.push('');
  L.push('| Organización | Eje | Perfil | Canal | Prioridad | Fundamento | Fuente |');
  L.push('| --- | --- | --- | --- | --- | --- | --- |');
  for (const r of OK) {
    L.push(
      `| ${r.organizacion} | ${r.eje} | ${r.perfil || '-'} | ${r.canal} | ${r.prioridad} | ` +
        `${r.fundamento.replace(/\|/g, '/')} | ${r.fuente} |`,
    );
  }
  L.push('');
  L.push('## Rechazadas y motivo');
  L.push('');
  L.push('| Línea | Organización | Eje | Motivos |');
  L.push('| --- | --- | --- | --- |');
  for (const r of RECHAZADAS) L.push(`| ${r.linea} | ${r.organizacion || '(sin nombre)'} | ${r.eje || '-'} | ${r.motivos.join('; ')} |`);
  L.push('');
  writeFileSync(REPORT, L.join('\n'), 'utf8');
  console.log('');
  console.log(`Informe: ${REPORT}`);
}
