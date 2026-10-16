// Generador de borradores de outreach para LinkedIn — Glass World Studio.
// Humano en el bucle: NO toca LinkedIn. Solo convierte la lista de prospectos en
// notas de invitación, aperturas y seguimientos listos para copiar y pegar.
//
// Uso:
//   node docs/outreach/linkedin/generate-drafts.mjs
//   node docs/outreach/linkedin/generate-drafts.mjs ruta/a/prospects.csv ruta/a/salida.md
//
// Entrada (CSV): flecha,perfil,name,company,role,linkedin_url,hook,estado
//   flecha = inversores | desarrolladores | logistica | generico
//   perfil = sub-perfil dentro de una flecha (opcional; ver SEQUENCES)
//   Acepta alias en español: nombre, empresa, cargo, url, gancho, status.
//   `estado` es sólo para tu seguimiento: el motor no lo usa para elegir el copy.

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

// Firma obligatoria: TODO correo o publicación de convocatoria la lleva al pie.
// (La nota de invitación de LinkedIn no la lleva: el tope es 300 caracteres.)
const SIGNATURE = [
  'Eduardo Esper — Fundador, Glass World Studio',
  'eduesper@gmail.com · +54 9 385 582-6289',
];

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
    // Alineado con el Kit de Alianza: 3 pasos (gancho -> alianza -> charla).
    // El espectro es AMPLIO Y SIN FRONTERAS: fondos early-stage, ángeles e
    // industriales del rubro. La columna `perfil` del CSV elige la variante;
    // sin `perfil`, se usa esta versión neutra (sirve para cualquiera).
    label: 'Flecha 1 — Inversores / Alianza estratégica',
    // Paso 1 — Primer contacto: el gancho de mercado. NO pide nada.
    note: (p) =>
      `Hola ${p.name}, sigo el trabajo de ${p.company}${p.hook ? ` y tu foco en ${p.hook}` : ''}. ` +
      `El vidrio mueve USD 450.000 millones al año y sigue sin plataforma que lo una. ` +
      `Construyo Glass World Studio. Me gustaría conectar. Eduardo Esper, fundador.`,
    opener: (p) =>
      `Gracias por conectar, ${firstName(p.name)}. Sin vueltas: medio billón de dólares moviéndose a ` +
      `mano. ¿Qué te haría prestar atención hoy a un marketplace vertical industrial?`,
    follow1Label: 'Paso 2 — Caso de valor + propuesta de alianza (+3–4 días)',
    follow2Label: 'Paso 3 — La charla (+5–7 días)',
    // Paso 2 — Se regala contenido y se planta la diferencia: no es capital pasivo.
    follow1: (p) =>
      `Sin apuro, ${firstName(p.name)}. Te dejo los tres comunicados con los que abrimos la nueva ` +
      `etapa: ${TRILOGY.reaparicion} · ${TRILOGY.alianzas} · ${TRILOGY.modelo} ` +
      `Y una aclaración de entrada: no busco capital pasivo. Pongo el mercado, la arquitectura y la ` +
      `plataforma; busco un socio que financie o ejecute el desarrollo, con participación generosa.`,
    // Paso 3 — La charla, con agenda y salida elegante.
    follow2: (p) =>
      `Cierro sin insistir, ${firstName(p.name)}. Si te interesa, 20 minutos con tres puntos: el mercado, ` +
      `la arquitectura y qué pongo yo sobre la mesa. Te paso franjas si me decís que sí.`,

    // --- Sub-perfiles (columna `perfil`) -----------------------------------
    // Afinan el registro según quién está del otro lado. Se fusionan sobre la
    // base: si una variante no define algo, hereda lo neutro.
    variants: {
      // Fondos de VC / early-stage / tesis industrial. Registro institucional.
      fondo: {
        note: (p) =>
          `Hola ${p.name}, sigo la tesis de ${p.company}${p.hook ? ` en ${p.hook}` : ''}. ` +
          `El vidrio mueve USD 450.000 millones al año y sigue sin plataforma que lo una. ` +
          `Construyo Glass World Studio. Me gustaría conectar. Eduardo Esper, fundador.`,
        opener: (p) =>
          `Gracias por conectar, ${firstName(p.name)}. Una pregunta antes de cualquier pitch: ` +
          `¿qué tiene que tener un marketplace vertical para entrar en la tesis de ${p.company}?`,
        follow1: (p) =>
          `Sin apuro, ${firstName(p.name)}. Les dejo los tres comunicados con los que abrimos la nueva ` +
          `etapa: ${TRILOGY.reaparicion} · ${TRILOGY.alianzas} · ${TRILOGY.modelo} ` +
          `No buscamos capital pasivo: ponemos el mercado, la arquitectura y la plataforma, y buscamos ` +
          `un socio que financie o ejecute el desarrollo técnico, con participación generosa.`,
        follow2: (p) =>
          `Cierro sin insistir, ${firstName(p.name)}. Si les interesa, 20 minutos con tres puntos: ` +
          `el mercado, la arquitectura y qué ponemos nosotros sobre la mesa.`,
      },
      // Inversores ángel: individuos, trato cercano y directo.
      angel: {
        note: (p) =>
          `Hola ${p.name}, sigo tu recorrido${p.hook ? ` en ${p.hook}` : ''}. ` +
          `El vidrio mueve USD 450.000 millones al año y sigue sin plataforma que lo una. ` +
          `Construyo Glass World Studio. Me gustaría conectar. Eduardo Esper, fundador.`,
        opener: (p) =>
          `Gracias por conectar, ${firstName(p.name)}. Te hago una pregunta directa: ¿qué te llevaría ` +
          `hoy a apostar personalmente por un sector milenario y fragmentado como el vidrio?`,
        follow1: (p) =>
          `Sin apuro, ${firstName(p.name)}. Te dejo los tres comunicados de la nueva etapa: ` +
          `${TRILOGY.reaparicion} · ${TRILOGY.alianzas} · ${TRILOGY.modelo} ` +
          `Y te aclaro de entrada: no busco capital pasivo. Pongo el mercado, la arquitectura y la ` +
          `plataforma; busco un socio que financie o ejecute el desarrollo técnico.`,
        follow2: (p) =>
          `Cierro sin insistir, ${firstName(p.name)}. Si te interesa, 20 minutos de charla franca: ` +
          `el mercado, la arquitectura y qué pongo yo sobre la mesa.`,
      },
      // Industriales, empresarios y referentes del rubro. Registro respetuoso.
      industrial: {
        note: (p) =>
          `Hola ${p.name}, sigo el trabajo de ${p.company} en el rubro${p.hook ? `, sobre todo ${p.hook}` : ''}. ` +
          `El vidrio mueve USD 450.000 millones al año y sigue fragmentado. ` +
          `Construyo Glass World Studio. Me gustaría conectar. Eduardo Esper, fundador.`,
        opener: (p) =>
          `Gracias por conectar, ${firstName(p.name)}. Usted conoce el rubro desde adentro mejor que ` +
          `nadie: ¿qué es lo que más le falta hoy a la industria del vidrio?`,
        follow1: (p) =>
          `Sin apuro, ${firstName(p.name)}. Le dejo los tres comunicados de la nueva etapa: ` +
          `${TRILOGY.reaparicion} · ${TRILOGY.alianzas} · ${TRILOGY.modelo} ` +
          `No vengo a pedir dinero a ciegas: pongo el estudio de mercado, la arquitectura y la ` +
          `plataforma. Busco un socio fundacional que financie o construya el desarrollo técnico.`,
        follow2: (p) =>
          `Cierro sin insistir, ${firstName(p.name)}. Si le interesa, 20 minutos con tres puntos: ` +
          `el mercado, la arquitectura y qué pongo yo sobre la mesa.`,
      },
    },
  },
  desarrolladores: {
    // El espectro técnico también es amplio. La columna `perfil` elige la variante:
    // fullstack | b2b | multiagente. Sin `perfil`, versión neutra.
    label: 'Flecha 2 — Desarrolladores / Arquitectos',
    note: (p) =>
      `Hola ${p.name}, vi tu experiencia en ${p.hook || 'software'}. Estoy armando el núcleo técnico ` +
      `de Glass World Studio, un marketplace vertical del vidrio a escala global. Busco un dev que ` +
      `quiera construirlo. Me gustaría conectar. Eduardo, fundador.`,
    opener: (p) =>
      `Gracias por conectar, ${firstName(p.name)}. Antes de contarte nada: ¿qué es lo que más te ` +
      `gusta construir hoy, y con qué stack lo resolvés?`,
    follow1: () =>
      `Te comparto el desafío, por si te resulta interesante: una plataforma B2B real (6 galaxias, ` +
      `5 satélites) con un enjambre de agentes detrás. ¿Le ves lugar para vos?`,
    follow2: (p) =>
      `Sin apuro, ${firstName(p.name)}. Si te interesa sumarte a la base técnica del proyecto, ` +
      `avisame y te cuento más. Buena semana.`,

    // --- Sub-perfiles (columna `perfil`) -----------------------------------
    variants: {
      // Full-stack / producto: de punta a punta.
      fullstack: {
        note: (p) =>
          `Hola ${p.name}, vi tu experiencia en ${p.hook || 'full-stack'}. Estoy armando el núcleo ` +
          `técnico de Glass World Studio, un marketplace vertical del vidrio, y busco un full-stack ` +
          `que lo lleve de punta a punta. Me gustaría conectar. Eduardo, fundador.`,
        opener: (p) =>
          `Gracias por conectar, ${firstName(p.name)}. ¿Preferís construir producto (front + back) o ` +
          `resolver infraestructura? Te lo pregunto porque el rol se puede adaptar a lo que más te guste.`,
        follow1: () =>
          `Te comparto el desafío: un marketplace completo (catálogo, licitaciones, perfiles, ` +
          `credenciales) sobre una arquitectura multi-agente. ¿Lo encararías de punta a punta?`,
        follow2: (p) =>
          `Sin apuro, ${firstName(p.name)}. Si te interesa, te cuento el rol y las condiciones. ` +
          `Buena semana.`,
      },
      // Backend / marketplaces B2B y plataformas transaccionales.
      b2b: {
        note: (p) =>
          `Hola ${p.name}, vi tu experiencia en ${p.hook || 'plataformas B2B'}. Estoy armando el núcleo ` +
          `técnico de Glass World Studio, un marketplace B2B vertical, y busco gente que haya ` +
          `construido plataformas transaccionales. Me gustaría conectar. Eduardo, fundador.`,
        opener: (p) =>
          `Gracias por conectar, ${firstName(p.name)}. ¿Qué parte de un marketplace B2B te parece la ` +
          `más difícil de construir bien: matching, licitaciones, pagos o trazabilidad?`,
        follow1: () =>
          `Te comparto el desafío: oferta y demanda del vidrio en tiempo real, licitaciones y un ` +
          `catálogo multigalaxia. ¿Qué resolverías primero?`,
        follow2: (p) =>
          `Sin apuro, ${firstName(p.name)}. Si le ves encaje, te cuento el rol y las condiciones. ` +
          `Buena semana.`,
      },
      // Arquitectos de software: APIs, microservicios y diseño de sistemas.
      arquitecto: {
        note: (p) =>
          `Hola ${p.name}, vi tu perfil de arquitectura${p.hook ? ` (${p.hook})` : ''}. Estoy armando el ` +
          `núcleo técnico de Glass World Studio, un marketplace vertical del vidrio, y busco arquitectos. ` +
          `Me gustaría conectar. Eduardo, fundador.`,
        opener: (p) =>
          `Gracias por conectar, ${firstName(p.name)}. Pregunta de arquitecto a arquitecto: para un ` +
          `marketplace B2B con oferta/demanda en tiempo real y licitaciones, ¿qué construirías primero: ` +
          `el dominio, las APIs o la capa de agentes?`,
        follow1: () =>
          `Te comparto el desafío: 6 galaxias y 5 satélites de ingeniería predictiva sobre APIs y ` +
          `microservicios, con orquestación de agentes. ¿Cómo lo diseñarías vos?`,
        follow2: (p) =>
          `Sin apuro, ${firstName(p.name)}. Si te interesa el rol de arquitectura, te cuento alcance y ` +
          `condiciones. Buena semana.`,
      },
      // Arquitectura multi-agente / MCP / IA.
      multiagente: {
        note: (p) =>
          `Hola ${p.name}, vi tu experiencia en ${p.hook || 'IA'}. Estoy armando el núcleo técnico de ` +
          `Glass World Studio (marketplace vertical del vidrio) sobre arquitectura multi-agente. ` +
          `Me gustaría conectar. Eduardo, fundador.`,
        opener: (p) =>
          `Gracias por conectar, ${firstName(p.name)}. ¿Con qué stack y orquestación venís construyendo ` +
          `sistemas multi-agente, y qué es lo que más te cuesta en ese tipo de arquitecturas?`,
        follow1: () =>
          `Te comparto el desafío: motorizar 5 satélites de ingeniería predictiva sobre una arquitectura ` +
          `de agentes. ¿Cómo lo encararías vos?`,
        follow2: (p) =>
          `Sin apuro, ${firstName(p.name)}. Si te interesa sumarte a la base técnica, avisame y te ` +
          `cuento más. Buena semana.`,
      },
    },
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
    console.error('El CSV no tiene prospectos: sólo cabecera o vacío. Agregá al menos una fila.');
    process.exitCode = 1;
    return;
  }

  // Normalizamos los encabezados a nombres canónicos: aceptamos tanto las claves
  // en inglés que usa el motor (name, company, role) como alias en español
  // (nombre, empresa, cargo), para que la lista se pueda pegar como venga.
  const ALIASES = {
    flecha: ['flecha', 'arrow'],
    perfil: ['perfil', 'profile'],
    name: ['name', 'nombre'],
    company: ['company', 'empresa', 'empresa_o_fondo', 'organizacion', 'organización'],
    role: ['role', 'cargo', 'puesto'],
    linkedin_url: ['linkedin_url', 'url', 'linkedin', 'perfil_url'],
    email: ['email', 'email_contacto', 'correo', 'mail'],
    website: ['website', 'web', 'sitio', 'sitio_web'],
    hook: ['hook', 'gancho'],
    estado: ['estado', 'status'],
  };
  const canonicalOf = (raw) => {
    const h = raw.trim().toLowerCase();
    for (const [canon, list] of Object.entries(ALIASES)) {
      if (list.includes(h)) return canon;
    }
    return h;
  };

  const header = rows[0].map(canonicalOf);
  const index = {};
  header.forEach((h, i) => {
    if (!(h in index)) index[h] = i;
  });
  const required = ['flecha', 'name'];
  const missing = required.filter((key) => !(key in index));
  if (missing.length > 0) {
    console.error(
      `Faltan columnas obligatorias: ${missing.join(', ')} ` +
        '(también acepto nombre / empresa / cargo como alias).',
    );
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
    const perfil = get('perfil').toLowerCase();
    const baseSeq = SEQUENCES[flecha] ?? SEQUENCES.generico;
    const p = { name: get('name'), company: get('company'), role: get('role'), hook: get('hook') };
    const url = get('linkedin_url');
    const email = get('email');
    const website = get('website');
    const estado = get('estado');

    if (flecha !== 'generico' && !SEQUENCES[flecha]) {
      warnings.push(`Flecha desconocida "${flecha}" para ${p.name} — se usó la secuencia genérica.`);
    }

    // Sub-perfil (columna `perfil`): afina la secuencia dentro de una misma flecha.
    // Hoy sólo `inversores` los define; el resto de las flechas ignora la columna.
    let seq = baseSeq;
    let appliedPerfil = '';
    if (baseSeq.variants) {
      if (perfil && baseSeq.variants[perfil]) {
        seq = { ...baseSeq, ...baseSeq.variants[perfil] };
        appliedPerfil = perfil;
      } else if (perfil) {
        warnings.push(
          `Perfil desconocido "${perfil}" para ${p.name} — se usó la variante neutra de ${flecha}.`,
        );
      }
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
    lines.push(`*${seq.label}${appliedPerfil ? ` · perfil: ${appliedPerfil}` : ''}${estado ? ` · estado: ${estado}` : ''}*`);
    if (url) lines.push(`<${url}>`);
    if (email) lines.push(`Correo: ${email}`);
    if (website) lines.push(`Web: <${website}>`);
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
    lines.push('**Firma obligatoria (todo correo la lleva al pie):**');
    for (const l of SIGNATURE) lines.push(`> ${l}`);
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
