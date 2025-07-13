import { prisma } from '@pathgm/shared/generated/client';
import type { User } from '@prisma/client';
import { getEffectiveTelegramId } from './getEffectiveTelegramId';

export async function getEffectiveUserOrGroup(ctx: any): Promise<User | null> {
  const id = getEffectiveTelegramId(ctx);

  if (!id) return null;

  return await prisma.user.findUnique({
    where: { telegramId: id },
  });
}

