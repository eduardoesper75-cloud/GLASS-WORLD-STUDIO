// =====================================================================
// Baja de suscripciones: `List-Unsubscribe` / RFC 8058
// ---------------------------------------------------------------------
// Funciones puras de parseo (testeables sin red) + resolución de la
// estrategia de baja a partir de las cabeceras.
// =====================================================================

import type { MessageHeader, UnsubscribeMethod, UnsubscribeTarget } from './types.js';

export interface RawListUnsubscribeHeaders {
  listUnsubscribe?: string;
  listUnsubscribePost?: string;
}

/**
 * Extrae `List-Unsubscribe` y `List-Unsubscribe-Post` de un bloque de
 * cabeceras RFC 5322 en crudo (Buffer de imapflow). Despliega las líneas
 * continuadas antes de buscar.
 */
export function parseListUnsubscribeHeaders(
  raw: Buffer | string | undefined,
): RawListUnsubscribeHeaders {
  if (raw === undefined || raw === null) return {};
  const text = typeof raw === 'string' ? raw : raw.toString('utf8');
  if (text.length === 0) return {};

  const unfolded = text.replace(/\r?\n[ \t]+/g, ' ');
  const result: RawListUnsubscribeHeaders = {};
  for (const line of unfolded.split(/\r?\n/)) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const name = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();
    if (name === 'list-unsubscribe' && result.listUnsubscribe === undefined) {
      result.listUnsubscribe = value;
    } else if (name === 'list-unsubscribe-post' && result.listUnsubscribePost === undefined) {
      result.listUnsubscribePost = value;
    }
  }
  return result;
}

export interface ParsedListUnsubscribe {
  mailto: string[];
  https: string[];
}

/**
 * Separa los destinos de `List-Unsubscribe` en `mailto:` y URLs http(s).
 * Acepta la forma estándar `<a>, <b>` y, como tolerancia, valores sin
 * ángulos separados por comas.
 */
export function parseListUnsubscribeValue(value: string): ParsedListUnsubscribe {
  const entries: string[] = [];
  const angled = value.match(/<([^>]+)>/g);
  if (angled && angled.length > 0) {
    for (const item of angled) entries.push(item.slice(1, -1).trim());
  } else {
    for (const item of value.split(',')) entries.push(item.trim());
  }

  const mailto: string[] = [];
  const https: string[] = [];
  for (const entry of entries) {
    if (entry.length === 0) continue;
    const lower = entry.toLowerCase();
    if (lower.startsWith('mailto:')) mailto.push(entry);
    else if (lower.startsWith('http:') || lower.startsWith('https:')) https.push(entry);
  }
  return { mailto, https };
}

/** `true` si `List-Unsubscribe-Post` habilita la baja en un clic (RFC 8058). */
export function isOneClick(post: string | undefined): boolean {
  return typeof post === 'string' && /list-unsubscribe\s*=\s*one-click/i.test(post);
}

/** Elige el mejor mensaje de muestra del remitente para leer sus cabeceras. */
function bestMessage(messages: readonly MessageHeader[]): MessageHeader | undefined {
  return messages.find((message) => message.listUnsubscribe !== undefined) ?? messages[0];
}

/**
 * Resuelve la estrategia de baja para un remitente:
 *   1. `List-Unsubscribe-Post: List-Unsubscribe=One-Click` + URL  → POST RFC 8058
 *   2. `mailto:`                                                 → correo de baja
 *   3. URL sin soporte de un clic                                → enlace manual
 */
export function resolveUnsubscribeTarget(
  domain: string,
  address: string,
  messages: readonly MessageHeader[],
): UnsubscribeTarget {
  const sample = bestMessage(messages);
  const raw = sample?.listUnsubscribe;
  if (raw === undefined) {
    return { domain, address, method: 'manual' };
  }

  const parsed = parseListUnsubscribeValue(raw);
  const oneClick = isOneClick(sample?.listUnsubscribePost);
  const https = parsed.https[0];
  const mailto = parsed.mailto[0];

  let method: UnsubscribeMethod = 'manual';
  let endpoint: string | undefined;
  if (oneClick && https !== undefined) {
    method = 'one-click';
    endpoint = https;
  } else if (mailto !== undefined) {
    method = 'mailto';
    endpoint = mailto;
  } else if (https !== undefined) {
    method = 'manual';
    endpoint = https;
  }

  return {
    domain,
    address,
    method,
    ...(endpoint !== undefined ? { endpoint } : {}),
    ...(https !== undefined ? { manualLink: https } : {}),
  };
}

/** Extrae la dirección y el subject opcional de una URI `mailto:`. */
export function parseMailto(uri: string): { to: string; subject?: string } {
  const withoutScheme = uri.replace(/^mailto:/i, '');
  const queryIndex = withoutScheme.indexOf('?');
  const to = (queryIndex === -1 ? withoutScheme : withoutScheme.slice(0, queryIndex)).trim();
  const subjectRaw = queryIndex === -1 ? '' : withoutScheme.slice(queryIndex + 1);
  if (!subjectRaw) return { to };
  const params = new URLSearchParams(subjectRaw);
  const subject = params.get('subject');
  return subject ? { to, subject } : { to };
}
