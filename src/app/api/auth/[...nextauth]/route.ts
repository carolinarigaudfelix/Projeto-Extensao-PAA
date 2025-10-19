import { authConfig } from '@/app/auth/config';
import NextAuth from 'next-auth';

// NextAuth returns route handlers when called with a config in App Router
// Cast to `any` to satisfy the App Router's strict handler type check here.
const handler = NextAuth(authConfig) as any;

export { handler as GET, handler as POST };
