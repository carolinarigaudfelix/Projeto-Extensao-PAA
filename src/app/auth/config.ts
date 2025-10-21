import { compare } from 'bcrypt';
import type { NextAuthConfig, User } from 'next-auth';
import { CredentialsSignin } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import Credentials from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';

// Fallback seguro para ambiente de desenvolvimento caso NEXTAUTH_SECRET não esteja definido.
// Em produção, a variável de ambiente DEVE estar presente.
function getAuthSecret(): string {
  if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length > 0) {
    return process.env.NEXTAUTH_SECRET;
  }
  // Gerar secret pseudo-aleatório em dev para evitar MissingSecret.
  // Não persistente entre reinícios, apenas evita crash.
  if (process.env.NODE_ENV !== 'production') {
    const random = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return `dev-${random}`;
  }
  throw new Error(
    'NEXTAUTH_SECRET não definido em produção. Configure no arquivo .env',
  );
}

// Configuração NextAuth v5
export const authConfig: NextAuthConfig = {
  secret: getAuthSecret(),
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      name: 'Credenciais',
      credentials: {
        email: { label: 'Email', type: 'email' },
        senha: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toString();
        const senha = credentials?.senha?.toString();

        if (!(email && senha)) {
          throw new CredentialsSignin('Email e senha são obrigatórios');
        }

        const usuario = await prisma.usuario.findUnique({ where: { email } });

        if (!usuario) {
          // Mensagem explícita para o cliente
          throw new CredentialsSignin(
            'Nenhum usuário encontrado com este email',
          );
        }

        if (!usuario.senhaHash) {
          throw new CredentialsSignin('Usuário sem senha configurada');
        }

        if (!usuario.isActive) {
          throw new CredentialsSignin(
            'Usuário inativo. Entre em contato com o administrador',
          );
        }

        const senhaCorreta = await compare(senha, usuario.senhaHash);

        if (!senhaCorreta) {
          // Mensagem explícita para o cliente
          throw new CredentialsSignin('Email ou senha incorretos');
        }

        return {
          id: usuario.id,
          email: usuario.email,
          nome: usuario.nome,
          tipo: usuario.tipo,
        } satisfies User;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as User & { tipo: string };
        (token as JWT & { id?: string; nome?: string; tipo?: string }).id =
          u.id;
        (token as JWT & { id?: string; nome?: string; tipo?: string }).nome =
          u.nome;
        (token as JWT & { id?: string; nome?: string; tipo?: string }).tipo =
          u.tipo;
      }
      return token;
    },
    async session({ session, token }) {
      const t = token as JWT & { id?: string; nome?: string; tipo?: string };
      const emailFromToken = (token as JWT & { email?: string }).email;
      session.user = {
        ...session.user,
        id: t.id || '',
        nome: t.nome || session.user?.name || '',
        tipo: t.tipo || '',
        email: session.user?.email || emailFromToken || '',
      };
      return session;
    },
  },
};
