import { Context } from 'telegraf';
import { withPrisma } from '../lib/withPrisma';
import { getEffectiveTelegramId } from '../helpers/getEffectiveTelegramId';

export async function admstatsCommand(ctx: Context) {
  const adminTelegramId = process.env.ADMIN_TELEGRAM_ID;
  const userId = getEffectiveTelegramId(ctx);

  if (!adminTelegramId || userId !== adminTelegramId) {
    console.log('Not admin user');
    return;
  }

  const [userCount, playerCount] = await withPrisma(async (prisma) => {
    return await Promise.all([
      prisma.user.count(),
      prisma.player.count(),
    ]);
  });

  await ctx.reply(`Admin Stats:\n\nTotal Users: ${userCount}\nTotal Players: ${playerCount}`);
}
