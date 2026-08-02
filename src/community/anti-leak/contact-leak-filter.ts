/**
 * GWS · Filtro anti-fuga de contacto del chat interno
 * ------------------------------------------------------------
 * Soberanía de la plataforma (CLAUDE.md §3.6): TODO contacto,
 * negociación y cierre de acuerdos ocurre dentro de GWS. Este módulo
 * es la única pieza que decide si un mensaje intenta sacar la
 * operación fuera de la plataforma.
 *
 * Política (decisión explícita de Jorge, 2026):
 *   - El mensaje se BLOQUEA en el servidor (no se guarda) y se
 *     audita como `chat_contact_leak_blocked`. No es "marcar y
 *     guardar" — bloquear es la única garantía real: un filtro que
 *     solo marca puede evadirse con un simple POST manual, porque
 *     la validación en el navegador nunca es suficiente.
 *   - Se bloquea el intento aunque el dato esté ofuscado (espacios,
 *     guiones, "wsp" en vez de WhatsApp, "arroba" implícita), porque
 *     la evasión deliberada también es una violación de soberanía.
 *   - El detector es 100% puro (sin dependencias de Nest) para poder
 *     testearlo en aislamiento y reutilizarlo en futuros puntos de
 *     ingreso de texto (DMs, respuestas a ofertas, descripciones de
 *     listings de G2 en una fase posterior).
 *
 * Nota de precisión: la política es ESTRICTA a propósito — ante la
 * duda entre un falso positivo y dejar pasar una fuga, se bloquea y
 * se audita. Los falsos positivos quedan en el log para que
 * moderación los revise, pero la fuga no pasa.
 */

export type LeakCategory =
  | 'email'
  | 'phone'
  | 'whatsapp'
  | 'telegram'
  | 'instagram'
  | 'other_social'
  | 'external_link'
  | 'geolocation'
  | 'contact_intent';

export interface ContactLeakVerdict {
  blocked: boolean;
  categories: LeakCategory[];
  /** Extractos que dispararon la alerta (truncados), para el mensaje al
   * usuario y para que moderación vea el contexto exacto en el audit log. */
  samples: string[];
}

/** Mensaje público de la política, en español (copia de cara al usuario). */
export const CONTACT_LEAK_POLICY_MESSAGE =
  'Mensaje bloqueado: en Glass World Studio todo contacto, negociación y cierre ' +
  'de acuerdos ocurre dentro de la plataforma. No se permite compartir teléfonos, ' +
  'correos, usuarios de redes o enlaces externos (WhatsApp, Instagram, Telegram, etc.) ' +
  'ni coordenadas personales. Esto protege tus operaciones y las del resto de la ' +
  'comunidad. Si fue un error, reformulá tu mensaje dentro de la plataforma.';

// ---------------------------------------------------------------------------
// Expresiones por tipo de fuga. Sin modificadores "g" ni estado — son literales
// reutilizables; cada llamada crea su propio contexto de ejecución.
// ---------------------------------------------------------------------------

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;

/** URL genérica: http(s):// o www. */
const GENERIC_URL_RE = /\b(?:https?:\/\/|www\.)[^\s<>()]+/i;

/** Acortadores de URL (se usan para ocultar el destino de la fuga). */
const SHORTENER_URL_RE =
  /(?:bit\.ly\/|t\.co\/|tinyurl\.com\/|goo\.gl\/|cutt\.ly\/|rb\.gy\/|is\.gd\/|ow\.ly\/|buff\.ly\/)/i;

const WHATSAPP_LINK_RE = /(?:wa\.me\/\d+|whatsapp\.com\/|api\.whatsapp\.com)/i;
const TELEGRAM_LINK_RE = /(?:t\.me\/|telegram\.me\/)/i;
const INSTAGRAM_LINK_RE = /(?:instagram\.com\/|instagr\.am\/)/i;
const OTHER_SOCIAL_LINK_RE =
  /(?:facebook\.com\/|fb\.me\/|tiktok\.com\/|youtube\.com\/@|twitch\.tv\/|discord\.gg\/|snapchat\.com\/add\/|linkedin\.com\/in\/|threads\.net\/@|x\.com\/|twitter\.com\/)/i;

/** Geolocalización: vínculo a mapas o servicio de coordenadas. */
const GEO_MAP_LINK_RE =
  /(?:maps\.google|goo\.gl\/maps|google\.com\/maps|what3words|plus\.codes)/i;

/** Coordenadas crudas: "-34.6037, -58.3816" (exige >= 3 decimales para no
 * confundir con cifras comunes; signo o coma como separador). */
const GEO_COORD_RE = /[-+]?\d{1,3}(?:\.\d{3,})\s*[,;]\s*[-+]?\d{1,3}(?:\.\d{3,})/;

/** Coordenadas rotuladas: "lat: -34.60 lng: -58.38", "coordenadas ..." */
const GEO_LABEL_RE =
  /(?:lat(?:itude)?|lng|longitude|latitud|longitud|coordenadas?|gps|ubicacion|ubicación)[:=]?\s*[-+]?\d{1,3}\.\d{2,}/i;

/** Teléfono internacional (E.164): "+54 9 11 2345-6789" o "00 54 ...".
 * Separa el prefijo y exige >= 6 dígitos después, tolerando separadores. */
const PHONE_E164_RE = /(?:\+|00)\d{1,3}(?:[\s.\-()]?\d){6,}/;

/** Teléfono local con separador fuerte: "(011) 4567-8901", "11 2345-6789",
 * "11-2345-6789". Los guiones y paréntesis son huellas inequívocas de número;
 * los puntos quedan excluidos a propósito (evita cifras como "12.500.000"). */
const PHONE_GROUPED_RE = /(?:\(\d{2,4}\)[\s-]*\d[\d\s-]{6,}\d|\b\d{2,4}[\s-]+\d{3,4}[\s-]+\d{3,4}\b)/;

// ---------------------------------------------------------------------------
// Palabras clave. Fronteras no alfanuméricas para que "ig" no se dispare
// dentro de "digital" ni "fb" dentro de "dfbrowser". Se matchean sobre el
// texto en minúsculas.
// ---------------------------------------------------------------------------

const WHATSAPP_WORDS = ['whatsapp', 'whastapp', 'wsp', 'whats', 'wa.me'];
const TELEGRAM_WORDS = ['telegram', 't.me', 'tele'];
const INSTAGRAM_WORDS = ['instagram', 'instagr.am', 'insta', 'ig'];
const OTHER_SOCIAL_WORDS = [
  'facebook',
  'fb',
  'tiktok',
  'youtube',
  'twitch',
  'discord',
  'snapchat',
  'linktree',
  'beacons',
  'seguime',
  'follow me',
];

/** Palabras que anuncian intención de contacto telefónico, aun sin número
 * parseable: "te paso mi número", "hablame al cel". */
const PHONE_INTENT_WORDS = [
  'teléfono',
  'telefono',
  'celular',
  'celu',
  'móvil',
  'movil',
  'llámame',
  'llamame',
  'hablame',
  'hableme',
  'escribime',
  'mandame',
  'envíame',
  'enviame',
  'contactame',
  'contáctame',
  'mi número',
  'mi numero',
  'mi cel',
  'mi celular',
  'al número',
  'al numero',
  'mi wsp',
  'mi whatsapp',
  'número de',
  'numero de',
  'me hablas',
  'me escribís',
  'me escribis',
];

/** Palabras que anuncian intención de contacto por correo. */
const EMAIL_INTENT_WORDS = ['correo', 'email', 'e-mail', 'mail'];

/** Intención explícita de mover la operación fuera de la plataforma. */
const EXTERNAL_INTENT_WORDS = [
  'por afuera',
  'por fuera',
  'fuera de la plataforma',
  'afuera de la plataforma',
  'por whatsapp',
  'por telegram',
  'por instagram',
  'pago externo',
  'venta externa',
  'transferencia externa',
];

/** Construye una RegExp que matchea cualquiera de las palabras con fronteras
 * no alfanuméricas. Las palabras se escapan para que "e-mail", "+", "." etc.
 * no rompan la expresión. */
function wordsToRegex(words: string[]): RegExp {
  const escaped = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`(?:^|[^a-z0-9])(${escaped.join('|')})(?:[^a-z0-9]|$)`, 'i');
}

const WHATSAPP_RE = wordsToRegex(WHATSAPP_WORDS);
const TELEGRAM_RE = wordsToRegex(TELEGRAM_WORDS);
const INSTAGRAM_RE = wordsToRegex(INSTAGRAM_WORDS);
const OTHER_SOCIAL_RE = wordsToRegex(OTHER_SOCIAL_WORDS);
const PHONE_INTENT_RE = wordsToRegex(PHONE_INTENT_WORDS);
const EMAIL_INTENT_RE = wordsToRegex(EMAIL_INTENT_WORDS);
const EXTERNAL_INTENT_RE = wordsToRegex(EXTERNAL_INTENT_WORDS);

/** Máxima corrida de dígitos consecutivos en el texto ORIGINAL (los
 * separadores cortan la corrida: "año 2024 precio 5000000" no se confunde
 * con un teléfono, pero "1123456789" sí). */
function longestDigitRun(text: string): number {
  let best = 0;
  let current = 0;
  for (const ch of text) {
    if (ch >= '0' && ch <= '9') {
      current += 1;
      if (current > best) best = current;
    } else {
      current = 0;
    }
  }
  return best;
}

function truncate(value: string, max = 80): string {
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

export function detectContactLeak(rawText: string): ContactLeakVerdict {
  const text = String(rawText ?? '');
  const lower = text.toLowerCase();

  const categories = new Set<LeakCategory>();
  const samples: string[] = [];
  const add = (category: LeakCategory, sample: string) => {
    categories.add(category);
    if (samples.length < 6 && !samples.includes(sample)) {
      samples.push(truncate(sample));
    }
  };

  // ---- Correo electrónico directo ----
  const emailMatch = EMAIL_RE.exec(text);
  if (emailMatch) add('email', emailMatch[0]);

  // ---- Enlaces externos ----
  const genericUrl = GENERIC_URL_RE.exec(text);
  if (genericUrl) add('external_link', genericUrl[0]);
  if (SHORTENER_URL_RE.test(lower)) add('external_link', 'enlace acortado');

  // ---- Plataformas de mensajería/redes (vínculos) ----
  if (WHATSAPP_LINK_RE.test(lower)) add('whatsapp', 'vínculo de WhatsApp');
  if (TELEGRAM_LINK_RE.test(lower)) add('telegram', 'vínculo de Telegram');
  if (INSTAGRAM_LINK_RE.test(lower)) add('instagram', 'vínculo de Instagram');
  if (OTHER_SOCIAL_LINK_RE.test(lower)) add('other_social', 'vínculo a red social');

  // ---- Geolocalización personal en crudo ----
  const coord = GEO_COORD_RE.exec(text);
  if (coord) add('geolocation', coord[0]);
  const geoLabel = GEO_LABEL_RE.exec(text);
  if (geoLabel) add('geolocation', geoLabel[0]);
  if (GEO_MAP_LINK_RE.test(lower)) add('geolocation', 'vínculo de ubicación');

  // ---- Teléfonos (artefacto parseable) ----
  if (PHONE_E164_RE.test(text)) add('phone', 'número internacional');
  const grouped = PHONE_GROUPED_RE.exec(text);
  if (grouped) add('phone', grouped[0]);

  // ---- Intención de contacto (palabras clave) ----
  const phoneIntent = PHONE_INTENT_RE.test(lower);
  const emailIntent = EMAIL_INTENT_RE.test(lower);
  if (phoneIntent) add('contact_intent', 'referencia a teléfono/contacto');
  if (emailIntent) add('contact_intent', 'referencia a correo');
  if (EXTERNAL_INTENT_RE.test(lower)) add('contact_intent', 'operación fuera de la plataforma');
  if (WHATSAPP_RE.test(lower)) add('whatsapp', 'mención de WhatsApp');
  if (TELEGRAM_RE.test(lower)) add('telegram', 'mención de Telegram');
  if (INSTAGRAM_RE.test(lower)) add('instagram', 'mención de Instagram');
  if (OTHER_SOCIAL_RE.test(lower)) add('other_social', 'mención de red social');

  // ---- Teléfono por corrida de dígitos, sensibilidad según intención ----
  // >= 9 dígitos consecutivos: número de teléfono en cualquier contexto.
  // Con intención de contacto presente, >= 7 ya alcanza (ej. "cel 1234567").
  const maxRun = longestDigitRun(text);
  if (maxRun >= 9) {
    add('phone', `corrida de ${maxRun} dígitos`);
  } else if (maxRun >= 7 && (phoneIntent || emailIntent || categories.has('whatsapp'))) {
    add('phone', `corrida de ${maxRun} dígitos junto a intención de contacto`);
  }

  return {
    blocked: categories.size > 0,
    categories: [...categories],
    samples,
  };
}
