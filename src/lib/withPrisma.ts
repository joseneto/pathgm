import type { PrismaClient } from '../../generated/client';

let cachedPrisma: PrismaClient | undefined;

async function getPrisma(): Promise<PrismaClient> {
  if (!cachedPrisma) {
    const { PrismaClient } = await import('../../generated/client');
    cachedPrisma = new PrismaClient();
  }
  return cachedPrisma;
}

export async function withPrisma<T>(fn: (_prisma: PrismaClient) => Promise<T>): Promise<T> {
  const prisma = await getPrisma();
  return fn(prisma);
}
