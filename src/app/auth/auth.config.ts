import prisma from '@/lib/prisma';
import type { TipoUsuario } from '@prisma/client';
import { compare } from 'bcrypt';
import type { NextAuthConfig, Session, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
    async jwt({ token, user }: { token: JWT; user: User | null }) {
      if (user) {
        token.id = user.id;
        token.tipo = user.tipo;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.tipo = token.tipo as TipoUsuario;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), senha: z.string().min(6) })
          .safeParse(credentials);

        if (!parsedCredentials.success) return null;

        const { email, senha } = parsedCredentials.data;
        const user = await prisma.usuario.findUnique({
          where: { email },
        });

        if (!user) return null;

        const passwordsMatch = await compare(senha, user.senhaHash);
        if (!passwordsMatch) return null;

        return {
          id: user.id,
          email: user.email,
          nome: user.nome,
          tipo: user.tipo,
        };
      },
    }),
  ],
} satisfies NextAuthConfig;
