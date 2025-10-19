import prisma from '@/lib/prisma';
import type { TokenPayload } from '@/types/auth';
import { compare } from 'bcrypt';
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

// credentials shape handled inline

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/auth/login',
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        senha: { label: 'Senha', type: 'password' },
      },
      async authorize(
        credentials: Partial<Record<'email' | 'senha', unknown>> | undefined,
      ) {
        const email =
          typeof credentials?.email === 'string'
            ? credentials.email
            : undefined;
        const senha =
          typeof credentials?.senha === 'string'
            ? credentials.senha
            : undefined;
        if (!(email && senha)) return null;

        const whereClause: { email: string } = { email: String(email) };
        const user = await prisma.usuario.findUnique({ where: whereClause });
        if (!user?.senhaHash) return null;

        if (typeof senha !== 'string') return null;
        const senhaCorreta = await compare(senha, user.senhaHash);
        if (!senhaCorreta) return null;

        return {
          id: user.id,
          email: user.email,
          nome: user.nome,
          tipo: user.tipo,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const t = token as unknown as TokenPayload & Record<string, unknown>;
        t.id = user.id;
        t.nome = user.nome;
        t.tipo = user.tipo;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = session.user ?? {};
        const t = token as unknown as TokenPayload & Record<string, unknown>;
        session.user.id = t.id as string;
        session.user.nome = t.nome as string;
        session.user.tipo = t.tipo as string;
      }
      return session;
    },
  },
};
