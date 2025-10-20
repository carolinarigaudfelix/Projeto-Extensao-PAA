import { authConfig } from '@/app/auth/config';
import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';

// Em v5 podemos inicializar NextAuth e usar helper auth() para acessar sessão
const { auth } = NextAuth(authConfig);

export async function GET() {
  try {
    const session = await auth();
    return NextResponse.json({ ok: true, session });
  } catch (err) {
    console.error('[AUTH][debug] erro auth()', err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 },
    );
  }
}
