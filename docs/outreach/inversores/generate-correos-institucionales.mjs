// Generador de correos institucionales — Glass World Studio.
// Toma prospects.csv y produce, por cada organización con correo REAL confirmado,
// un correo listo para enviar a partir de la Carta de Convocatoria Institucional.
//
// Uso:
//   node docs/outreach/inversores/generate-correos-institucionales.mjs
//   node docs/outreach/inversores/generate-correos-institucionales.mjs ruta/prospects.csv ruta/salida.md
//
// Regla: sólo genera correo si la columna de email tiene una dirección real
// (los `[COMPLETAR]` se saltan). La firma oficial va SIEMPRE al pie.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Sitio oficial (landing pública): respaldo de toda comunicación saliente.
const SITE = 'https://www.glassworldstudio.com.ar';

const SIGNATURE = [
  'Eduardo Esper',
  'Fundador — Glass World Studio',
  `Web: ${SITE}`,
  'E-mail: edu.esper@glassworldstudio.com.ar',
  'Teléfono / WhatsApp: +54 9 385 622-8400',
  'Santiago del Estero, República Argentina',
];

// CTA obligatorio: en toda comunicación saliente se deriva al sitio oficial.
const CTA =
  'Conocé el ecosistema, la propuesta de valor, el resguardo legal ante el INPI y el canal ' +
  `directo con la dirección del proyecto en ${SITE}`;

const ASUNTO =
  'Alianzas estratégicas · Inversores — Convocatoria a co-construir el ecosistema digital del vidrio';

// Framing central (post-16-10-2026): GWS busca ALIANZAS ESTRATÉGICAS en 3 ejes, en este orden:
// 1) Inversores y capital · 2) Desarrolladores/tecnología · 3) Logística (pilar operativo).
const CANON =
  'Glass World Studio (GWS) busca Alianzas Estratégicas: Inversores, Desarrolladores y Logística.';

// Vía de participación según el perfil del destinatario (texto plano: es un correo).
const VIAS = {
  fondo:
    'En el caso de un fondo, la vía es el financiamiento y los pagos directos al equipo de ' +
    'desarrollo, con condiciones y plazos pactados de común acuerdo. No es capital pasivo: es una ' +
    'sociedad de obra.',
  angel:
    'En el caso de una red de ángeles, la vía es acompañar a los socios fundacionales que financien ' +
    'o ejecuten el desarrollo técnico, con participación generosa y pactada de común acuerdo.',
  industrial:
    'En el caso de un actor de la industria, la vía es una alianza estratégica: aportar red y ' +
    'conocimiento del rubro, y sumarse al consejo fundacional de la plataforma.',
  _:
    'La vía se ajusta al perfil: financiamiento directo, ejecución técnica o alianza estratégica, ' +
    'siempre con condiciones pactadas de común acuerdo.',
};

const ALIASES = {
  name: ['name', 'nombre'],
  company: ['company', 'empresa', 'empresa_o_fondo', 'organizacion', 'organización'],
  email: ['email', 'email_contacto', 'correo', 'mail'],
  perfil: ['perfil', 'profile'],
  website: ['website', 'web', 'sitio', 'sitio_web'],
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
const inputPath = resolve(process.argv[2] ?? resolve(here, '..', 'linkedin', 'prospects.csv'));
const outputPath = resolve(process.argv[3] ?? resolve(here, 'GWS_Correos_Institucionales.md'));

function cuerpo(p) {
  const via = VIAS[p.perfil] || VIAS._;
  return [
    `Estimado equipo de ${p.company}:`,
    '',
    'Me dirijo a ustedes desde Santiago del Estero, Argentina, donde nació Glass World Studio (GWS).',
    '',
    'Glass World Studio surge en un banco de trabajo. Tras 20 años como artista plástico, docente y ' +
      'discípulo del maestro Miguel Diez, y tras años de investigación, detecté una vacante histórica: ' +
      'el arte, la industria y la tecnología del vidrio carecen de una plataforma digital integral que ' +
      'congregue a todos sus actores globales.',
    '',
    CANON,
    'Esta es la convocatoria del eje de inversores y capital de escala —el primero de los tres—. ' +
      'Los otros dos ejes son Desarrolladores (núcleo técnico) y Logística (pilar operativo).',
    '',
    'Una industria milenaria —el vidrio plano mueve USD 323.200 millones (2025), camino a USD 450.200 ' +
      'millones (2033)— sigue operando a mano y fragmentada en miles de talleres, plantas, distribuidores ' +
      'y artistas que no se conocen entre sí. Y hay algo más: la mayor parte del mercado real de taller ' +
      '(insumos, maquinaria usada, fletes locales) es invisible a las consultoras: nadie lo mide. ' +
      'Ese lugar no existe. Lo estamos construyendo.',
    '',
    'Glass World Studio no pide dinero: ofrece co-construir el ecosistema definitivo de una industria ' +
      'milenaria.',
    '',
    via,
    '',
    'Lo que ponemos sobre la mesa: el estudio de mercado de una industria sin dueño digital, la ' +
      'arquitectura completa (6 galaxias y 5 satélites) y la plataforma en producción. No pedimos a ' +
      'ciegas. Mostramos.',
    '',
    'Si el enfoque les resuena, con gusto coordinamos una reunión breve. Quedo a su disposición.',
    '',
    CTA,
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
  lines.push('# Correos institucionales listos — Glass World Studio');
  lines.push('');
  lines.push(`> **${CANON}** Esta pieza corresponde al **eje 1 — Inversores y capital**.`);
  lines.push('> Derivados de `GWS_Carta_Convocatoria_Institucional.md`. **Firma oficial al pie en todos.**');
  lines.push('> Sólo se generan correos para organizaciones con **correo real** (los `[COMPLETAR]` se omiten).');
  lines.push('> Envío con *throttling*; verificar el correo antes de enviar.');
  lines.push('');
  lines.push('---');
  lines.push('');

  let total = 0;
  const skipped = [];
  for (const row of rows.slice(1)) {
    const get = (k) => (k in index ? (row[index[k]] ?? '').trim() : '');
    const company = get('company') || get('name');
    const email = get('email');
    const perfil = get('perfil').toLowerCase();
    const website = get('website');
    if (!company) continue;
    if (!EMAIL_RE.test(email)) {
      skipped.push(`${company} (${email || 'sin dato'})`);
      continue;
    }
    total += 1;
    lines.push(`## ${company}`);
    lines.push(`**Para:** ${email}`);
    lines.push(`**Perfil:** ${perfil || 'neutral'}${website ? ` · **Web:** ${website}` : ''}`);
    lines.push('');
    lines.push(`**Asunto:** ${ASUNTO}`);
    lines.push('');
    lines.push('**Cuerpo:**');
    lines.push('');
    lines.push('```');
    lines.push(cuerpo({ company, perfil }));
    lines.push('```');
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  lines.push('## Resumen');
  lines.push(`- Correos listos: **${total}**`);
  if (skipped.length > 0) {
    lines.push(`- Omitidos (sin correo directo → usar formulario web): **${skipped.length}**`);
    for (const s of skipped) lines.push(`  - ${s}`);
  }
  lines.push('');

  writeFileSync(outputPath, `${lines.join('\n')}\n`, 'utf8');
  console.log(`Correos escritos en: ${outputPath}`);
  console.log(`Correos listos: ${total}`);
  if (skipped.length) console.log(`Omitidos (sin email): ${skipped.length}`);
}

main();
