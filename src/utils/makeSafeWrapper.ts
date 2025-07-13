import { getEffectiveUserOrGroup } from '../helpers/getEffectiveUserOrGroup';
import { Telegraf } from 'telegraf';
import { startCommand } from '../commands/start';
import { initDynamicCommands } from '../helpers/initDynamicCommands';
import { getTranslation } from '../helpers/commandHelpers';
import { SessionManager } from './SessionManager';
import { withPrisma } from '../lib/withPrisma';

const allCommands = [
  'start',
  'd20',
  'roll',
  'rollall',
  'newplayer',
  'editplayer',
  'importplayer',
  'syncplayers',
  'listplayers',
  'menu',
  'help',
  'about',
];

export function makeSafeWrapper(bot: Telegraf<any>) {
  return function safeWrapper(handler: (_ctx: any) => Promise<void | boolean>) {
    return async (ctx: any) => {
      try {
        ctx.session ??= {};
        if (ctx.callbackQuery?.data) {
          SessionManager.captureButtonData(ctx);
        }
        if (ctx.message) {
          SessionManager.captureMessage(ctx);
        }
        await checkMigrateChat(ctx);
        const [t] = getTranslation(ctx);
        const isActionOrCallback = SessionManager.isExpecting(ctx, 'callback') || SessionManager.isExpecting(ctx, 'text') || ctx.session.paginationEnabled;

        const fullCommand = ctx.message?.text?.split(' ')[0] ?? '';
        const command = fullCommand.startsWith('/') ? fullCommand.slice(1).split('@')[0] : '';

        if ((!isActionOrCallback && fullCommand === '/') || command === 'start') {
          await startCommand(ctx);
          await initDynamicCommands(bot, ctx);
          return;
        }
        if (!isActionOrCallback && !allCommands.includes(command)) {
          console.log(`Not a bot command: ${command}`);
          return;
        }
        ctx.user = await getEffectiveUserOrGroup(ctx);

        if (!ctx.user && command !== 'start') {
          await ctx.reply(t('user_not_found'), { parse_mode: 'HTML' });
          return false;
        }

        return await handler(ctx);
      } catch (err: any) {
        const commandText = ctx.message?.text || '';

        const isForbidden =
          err?.response?.error_code === 403 ||
          err?.description?.toLowerCase()?.includes('forbidden') ||
          err?.description?.toLowerCase()?.includes('bot was kicked');

        console.error(`❌ Error in command: ${commandText}`, err);

        if (!isForbidden) {
          try {
            await ctx.reply('❌ Something went wrong. Try again later.');
          } catch (replyErr) {
            console.error('⚠️ Failed to send error reply:', replyErr);
          }
        } else {
          console.warn(`⚠️ Cannot reply to chat (${ctx.chat?.id}) due to forbidden error.`);
        }
        return false;
      }
    };
  };
}

const checkMigrateChat = async (ctx: any) => {
  const oldChatId = ctx.message?.chat?.id;
  const newChatId = ctx.message?.migrate_to_chat_id;

  if (!oldChatId || !newChatId || oldChatId === newChatId) return;

  await withPrisma(async (prisma) => {
    return await prisma.user.updateMany({
      where: { telegramId: oldChatId.toString() },
      data: { telegramId: newChatId.toString() },
    });
  });
};

