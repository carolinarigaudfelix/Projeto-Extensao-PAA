import { type NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { TokenPayload } from '@/types/auth';

function resolveSecret(): string | undefined {
  const s = process.env.NEXTAUTH_SECRET;
  if (s && s.length > 0) return s;
  if (process.env.NODE_ENV !== 'production') return 'dev-middleware-secret';
  return undefined; // produção sem secret -> permitir que getToken falhe e resposta clara abaixo
}

const ALLOWED_ALUNOS_ROLES = ['ADMIN', 'COORDENADOR', 'PROFESSOR', 'PEDAGOGO'];

export async function middleware(req: NextRequest) {
  const secret = resolveSecret();
  if (!secret) {
    return new NextResponse(
      'Configuração inválida: defina NEXTAUTH_SECRET em produção.',
      { status: 500 },
    );
  }
  const token = await getToken({ req, secret });
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
    const login = new URL('/login', req.url);
    login.searchParams.set('from', path);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/alunos/:path*', '/dashboard/:path*'],
};
