import { PrismaClient } from '@prisma/client';

declare global {
  // allow global `var` declarations for hot-reloading in dev
  var prisma: PrismaClient | undefined;
}

const client = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') global.prisma = client;

export default client;
