// apps/server/src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { env } from './env';

const prismaClientSingleton = () =>
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    errorFormat: 'pretty',
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
  });

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma = global.__prisma ?? prismaClientSingleton();

if (env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}
