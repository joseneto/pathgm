import { Context } from 'telegraf'
import { prisma } from '@pathgm/shared/generated/client'
import { getEffectiveTelegramId } from '../helpers/getEffectiveTelegramId';
import { isGroup } from '../helpers/isGroup';
import { getTranslation } from '../helpers/commandHelpers';

export const startCommand = async (ctx: Context) => {
  const telegramId = getEffectiveTelegramId(ctx);
  const existingUser = await prisma.user.findUnique({ where: { telegramId } })

  if (existingUser) {
    const [t] = getTranslation(ctx);
    const group = isGroup(ctx);
    if (group) {
      await ctx.reply(t('welcome_back_group', { name: existingUser.name! }), { parse_mode: 'HTML' });
    } else {
      await ctx.reply(t('welcome_back', { name: existingUser.name! }), { parse_mode: 'HTML' });
    }
    return
  }

  const group = isGroup(ctx);
  const user = await prisma.user.create({
    data: {
      telegramId,
      name: ctx.from?.first_name || 'Adventure',
      type: group ? 'GROUP' : 'PRIVATE'
    },
  })

  // Initial credits are now handled by the new credit system via CreditBalance
  const [t] = getTranslation(ctx);
  if (group) {
    await ctx.reply(t('welcome_group', { name: user.name! }), { parse_mode: 'HTML' });
  } else {
    await ctx.reply(t('welcome', { name: user.name! }), { parse_mode: 'HTML' });
  }
}
