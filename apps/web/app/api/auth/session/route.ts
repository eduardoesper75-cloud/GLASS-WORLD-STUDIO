import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/server-session';

export async function GET(req: NextRequest) {
  const user = getSessionUser(req);
  return NextResponse.json({ user });
}