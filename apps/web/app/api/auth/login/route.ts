import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validators';
import type { AuthResponse } from '@/lib/types';
import { bakeSession } from '@/lib/server-session';

export async function POST(req: NextRequest) {
  const raw = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Datos de login inválidos',
          details: parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
        },
      },
      { status: 422 },
    );
  }

  const backend = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const upstream = await fetch(`${backend}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: parsed.data.identifier,
      password: parsed.data.password,
    }),
    cache: 'no-store',
  });

  const body = await upstream.json().catch(() => null);

  if (!upstream.ok) {
    return NextResponse.json(body ?? { error: { code: 'UPSTREAM', message: `Error ${upstream.status}` } }, {
      status: upstream.status,
    });
  }

  const auth = body as AuthResponse;
  const res = bakeSession(auth, NextResponse.json({ user: auth.user }));
  return res;
}