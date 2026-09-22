import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/server-session';

/** EnforceableGateway — proxy server-side de /api/gateway/:path hacia el
 * backend. El token nunca viaja al navegador; la cookie httpOnly vive en
 * el servidor. Reenvía Idempotency-Key y normaliza el error (CF-01). */

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const HANDLED = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'] as const;

async function handle(req: NextRequest, method: (typeof HANDLED)[number]) {
  const token = getAccessToken(req);
  if (!token) {
    return NextResponse.json(
      { error: { code: 'AUTH_REQUIRED', message: 'Sesión no iniciada' } },
      { status: 401 },
    );
  }

  const path = req.nextUrl.pathname.replace(/^\/api\/gateway/, '') || '/';
  const target = `${BACKEND}${path}${req.nextUrl.search}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  };
  const ik = req.headers.get('Idempotency-Key');
  if (ik) headers['Idempotency-Key'] = ik;

  const body = req.body ? await req.text().catch(() => undefined) : undefined;
  if (body) headers['Content-Type'] = 'application/json';

  const upstream = await fetch(target, {
    method,
    headers,
    body,
    cache: 'no-store',
  });

  const text = await upstream.text();
  return new NextResponse(text || null, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'application/json',
    },
  });
}

export const GET = (req: NextRequest) => handle(req, 'GET');
export const POST = (req: NextRequest) => handle(req, 'POST');
export const PATCH = (req: NextRequest) => handle(req, 'PATCH');
export const PUT = (req: NextRequest) => handle(req, 'PUT');
export const DELETE = (req: NextRequest) => handle(req, 'DELETE');