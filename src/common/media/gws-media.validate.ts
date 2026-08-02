/**
 * GWS · Multimedia industrial — resolución y validación
 * ------------------------------------------------------------
 * Normaliza un array de `GwsMediaItem` (lo que carga el autor) a
 * `ResolvedGwsMediaItem` (lo que se persiste y muestra): calcula la URL
 * de embed/iframe reproducible y la URL de origen, valida el host contra
 * el allowlist soberano (nunca canales de contacto/exfiltración, ver
 * §3.6) y aplica límites de cantidad/seguridad.
 *
 * Corren en DOS capas (defensa en profundidad):
 *   1. DTO — `@IsGwsMediaArray()` (class-validator) con mensajes legibles.
 *   2. Service — `resolveGwsMediaItems()` antes de persistir, para que lo
 *      guardado en DB sea SIEMPRE el modelo resuelto (embedUrl calculada),
 *      no un valor crudo del cliente.
 */
import { BadRequestException } from '@nestjs/common';
import {
  GWS_MEDIA_HOSTS,
  GWS_MEDIA_FORBIDDEN_HOSTS,
  GWS_MEDIA_IMAGE_EXTENSIONS,
  GWS_MEDIA_MAX_URL_LENGTH,
  GWS_MEDIA_STREAM_EXTENSIONS,
  MAX_MEDIA_ITEMS,
  MEDIA_TITLE_MAX,
} from './gws-media.const';
import type {
  GwsMediaItem,
  GwsMediaKind,
  ResolvedGwsMediaItem,
} from './gws-media.const';

export type ResolveGwsMediaResult =
  | { ok: true; items: ResolvedGwsMediaItem[] }
  | { ok: false; errors: string[] };

const ALL_KINDS: readonly GwsMediaKind[] = ['youtube', 'youtube_channel', 'vimeo', 'stream', 'iframe'];

function normalizeHost(hostname: string): string {
  let h = hostname.toLowerCase();
  if (h.startsWith('www.')) h = h.slice(4);
  return h;
}

function isForbidden(hostname: string): boolean {
  const h = normalizeHost(hostname);
  return GWS_MEDIA_FORBIDDEN_HOSTS.some(
    (f) => h === f || h.endsWith(`.${f}`),
  );
}

/** `allow` = ['*'] significa "cualquier host que no esté en la lista de
 * bloqueo". Si no, match por sufijo de dominio (youtube.com cubre
 * m.youtube.com, www.youtube.com, etc.). */
function matchesHost(hostname: string, allow: readonly string[]): boolean {
  const h = normalizeHost(hostname);
  if (allow.length === 1 && allow[0] === '*') return true;
  return allow.some((a) => {
    const hh = normalizeHost(a);
    return h === hh || h.endsWith(`.${hh}`);
  });
}

function extractYoutubeId(url: URL): string | null {
  const pathname = url.pathname;
  if (normalizeHost(url.hostname) === 'youtu.be') {
    const first = pathname.slice(1).split('/')[0];
    return first || null;
  }
  const v = url.searchParams.get('v');
  if (v) return v;
  const m = pathname.match(/^\/(?:embed|live|shorts|watch)\/([^/]+)/);
  return m ? m[1] : null;
}

function extractVimeoId(url: URL): string | null {
  const m = url.pathname.match(/^\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

function isYoutubeChannelPath(url: URL): boolean {
  const p = url.pathname;
  return (
    p.startsWith('/@') || p.startsWith('/channel/') || p.startsWith('/c/') || p.startsWith('/user/')
  );
}

function isAllowedMediaExtension(url: URL): boolean {
  const lastSegment = url.pathname.split('/').pop() ?? '';
  const lower = lastSegment.toLowerCase();
  return (GWS_MEDIA_STREAM_EXTENSIONS as readonly string[]).some((ext) => lower.endsWith(`.${ext}`));
}

function hasImageExtension(url: URL): boolean {
  const lastSegment = url.pathname.split('/').pop() ?? '';
  const lower = lastSegment.toLowerCase();
  return (GWS_MEDIA_IMAGE_EXTENSIONS as readonly string[]).some((ext) =>
    lower.endsWith(`.${ext}`),
  );
}

const IPV4_RE = /^\d{1,3}(\.\d{1,3}){3}$/;

/**
 * Endurecimiento E5 — hieregia de URL de medio:
 *   · Solo HTTPS.
 *   · Longitud máxima (anti-abuso).
 *   · Sin backslashes (canonicalización: parser differential, CVE-2025-59837).
 *   · Sin credenciales embebidas (userinfo) — anti-phishing.
 *   · Puerto estándar (80/443) o ninguno — sin puertos exóticos.
 *   · Hostname sin IP literal (ni IPv4 ni IPv6) — higiene de red.
 */
function isPlainHttpsUrl(url: URL): string | null {
  if (url.protocol !== 'https:') return 'solo se admiten URLs HTTPS';
  if (url.href.length > GWS_MEDIA_MAX_URL_LENGTH) {
    return `la URL no puede superar ${GWS_MEDIA_MAX_URL_LENGTH} caracteres`;
  }
  if (url.href.includes('\\')) {
    return 'URL con backslash no permitido (canonicalización de host)';
  }
  if (url.username || url.password) {
    return 'URL con credenciales embebidas no permitida';
  }
  if (url.port !== '' && url.port !== '443' && url.port !== '80') {
    return 'solo se admiten URLs en puertos estándar';
  }
  const host = url.hostname;
  if (host.includes(':')) return 'hostname IPv6 no permitido';
  if (IPV4_RE.test(host)) return 'hostname por IP no permitido (usá un dominio)';
  return null;
}

function fmtIndex(i: number): string {
  return `media[${i}]`;
}

/** Resuelve un item individual. Devuelve el item resuelto o un mensaje de
 * error (null si OK — se controla por errors.length). */
function resolveItem(raw: unknown, i: number): { item?: ResolvedGwsMediaItem; error?: string } {
  const idx = fmtIndex(i);
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return { error: `${idx}: cada item debe ser un objeto` };
  }
  const rec = raw as Record<string, unknown>;

  const kind = rec.kind;
  if (typeof kind !== 'string' || !(ALL_KINDS as readonly string[]).includes(kind)) {
    return { error: `${idx}: kind inválido ("${String(kind)}")` };
  }
  const kindOf = kind as GwsMediaKind;

  if (typeof rec.url !== 'string' || rec.url.length === 0) {
    return { error: `${idx}: falta la URL del medio` };
  }

  let url: URL;
  try {
    url = new URL(rec.url);
  } catch {
    return { error: `${idx}: URL inválida` };
  }
  const hygiene = isPlainHttpsUrl(url);
  if (hygiene) {
    return { error: `${idx}: ${hygiene}` };
  }
  if (isForbidden(url.hostname)) {
    return { error: `${idx}: host bloqueado por soberanía (${url.hostname})` };
  }

  const title =
    rec.title !== undefined && rec.title !== null ? String(rec.title) : undefined;
  if (title !== undefined && (title.length === 0 || title.length > MEDIA_TITLE_MAX)) {
    return { error: `${idx}: title debe tener entre 1 y ${MEDIA_TITLE_MAX} caracteres` };
  }

  const startAt =
    rec.startAt !== undefined && rec.startAt !== null ? Number(rec.startAt) : undefined;
  if (startAt !== undefined && (!Number.isInteger(startAt) || startAt < 0)) {
    return { error: `${idx}: startAt debe ser un entero >= 0` };
  }

  let poster: string | undefined;
  if (rec.poster !== undefined && rec.poster !== null) {
    const p = String(rec.poster);
    try {
      const posterUrl = new URL(p);
      const posterHygiene = isPlainHttpsUrl(posterUrl);
      if (posterHygiene) throw new Error(posterHygiene);
      if (!hasImageExtension(posterUrl)) {
        return {
          error: `${idx}: poster debe ser una URL de imagen (${GWS_MEDIA_IMAGE_EXTENSIONS.join(', ')})`,
        };
      }
      poster = p;
    } catch {
      return {
        error: `${idx}: poster debe ser una URL HTTPS de imagen válida`,
      };
    }
  }

  const base: GwsMediaItem = { kind: kindOf, url: url.href, title, poster, startAt };

  switch (kindOf) {
    case 'youtube': {
      if (!matchesHost(url.hostname, GWS_MEDIA_HOSTS.youtube)) {
        return { error: `${idx}: host no permitido para YouTube (${url.hostname})` };
      }
      const id = extractYoutubeId(url);
      if (!id) {
        return { error: `${idx}: no se pudo extraer un video de YouTube válido de esa URL` };
      }
      const start = startAt !== undefined ? `?start=${startAt}` : '';
      return {
        item: {
          ...base,
          embedUrl: `https://www.youtube-nocookie.com/embed/${id}${start}`,
          externalUrl: `https://www.youtube.com/watch?v=${id}`,
        },
      };
    }
    case 'youtube_channel': {
      if (!matchesHost(url.hostname, GWS_MEDIA_HOSTS.youtube)) {
        return { error: `${idx}: host no permitido para canales de YouTube (${url.hostname})` };
      }
      if (!isYoutubeChannelPath(url)) {
        return { error: `${idx}: debe ser una URL de canal (@handle, /channel/, /c/)` };
      }
      return { item: { ...base, embedUrl: null, externalUrl: url.href } };
    }
    case 'vimeo': {
      if (!matchesHost(url.hostname, GWS_MEDIA_HOSTS.vimeo)) {
        return { error: `${idx}: host no permitido para Vimeo (${url.hostname})` };
      }
      const id = extractVimeoId(url);
      if (!id) {
        return { error: `${idx}: no se pudo extraer un video de Vimeo válido de esa URL` };
      }
      const start = startAt !== undefined ? `#t=${startAt}s` : '';
      return {
        item: {
          ...base,
          embedUrl: `https://player.vimeo.com/video/${id}${start}`,
          externalUrl: `https://vimeo.com/${id}`,
        },
      };
    }
    case 'stream': {
      if (!matchesHost(url.hostname, GWS_MEDIA_HOSTS.stream)) {
        return { error: `${idx}: host no permitido para streaming (${url.hostname})` };
      }
      if (!isAllowedMediaExtension(url)) {
        return {
          error: `${idx}: solo archivos de video directos (${GWS_MEDIA_STREAM_EXTENSIONS.join(', ')})`,
        };
      }
      return { item: { ...base, embedUrl: url.href, externalUrl: url.href } };
    }
    case 'iframe': {
      if (!matchesHost(url.hostname, GWS_MEDIA_HOSTS.iframe)) {
        return { error: `${idx}: host no permitido para iframe (${url.hostname})` };
      }
      return { item: { ...base, embedUrl: url.href, externalUrl: url.href } };
    }
    default:
      return { error: `${idx}: kind no soportado` };
  }
}

export function resolveGwsMediaItems(raw: unknown): ResolveGwsMediaResult {
  if (raw === undefined || raw === null) return { ok: true, items: [] };
  if (!Array.isArray(raw)) {
    return { ok: false, errors: ['media debe ser un array de items multimedia'] };
  }
  if (raw.length > MAX_MEDIA_ITEMS) {
    return { ok: false, errors: [`media no puede exceder ${MAX_MEDIA_ITEMS} items`] };
  }

  const items: ResolvedGwsMediaItem[] = [];
  const errors: string[] = [];
  raw.forEach((entry, i) => {
    const res = resolveItem(entry, i);
    if (res.error) errors.push(res.error);
    else if (res.item) items.push(res.item);
  });

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, items };
}

export function resolveGwsMediaOrThrow(raw: unknown): ResolvedGwsMediaItem[] {
  const res = resolveGwsMediaItems(raw);
  if (res.ok) return res.items;
  const failed = res as { ok: false; errors: string[] };
  throw new BadRequestException(failed.errors.join('; '));
}
