// Generador de envíos (correo / mensaje) para la Flecha Devs — Glass World Studio.
// Convierte prospects_devs.csv en un archivo listo para envío manual, con el marco
// del Manifiesto de Convocatoria y la firma obligatoria al pie.
//
// Uso:
//   node docs/outreach/desarrolladores/generate-envios.mjs
//   node docs/outreach/desarrolladores/generate-envios.mjs ruta/a/prospects_devs.csv ruta/a/salida.md
//
// Entrada (CSV): flecha,nombre,empresa_o_fondo,cargo,url,perfil,hook,fuente,estado
//   Acepta alias en español (nombre, empresa, cargo, url, gancho, status, correo, sitio_web).

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Firma obligatoria: todo correo la lleva al pie.
const SIGNATURE = [
  'Eduardo Esper',
  'Fundador — Glass World Studio',
  'eduesper@gmail.com · +54 9 385 582-6289',
];

// Marco del Manifiesto de Convocatoria (párrafo central, común a todo envío).
const MANIFESTO =
  'Glass World Studio nace en un banco de trabajo en Santiago del Estero, Argentina. Tras 20 años ' +
  'en el oficio —artista, docente y discípulo del maestro Miguel Diez— detecté una vacante histórica: ' +
  'el arte, la industria y la tecnología del vidrio (USD 450.000 millones al año) siguen sin una ' +
  'plataforma que los una. Eso estamos construyendo: 6 galaxias y 5 satélites sobre una arquitectura ' +
  'de agentes. No pedimos dinero: invitamos a co-construir.';

// Párrafo específico según el sub-perfil técnico.
const PERFIL = {
  fullstack:
    'Para el núcleo buscamos un full-stack que lleve el producto de punta a punta: catálogo, ' +
    'licitaciones, perfiles y credenciales.',
  b2b:
    'Para el núcleo buscamos gente que haya construido marketplaces B2B transaccionales: matching, ' +
    'licitaciones, pagos y trazabilidad.',
  arquitecto:
    'Para el núcleo buscamos arquitectos que diseñen las APIs, los microservicios y la orquestación ' +
    'de agentes.',
  multiagente:
    'Para el núcleo buscamos especialistas en arquitectura multi-agente y MCP para motorizar los ' +
    'satélites de ingeniería predictiva.',
  _:
    'Para el núcleo buscamos gente con oficio para construir una plataforma B2B real de alcance global.',
};

const ASUNTO = 'Glass World Studio — convocatoria al núcleo técnico (Tech Partner)';

const ALIASES = {
  flecha: ['flecha', 'arrow'],
  perfil: ['perfil', 'profile'],
  name: ['name', 'nombre'],
  company: ['company', 'empresa', 'empresa_o_fondo', 'organizacion', 'organización'],
  role: ['role', 'cargo', 'puesto'],
  url: ['url', 'linkedin_url', 'github', 'perfil_url'],
  email: ['email', 'email_contacto', 'correo', 'mail'],
  hook: ['hook', 'gancho'],
  estado: ['estado', 'status'],
};

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
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
      row.push(field);
      field = '';
    } else if (ch === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (ch !== '\r') {
      field += ch;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}

function firstName(fullName) {
  return (fullName || '').trim().split(/\s+/)[0] || fullName || '';
}

const here = dirname(fileURLToPath(import.meta.url));
const inputPath = resolve(process.argv[2] ?? resolve(here, 'prospects_devs.csv'));
const outputPath = resolve(process.argv[3] ?? resolve(here, 'GWS_Envio_Devs.md'));

function cuerpo(p) {
  const personalization = p.company
    ? `Vi tu trabajo en ${p.company}${p.hook ? ` — ${p.hook}` : ''} y me interesa tu perfil.`
    : `Vi tu perfil en GitHub${p.hook ? ` — ${p.hook}` : ''} y me interesa tu experiencia.`;
  const perfilPara = PERFIL[p.perfil] || PERFIL._;
  return [
    `Hola ${firstName(p.name)},`,
    '',
    personalization,
    '',
    MANIFESTO,
    '',
    perfilPara,
    '',
    'Si te interesa sumarte como Tech Partner del núcleo, respondé este mensaje y coordinamos ' +
      '20 minutos. Sin compromiso.',
    '',
    ...SIGNATURE,
  ].join('\n');
}

function main() {
  let raw;
  try {
    raw = readFileSync(inputPath, 'utf8');
  } catch {
    console.error(`No se pudo leer el CSV de entrada: ${inputPath}`);
    process.exitCode = 1;
    return;
  }

  const rows = parseCsv(raw);
  if (rows.length < 2) {
    console.error('El CSV no tiene prospectos. Agregá al menos una fila.');
    process.exitCode = 1;
    return;
  }

  const canonicalOf = (h) => {
    const key = h.trim().toLowerCase();
    for (const [canon, list] of Object.entries(ALIASES)) {
      if (list.includes(key)) return canon;
    }
    return key;
  };
  const header = rows[0].map(canonicalOf);
  const index = {};
  header.forEach((h, i) => {
    if (!(h in index)) index[h] = i;
  });
  if (!('name' in index)) {
    console.error('Falta la columna de nombre (nombre/name).');
    process.exitCode = 1;
    return;
  }

  const lines = [];
  lines.push('# Envíos listos — Flecha Devs / Arquitectos · Glass World Studio');
  lines.push('');
  lines.push('> Marco: **Manifiesto de Convocatoria**. Firma obligatoria al pie.');
  lines.push('> Canal: **GitHub** (perfil público). Si el perfil expone correo, usarlo; si no, contactar por el perfil.');
  lines.push('> **Envío manual**, ritmo humano, máximo 3 toques. No automatizar cuentas.');
  lines.push('> Firma: Eduardo Esper · eduesper@gmail.com · +54 9 385 582-6289');
  lines.push('');
  lines.push('---');
  lines.push('');

  let total = 0;
  const counts = {};
  for (const row of rows.slice(1)) {
    const get = (k) => (k in index ? (row[index[k]] ?? '').trim() : '');
    const name = get('name');
    if (!name) continue;
    const p = {
      name,
      company: get('company'),
      role: get('role'),
      hook: get('hook'),
      perfil: get('perfil').toLowerCase(),
    };
    const url = get('url');
    const email = get('email');
    const estado = get('estado');

    counts[p.perfil || 'neutral'] = (counts[p.perfil || 'neutral'] ?? 0) + 1;
    total += 1;

    lines.push(`## ${name}${p.role ? ` — ${p.role}` : ''}${p.company ? ` · ${p.company}` : ''}`);
    lines.push(
      `*perfil: ${p.perfil || 'neutral'}${estado ? ` · estado: ${estado}` : ''}*`,
    );
    lines.push(`Canal: ${url || '[COMPLETAR: canal]'}`);
    if (email) lines.push(`Correo: ${email}`);
    lines.push('');
    lines.push(`**Asunto:** ${ASUNTO}`);
    lines.push('');
    lines.push('**Cuerpo:**');
    lines.push('');
    lines.push('```');
    lines.push(cuerpo(p));
    lines.push('```');
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  lines.push('## Resumen');
  lines.push(`- Envíos preparados: **${total}**`);
  for (const [perfil, n] of Object.entries(counts)) lines.push(`  - ${perfil}: ${n}`);
  lines.push('');

  writeFileSync(outputPath, `${lines.join('\n')}\n`, 'utf8');
  console.log(`Envíos escritos en: ${outputPath}`);
  console.log(`Envíos preparados: ${total}`);
  for (const [perfil, n] of Object.entries(counts)) console.log(`  - ${perfil}: ${n}`);
}

main();
