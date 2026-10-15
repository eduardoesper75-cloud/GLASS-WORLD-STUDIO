// Generador de borradores de outreach para LinkedIn — Glass World Studio.
// Humano en el bucle: NO toca LinkedIn. Solo convierte la lista de prospectos en
// notas de invitación, aperturas y seguimientos listos para copiar y pegar.
//
// Uso:
//   node docs/outreach/linkedin/generate-drafts.mjs
//   node docs/outreach/linkedin/generate-drafts.mjs ruta/a/prospects.csv ruta/a/salida.md
//
// Entrada (CSV): flecha,name,company,role,linkedin_url,hook
//   flecha = inversores | desarrolladores | logistica | generico

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const NOTE_LIMIT = 300; // límite de caracteres de la nota de invitación de LinkedIn

// Trilogía comunicacional publicada: es la base del "caso de valor" (Paso 2) del
// Kit de Inversores. Los comunicados viven en el sitio público de GWS.
const SITE = 'https://glass-world-studio.vercel.app';
const TRILOGY = {
  reaparicion: `${SITE}/novedades/reaparicion`,
  alianzas: `${SITE}/novedades/alianzas-estrategicas`,
  modelo: `${SITE}/novedades/modelo-de-alianza`,
};

const here = dirname(fileURLToPath(import.meta.url));
const inputPath = resolve(process.argv[2] ?? resolve(here, 'prospects.csv'));
const outputPath = resolve(process.argv[3] ?? resolve(here, 'drafts.md'));

/** Parser CSV mínimo (soporta comillas dobles y comas embebidas). */
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

const FALLBACK_NOTE = (p) =>
  `Hola ${p.name}, me gustaría conectar. Estoy construyendo Glass World Studio, ` +
  `marketplace vertical de la industria del vidrio. Eduardo Esper, fundador.`;

const SEQUENCES = {
  inversores: {
    // Alineado con el Kit de Inversores: 3 pasos (contacto -> valor -> reunión).
    label: 'Flecha 1 — Inversores / Capital',
    // Paso 1 — Primer contacto: abre la puerta, NO vende.
    note: (p) =>
      `Hola ${p.name}, sigo el trabajo de ${p.company}${p.hook ? ` y tu foco en ${p.hook}` : ''}. ` +
      `Estoy construyendo Glass World Studio, el marketplace vertical de la industria global del vidrio. ` +
      `Me gustaría conectar. Eduardo Esper, fundador.`,
    opener: (p) =>
      `Gracias por conectar, ${firstName(p.name)}. Antes de contarte nada, me interesa tu mirada: ` +
      `¿qué señales te hacen prestar atención hoy a un marketplace vertical industrial?`,
    follow1Label: 'Paso 2 — Caso de valor con la Trilogía (+3–4 días)',
    follow2Label: 'Paso 3 — Llamado a la reunión ejecutiva (+5–7 días)',
    // Paso 2 — Se regala contenido, no se pide nada.
    follow1: (p) =>
      `Sin apuro, ${firstName(p.name)}. Te dejo los tres comunicados con los que abrimos la nueva ` +
      `etapa, se leen en 6 minutos: ${TRILOGY.reaparicion} · ${TRILOGY.alianzas} · ${TRILOGY.modelo} ` +
      `La arquitectura (6 galaxias + 5 satélites) es lo que miro con ojo de inversor.`,
    // Paso 3 — Pedido concreto con agenda y salida elegante.
    follow2: (p) =>
      `Cierro sin insistir, ${firstName(p.name)}. Si te interesa, 20 minutos con agenda de tres puntos: ` +
      `el problema, el modelo de galaxias y el Ask. Te paso franjas si me decís que sí.`,
  },
  desarrolladores: {
    label: 'Flecha 2 — Desarrolladores / Arquitectos',
    note: (p) =>
      `Hola ${p.name}, vi tu experiencia en ${p.hook || 'software'}. Estoy armando el núcleo técnico de ` +
      `Glass World Studio (marketplace vertical del vidrio) sobre arquitectura multi-agente. ` +
      `Me gustaría conectar. Eduardo, fundador.`,
    opener: (p) =>
      `Gracias por conectar, ${firstName(p.name)}. ¿Con qué stack y orquestación venís construyendo ` +
      `sistemas multi-agente, y qué es lo que más te cuesta en ese tipo de arquitecturas?`,
    follow1: () =>
      `Te comparto el desafío, por si te resulta interesante: motorizar 5 satélites de ingeniería ` +
      `predictiva sobre una arquitectura de agentes. ¿Cómo lo encararías vos?`,
    follow2: (p) =>
      `Sin apuro, ${firstName(p.name)}. Si te interesa sumarte a la base técnica del proyecto, ` +
      `avisame y te cuento más. Buena semana.`,
  },
  logistica: {
    label: 'Flecha 3 — Logística / Cadena de suministro',
    note: (p) =>
      `Hola ${p.name}, me interesa cómo ${p.company} mueve carga frágil e insumos industriales. ` +
      `Estoy construyendo Glass World Studio, marketplace vertical del vidrio. ` +
      `Me gustaría conectar. Eduardo Esper, fundador.`,
    opener: (p) =>
      `Gracias por conectar, ${firstName(p.name)}. Hoy, ¿qué es lo más difícil de mover en el rubro ` +
      `(vidrio artístico, refractarios, materia prima) y cómo lo resolvés?`,
    follow1: () =>
      `Te comparto la visión: integrar logística y cadena de suministro como aliado estratégico de una ` +
      `red que conecta oferta y demanda del vidrio a nivel global. ¿Le ves encaje?`,
    follow2: (p) =>
      `Sin apuro, ${firstName(p.name)}. Si te interesa explorar una alianza, avisame y coordinamos. ` +
      `Buena semana.`,
  },
  generico: {
    label: 'Genérico — Descubrimiento',
    note: (p) =>
      `Hola ${p.name}, me gustaría conectar. Estoy construyendo Glass World Studio, un marketplace ` +
      `vertical para la industria global del vidrio. Eduardo Esper, fundador.`,
    opener: (p) =>
      `Gracias por conectar, ${firstName(p.name)}. Me interesa entender tu trabajo: ¿en qué estás enfocado hoy?`,
    follow1: () =>
      `En una frase: Glass World Studio une arte, industria y comercio del vidrio en un solo ecosistema. ¿Te resuena?`,
    follow2: (p) => `Sin apuro, ${firstName(p.name)}. Quedo a disposición si querés saber más.`,
  },
};

function main() {
  let raw;
  try {
    raw = readFileSync(inputPath, 'utf8');
  } catch {
    console.error(`No se pudo leer el CSV de entrada: ${inputPath}`);
    console.error('Copiá prospects.template.csv a prospects.csv y completá tus prospectos.');
    process.exitCode = 1;
    return;
  }

  const rows = parseCsv(raw);
  if (rows.length < 2) {
    console.error('El CSV no tiene prospectos (solo cabecera o vacío).');
    process.exitCode = 1;
    return;
  }

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const index = Object.fromEntries(header.map((h, i) => [h, i]));
  const required = ['flecha', 'name'];
  const missing = required.filter((key) => !(key in index));
  if (missing.length > 0) {
    console.error(`Faltan columnas obligatorias: ${missing.join(', ')}`);
    process.exitCode = 1;
    return;
  }

  const lines = [];
  const warnings = [];
  const counts = {};

  lines.push('# Borradores de outreach en LinkedIn — Glass World Studio');
  lines.push('');
  lines.push('> Generado con humano en el bucle. Copiá y pegá a mano. No automatices la cuenta.');
  lines.push('');

  let total = 0;
  for (const row of rows.slice(1)) {
    const get = (key) => (key in index ? (row[index[key]] ?? '').trim() : '');
    const flecha = (get('flecha') || 'generico').toLowerCase();
    const seq = SEQUENCES[flecha] ?? SEQUENCES.generico;
    const p = { name: get('name'), company: get('company'), role: get('role'), hook: get('hook') };
    const url = get('linkedin_url');

    if (flecha !== 'generico' && !SEQUENCES[flecha]) {
      warnings.push(`Flecha desconocida "${flecha}" para ${p.name} — se usó la secuencia genérica.`);
    }

    let note = seq.note(p);
    const noteLen = note.length;
    if (noteLen > NOTE_LIMIT) {
      warnings.push(
        `La nota de ${p.name} tiene ${noteLen} caracteres (> ${NOTE_LIMIT}). Se incluyó una versión corta.`,
      );
    }

    counts[flecha] = (counts[flecha] ?? 0) + 1;
    total += 1;

    lines.push(`## ${p.name}${p.role ? ` — ${p.role}` : ''}${p.company ? ` · ${p.company}` : ''}`);
    lines.push(`*${seq.label}*`);
    if (url) lines.push(`<${url}>`);
    lines.push('');
    lines.push(`**Nota de invitación (${noteLen}/${NOTE_LIMIT}):**`);
    lines.push(`> ${noteLen > NOTE_LIMIT ? FALLBACK_NOTE(p) : note}`);
    lines.push('');
    lines.push('**Mensaje de apertura (tras aceptar):**');
    lines.push(`> ${seq.opener(p)}`);
    lines.push('');
    lines.push(`**${seq.follow1Label ?? 'Seguimiento 1 (+3–4 días si no responde)'}:**`);
    lines.push(`> ${seq.follow1(p)}`);
    lines.push('');
    lines.push(`**${seq.follow2Label ?? 'Seguimiento 2 (cierre amable, +5–6 días)'}:**`);
    lines.push(`> ${seq.follow2(p)}`);
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  lines.push('## Resumen');
  lines.push('');
  lines.push(`- Prospectos procesados: **${total}**`);
  for (const [flecha, n] of Object.entries(counts)) {
    lines.push(`  - ${flecha}: ${n}`);
  }
  lines.push('');
  lines.push('Recordá: máximo 3 toques, ritmo humano y personalización real. Ver el playbook.');

  writeFileSync(outputPath, `${lines.join('\n')}\n`, 'utf8');

  console.log(`Borradores escritos en: ${outputPath}`);
  console.log(`Prospectos procesados: ${total}`);
  for (const [flecha, n] of Object.entries(counts)) {
    console.log(`  - ${flecha}: ${n}`);
  }
  if (warnings.length > 0) {
    console.log('');
    console.log('Avisos:');
    for (const w of warnings) console.log(`  ! ${w}`);
  }
}

main();
