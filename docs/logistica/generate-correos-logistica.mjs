// Generador de correos de logística prioritaria — Glass World Studio.
// Toma logistica_aliados.csv y produce, para cada aliado de prioridad 1 (arte frágil)
// y prioridad 2 (empaque técnico / crating), un correo listo para enviar.
//
// Uso:
//   node docs/logistica/generate-correos-logistica.mjs
//   node docs/logistica/generate-correos-logistica.mjs ruta/logistica_aliados.csv ruta/salida.md
//
// La firma oficial va SIEMPRE al pie. Si la organización no expone correo, se indica el
// canal alternativo (formulario web) en lugar de inventar una dirección.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SIGNATURE = [
  'Eduardo Esper',
  'Fundador — Glass World Studio',
  'E-mail: eduesper@gmail.com',
  'Teléfono / WhatsApp: +54 9 385 582-6289',
  'Santiago del Estero, República Argentina',
];

const ASUNTO = 'Alianza logística — Glass World Studio, el ecosistema global del vidrio';

// Qué se busca y por qué, según la categoría del aliado.
const CATEGORIA = {
  arte_fragil:
    'El traslado de obras y piezas de vidrio exige manejo especializado: embalaje museístico, ' +
    'control de clima, seguros y trazabilidad. Es exactamente el tipo de operación donde su ' +
    'experiencia marca la diferencia.',
  empaque_crating:
    'El embalaje técnico —crating de madera, caballetes A-frame, pallets NIMF-15— es lo que hace ' +
    'viable exportar una pieza sin quebrarla. Es la base de toda la cadena y el punto donde una ' +
    'pieza se salva o se pierde.',
  _:
    'El movimiento de piezas frágiles es el eslabón crítico del sector: es donde una obra se salva ' +
    'o se pierde.',
};

const ROL = {
  arte_fragil: 'operadores de arte frágil',
  empaque_crating: 'fabricantes de empaque técnico y crating',
  _: 'aliados logísticos',
};

const ALIASES = {
  company: ['empresa', 'company', 'organizacion', 'organización'],
  categoria: ['categoria', 'categoría'],
  email: ['email_contacto', 'email', 'correo', 'mail'],
  website: ['sitio_web', 'website', 'web', 'sitio'],
  telefono: ['telefono', 'teléfono', 'phone'],
  prioridad: ['prioridad'],
};

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
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

const here = dirname(fileURLToPath(import.meta.url));
const inputPath = resolve(process.argv[2] ?? resolve(here, 'logistica_aliados.csv'));
const outputPath = resolve(process.argv[3] ?? resolve(here, 'GWS_Correos_Logistica.md'));

const PRIORIDADES = new Set(['1', '2']);

function cuerpo(p) {
  const intro = CATEGORIA[p.categoria] || CATEGORIA._;
  const rol = ROL[p.categoria] || ROL._;
  return [
    `Estimado equipo de ${p.company}:`,
    '',
    'Me dirijo a ustedes desde Santiago del Estero, Argentina, donde nació Glass World Studio (GWS).',
    '',
    intro,
    '',
    'Glass World Studio es el ecosistema digital global dedicado al vidrio: arte, industria y ' +
      'tecnología en una sola plataforma (6 galaxias y 5 satélites). Miles de artistas, talleres y ' +
      'fabricantes de todo el mundo van a necesitar mover obras y piezas frágiles, y ese es el ' +
      'eslabón que no queremos improvisar.',
    '',
    `Por eso buscamos ${rol} que se integren como aliados logísticos oficiales de la plataforma, ` +
      'para envíos nacionales e internacionales.',
    '',
    'No pedimos dinero: proponemos una alianza. Integrarse como operador oficial significa aparecer ' +
      'ante la demanda global del sector —artistas, galerías, fabricantes y distribuidores— que hoy ' +
      'no tiene un lugar común donde encontrarse.',
    '',
    'Si les interesa formar parte, respondé este mensaje y coordinamos 20 minutos. Sin compromiso.',
    '',
    'Cordialmente,',
    '',
    ...SIGNATURE,
  ].join('\n');
}

function main() {
  let raw;
  try {
    raw = readFileSync(inputPath, 'utf8');
  } catch {
    console.error(`No se pudo leer el CSV: ${inputPath}`);
    process.exitCode = 1;
    return;
  }

  const rows = parseCsv(raw);
  const canonicalOf = (h) => {
    const key = h.trim().toLowerCase();
    for (const [canon, list] of Object.entries(ALIASES)) if (list.includes(key)) return canon;
    return key;
  };
  const header = rows[0].map(canonicalOf);
  const index = {};
  header.forEach((h, i) => {
    if (!(h in index)) index[h] = i;
  });

  const lines = [];
  lines.push('# Correos de logística prioritaria listos — Glass World Studio');
  lines.push('');
  lines.push('> Prioridad 1 (**arte frágil**) y Prioridad 2 (**empaque técnico / crating**).');
  lines.push('> **Firma oficial al pie en todos.** Envío **manual**; verificar el canal antes de enviar.');
  lines.push('> Donde no hay correo, el canal es el formulario web (no se inventaron direcciones).');
  lines.push('');
  lines.push('---');
  lines.push('');

  let total = 0;
  const listos = [];
  const sinEmail = [];
  for (const row of rows.slice(1)) {
    const get = (k) => (k in index ? (row[index[k]] ?? '').trim() : '');
    const company = get('company');
    const categoria = get('categoria');
    const prioridad = get('prioridad');
    if (!company) continue;
    if (!PRIORIDADES.has(prioridad)) continue;

    const email = get('email');
    const website = get('website');
    const telefono = get('telefono');
    const hasEmail = EMAIL_RE.test(email);
    total += 1;
    if (hasEmail) listos.push(company);
    else sinEmail.push(company);

    lines.push(`## ${company}${prioridad === '1' ? ' · Arte frágil' : ' · Empaque / Crating'}`);
    lines.push(`**Categoría:** ${categoria || '—'} · **Prioridad:** ${prioridad || '—'}`);
    if (hasEmail) lines.push(`**Para:** ${email}`);
    else lines.push(`**Canal:** formulario web${website ? ` → ${website}` : ' [COMPLETAR]'} (sin correo público)`);
    if (website) lines.push(`**Web:** ${website}`);
    if (telefono && telefono !== '[COMPLETAR]') lines.push(`**Teléfono:** ${telefono}`);
    lines.push('');
    lines.push(`**Asunto:** ${ASUNTO}`);
    lines.push('');
    lines.push('**Cuerpo:**');
    lines.push('');
    lines.push('```');
    lines.push(cuerpo({ company, categoria }));
    lines.push('```');
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  lines.push('## Resumen');
  lines.push(`- Correos preparados: **${total}**`);
  lines.push(`  - con correo directo: **${listos.length}** → ${listos.join(' · ')}`);
  lines.push(`  - por formulario web: **${sinEmail.length}** → ${sinEmail.join(' · ')}`);
  lines.push('');

  writeFileSync(outputPath, `${lines.join('\n')}\n`, 'utf8');
  console.log(`Correos escritos en: ${outputPath}`);
  console.log(`Correos preparados: ${total} (correo directo: ${listos.length} · formulario: ${sinEmail.length})`);
}

main();
