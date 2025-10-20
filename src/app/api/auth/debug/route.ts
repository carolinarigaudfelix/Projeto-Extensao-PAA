import { authConfig } from '@/app/auth/config';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';

// Reutiliza a config para obter sessão manualmente
export async function GET() {
  try {
    const session = await getServerSession(authConfig);
    return NextResponse.json({ ok: true, session });
  } catch (err) {
    console.error('[AUTH][debug] erro getServerSession', err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 },
    );
  }
}
