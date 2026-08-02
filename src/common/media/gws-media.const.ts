/**
 * GWS · Multimedia industrial — modelo canónico de medios
 * ------------------------------------------------------------
 * Orden Suprema (UX/Multimedia): los activos de alto valor (máquinas de
 * G5, masterclasses de G1) no se presentan con una foto estática: la
 * vitrina admite video embebido desde repositorios externos (YouTube,
 * Vimeo, CDN propios) SIN fricción de carga en el servidor.
 *
 * SOBERANÍA (CLAUDE.md §3.6): el bloqueo anti-fuga rige el texto libre;
 * `media` es un campo ESTRUCTURADO de exhibición, no una vía de contacto.
 * Aun así, este allowlist es defensa en profundidad: SOLO hosts de
 * exhibición de contenido (video/repositorio) y NUNCA canales de
 * contacto/exfiltración (WhatsApp, Telegram, Instagram, acortadores,
 * correo). El maestro/industrial no puede convertir su vitrina en una
 * vía de salida de la plataforma.
 */

export type GwsMediaKind = 'youtube' | 'youtube_channel' | 'vimeo' | 'stream' | 'iframe';

export interface GwsMediaItem {
  kind: GwsMediaKind;
  /** URL canónica tal como la carga el autor (watch, youtu.be, mp4...). */
  url: string;
  /** Título/rotulo técnico corto (≤120 chars), ej: "Mesa KMT-400 en
   * corte de boro 12mm, 4.200 bar". */
  title?: string;
  /** Poster/portada del visor (URL de imagen HTTPS). */
  poster?: string;
  /** Segundo de inicio (solo youtube/vimeo). */
  startAt?: number;
}

/** URL de embed/iframe ya resuelta y validada por el motor (NO editable
 * por el autor — la calcula gws-media.validate.ts desde la URL canónica).
 * `embedUrl` es null para contenido no embebible (canal de YouTube);
 * `externalUrl` es el destino del botón "Ver en origen". */
export interface ResolvedGwsMediaItem extends GwsMediaItem {
  embedUrl: string | null;
  externalUrl: string | null;
}

export const MAX_MEDIA_ITEMS = 12;
export const MEDIA_TITLE_MAX = 120;

/** Hosts de exhibición de video permitidos por kind (subdominios se
 * normalizan por sufijo). YouTube es el repositorio oficial de
 * sincronización (Orden Suprema); Vimeo/Wistia como alternativas;
 * 'stream' admite archivos de video directos (mp4/webm/mov) en HTTPS
 * desde el CDN propio del industrial — el corte por agua de G5 exige
 * calidad sin transcodificar.
 */
export const GWS_MEDIA_HOSTS: Record<GwsMediaKind, readonly string[]> = {
  youtube: ['youtube.com', 'youtu.be', 'youtube-nocookie.com'],
  youtube_channel: ['youtube.com'],
  vimeo: ['vimeo.com', 'player.vimeo.com', 'live.vimeo.com'],
  stream: ['*'], // cualquier host HTTPS, excepto la lista de bloqueo
  iframe: ['youtube-nocookie.com', 'player.vimeo.com', 'wistia.com', 'wistia.net'],
};

/**
 * EXTENSIONES DE STREAM (endurecimiento E5). SOLO archivos de video directos.
 * `m3u8` se EXCLUYE del streaming de host arbitrario: una playlist HLS es
 * texto manipulable y un vector de contenido no autorizado. mp4/webm/mov son
 * contenedores de video verificables por el navegador.
 */
export const GWS_MEDIA_STREAM_EXTENSIONS = ['mp4', 'webm', 'mov'] as const;

/** Extensiones de IMAGEN para `poster` (endurecimiento E5). */
export const GWS_MEDIA_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'] as const;

/** Longitud máxima de cualquier URL de medio (anti-abuso). */
export const GWS_MEDIA_MAX_URL_LENGTH = 2048;

/** Hosts de contacto/exfiltración — PROHIBIDOS en vitrinas (defensa en
 * profundidad de §3.6: el campo no debe servir de puerta de salida). */
export const GWS_MEDIA_FORBIDDEN_HOSTS = [
  'whatsapp.com',
  'wa.me',
  'wa.link',
  'telegram.org',
  'telegram.me',
  't.me',
  'instagram.com',
  'facebook.com',
  'messenger.com',
  'fb.me',
  'discord.gg',
  'discordapp.com',
  'signal.org',
  'wechat.com',
  'line.me',
  'mailto', // nunca enlaces de correo en una vitrina
  // Redes de contacto modernas (ampliado E5): TikTok, X, Snapchat.
  'tiktok.com',
  'vm.tiktok.com',
  'x.com',
  'twitter.com',
  'snapchat.com',
  // Acortadores de URL: ofuscan el destino real → riesgo de fuga.
  'bit.ly',
  'tinyurl.com',
  'goo.gl',
  't.co',
  'shorturl.at',
  'cutt.ly',
  'is.gd',
  'ow.ly',
] as const;
