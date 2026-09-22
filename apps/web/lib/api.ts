/**
 * GWS · Capa de acceso a API (cliente).
 * ------------------------------------------------------------
 * - Endpoints públicos: van directo al backend
 *   (`NEXT_PUBLIC_API_URL` = http://localhost:3001).
 * - Endpoints protegidos/identidad: van a `/api/gateway/*` — el
 *   servidor inyecta la cookie httpOnly y reenvía al backend; el token
 *   NUNCA llega al navegador.
 * - Normalización de errores (CF-01): toda respuesta fallida se reduce a
 *   `GwsApiError { status, code, message, details }`.
 */

import type { GwsErrorBody } from './types';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export class GwsApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: { field: string; message: string }[];

  constructor(status: number, code: string, message: string, details?: { field: string; message: string }[]) {
    super(message);
    this.name = 'GwsApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  get isAuth(): boolean {
    return this.status === 401 || this.code === 'AUTH_REQUIRED';
  }
}

interface RequestOpts {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  /** Vía servidor (gateway) — session httpOnly, token nunca al cliente. */
  viaGateway?: boolean;
  idempotencyKey?: string;
  timeoutMs?: number;
  headers?: Record<string, string>;
}

function normalizeError(body: GwsErrorBody | string | null, status: number): GwsApiError {
  if (body && typeof body === 'object' && 'error' in body) {
    const e = body.error;
    return new GwsApiError(status, e.code ?? 'UNKNOWN', e.message ?? 'Error', e.details);
  }
  if (typeof body === 'string' && body.trim()) {
    return new GwsApiError(status, 'UNKNOWN', body);
  }
  return new GwsApiError(status, 'UNKNOWN', `Error ${status}`);
}

export async function apiRequest<T>(path: string, opts: RequestOpts = {}): Promise<T> {
  const {
    method = 'GET',
    body,
    viaGateway = false,
    idempotencyKey,
    timeoutMs = 15_000,
    headers,
  } = opts;

  // Rutas Next internas (/api/*) son mismo-origen; las de backend van
  // directo a `NEXT_PUBLIC_API_URL`; el resto pasa por el gateway.
  const url = viaGateway
    ? `/api/gateway${path}`
    : path.startsWith('/api/')
      ? path
      : `${API_URL}${path}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  };
  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
    if (idempotencyKey) requestHeaders['Idempotency-Key'] = idempotencyKey;
  }

  try {
    const res = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      cache: 'no-store',
    });

    let parsed: unknown = null;
    const text = await res.text();
    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = text;
      }
    }

    if (!res.ok) {
      throw normalizeError((parsed as GwsErrorBody | string | null) ?? null, res.status);
    }

    // Contratos reales del backend: o body plano o { success, data }.
    if (parsed && typeof parsed === 'object' && 'success' in parsed && 'data' in parsed) {
      return (parsed as { data: T }).data;
    }
    return parsed as T;
  } catch (err) {
    if (err instanceof GwsApiError) throw err;
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new GwsApiError(408, 'TIMEOUT', 'Tiempo de espera agotado');
    }
    throw new GwsApiError(0, 'NETWORK', 'No se pudo conectar con el servidor', err instanceof Error ? [{ field: 'network', message: err.message }] : undefined);
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  get: <T>(path: string, opts?: Omit<RequestOpts, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, body: unknown, opts?: Omit<RequestOpts, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...opts, method: 'POST', body }),
  patch: <T>(path: string, body: unknown, opts?: Omit<RequestOpts, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...opts, method: 'PATCH', body }),
  del: <T>(path: string, opts?: Omit<RequestOpts, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...opts, method: 'DELETE' }),
};