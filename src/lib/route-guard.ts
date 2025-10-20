import type { TokenPayload } from '@/types/auth';
import type { TipoUsuario } from '@prisma/client';
import { getToken } from 'next-auth/jwt';
import { useSession } from 'next-auth/react';
import type { NextRequest } from 'next/server';

function resolveSecret(): string | undefined {
  const s = process.env.NEXTAUTH_SECRET;
  if (s && s.length > 0) return s;
  if (process.env.NODE_ENV !== 'production') return 'dev-route-guard';
  return undefined;
}

// Server-side guard for API routes / middleware usage
export async function requireAuth(
  req: NextRequest,
  allowedRoles?: readonly TipoUsuario[] | undefined,
) {
  const secret = resolveSecret();
  if (!secret) return new Response('Configuração inválida', { status: 500 });
  const token = (await getToken({ req, secret })) as TokenPayload | null;
  if (!token) return new Response('Não autorizado', { status: 401 });
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(token.tipo as TipoUsuario)) {
      return new Response('Acesso negado', { status: 403 });
    }
  }
  return token;
}

// Client-side hook to simplify role checks in React components
export function useRoleGuard(roles?: readonly TipoUsuario[]) {
  const { data: session, status } = useSession();
  const user = session?.user;
  const isLoading = status === 'loading';
  const isAuthenticated = !!user;
  const hasRole =
    roles && roles.length > 0
      ? roles.includes(user?.tipo as TipoUsuario)
      : true;
  return { isLoading, isAuthenticated, hasRole, user };
}
