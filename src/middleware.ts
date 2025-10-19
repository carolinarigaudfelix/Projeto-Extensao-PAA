import type { TokenPayload } from '@/types/auth';
import { getToken } from 'next-auth/jwt';
import { type NextRequest, NextResponse } from 'next/server';

const ALLOWED_ALUNOS_ROLES = ['ADMIN', 'COORDENADOR', 'PROFESSOR', 'PEDAGOGO'];

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const path = req.nextUrl.pathname;

  // proteger API de alunos
  if (path.startsWith('/api/alunos')) {
    if (!token) return new NextResponse('Não autorizado', { status: 401 });
    const t = token as unknown as TokenPayload & Record<string, unknown>;
    if (!ALLOWED_ALUNOS_ROLES.includes(t.tipo)) {
      return new NextResponse('Acesso negado', { status: 403 });
    }
  }

  // proteger dashboard inteiro: deve haver token
  if (path.startsWith('/dashboard') && !token) {
    const login = new URL('/auth/login', req.url);
    login.searchParams.set('from', path);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/alunos/:path*', '/dashboard/:path*'],
};
