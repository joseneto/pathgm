import { User } from 'generated/client';
import { getEffectiveTelegramId } from './getEffectiveTelegramId';
import { withPrisma } from '../lib/withPrisma';

export async function getEffectiveUserOrGroup(ctx: any): Promise<User | null> {
  const id = getEffectiveTelegramId(ctx);

  if (!id) return null;

  return await withPrisma(async (prisma) => {
    return await prisma.user.findUnique({
      where: { telegramId: id },
    });
  });
}

