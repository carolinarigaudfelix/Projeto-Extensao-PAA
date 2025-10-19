import type { TokenPayload } from '@/types/auth';
import type { TipoUsuario } from '@prisma/client';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

// Simple guard that reads the NextAuth JWT from the request and verifies role
export async function requireAuth(
  req: NextRequest,
  allowedRoles?: TipoUsuario[] | undefined,
) {
  // read token from request
  const token = (await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })) as TokenPayload | null;

  if (!token) return new Response('Não autorizado', { status: 401 });

  // if allowedRoles provided and non-empty, check membership
  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    if (!allowedRoles.includes(token.tipo as TipoUsuario)) {
      return new Response('Acesso negado', { status: 403 });
    }
  }

  return token;
}
