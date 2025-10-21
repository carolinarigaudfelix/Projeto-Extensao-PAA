import NextAuth from 'next-auth';
import { authConfig } from '@/app/auth/config';

// Em v5 NextAuth retorna um objeto com handlers
const { handlers } = NextAuth(authConfig);
export const { GET, POST } = handlers;
