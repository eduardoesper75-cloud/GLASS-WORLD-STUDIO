import type { NextRequest, NextResponse } from 'next/server';
import type { AuthResponse, PublicUser } from '@/lib/types';

/** Sesión de la app: dos cookies sobre la vía del navegador.
 * - gws_access: JWT del backend, httpOnly (inaccesible a JS) → el gateway
 *   lo reenvía como Bearer de servidor a servidor.
 * - gws_user: perfil público en JSON (para los hooks del cliente), NO
 *   httpOnly pero no contiene credenciales. */

export const ACCESS_COOKIE = 'gws_access';
export const USER_COOKIE = 'gws_user';

const MAX_AGE = 60 * 60 * 24 * 7; // 7 días

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

export function bakeSession(auth: AuthResponse, res: NextResponse): NextResponse {
  res.cookies.set(ACCESS_COOKIE, auth.accessToken, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });
  res.cookies.set(USER_COOKIE, encodeURIComponent(JSON.stringify(auth.user)), {
    httpOnly: false,
    secure: isProduction(),
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });
  return res;
}

export function clearSessionCookies(res: NextResponse): NextResponse {
  res.cookies.set(ACCESS_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  res.cookies.set(USER_COOKIE, '', { httpOnly: false, path: '/', maxAge: 0 });
  return res;
}

export function getSessionUser(req: NextRequest): PublicUser | null {
  const raw = req.cookies.get(USER_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as PublicUser;
  } catch {
    return null;
  }
}

export function getAccessToken(req: NextRequest): string | null {
  return req.cookies.get(ACCESS_COOKIE)?.value ?? null;
}