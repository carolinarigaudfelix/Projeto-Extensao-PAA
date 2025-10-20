import prisma from '@/lib/prisma';
import { compare } from 'bcrypt';
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

// Configuração NextAuth v5 beta
export const authConfig: NextAuthConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  pages: { signIn: '/auth/login' },
  providers: [
    Credentials({
      name: 'Credenciais',
      credentials: {
        email: { label: 'Email', type: 'email' },
        senha: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const senha = credentials?.senha as string | undefined;
        if (!email) return null;
        if (!senha) return null;
        const user = await prisma.usuario.findUnique({ where: { email } });
        if (!user?.senhaHash) return null;
        const ok = await compare(senha, user.senhaHash);
        if (!ok) return null;
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
        token.id = (user as any).id;
        token.nome = (user as any).nome;
        token.tipo = (user as any).tipo;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: (token as any).id,
        nome: (token as any).nome,
        tipo: (token as any).tipo,
        email: session.user?.email || (token as any).email || '',
      };
      return session;
    },
  },
};
