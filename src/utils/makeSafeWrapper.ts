import { sendLocalizedMessage } from "../apis/telegram";
import { getEffectiveUserOrGroup } from "../helpers/getEffectiveUserOrGroup";
import { isGroup } from "../helpers/isGroup";
import { prisma } from '@pathgm/shared/generated/client';
import { Telegraf } from "telegraf";
import { startCommand } from "../commands/start";
import { initDynamicCommands } from "../helpers/initDynamicCommands";
import { SessionManager } from "./SessionManager";

const allowedInGroups = [
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

const allCommands = [
  ...allowedInGroups,
  'gennpc',
  'gencontextual',
  'genregion',
  'genplace',
  'genplot',
  'genencounter',
  'genitem',
  'genplayer',
  'addnote',
  'listnotes',
  'listnpcs',
  'listplots',
  'listregions',
  'listplaces',
  'listencounters',
  'listitems',
  'credits',
  'plans',
  'history',
  'askrule',
  'narrate'
];

// safeWrapper.ts
export function makeSafeWrapper(bot: Telegraf<any>) {
  return function safeWrapper(handler: (ctx: any) => Promise<void | boolean>) {
    return async (ctx: any) => {
      try {
        ctx.session ??= {};
        if (ctx.callbackQuery?.data) {
          SessionManager.captureButtonData(ctx);
        }
        if (ctx.message) {
          SessionManager.captureMessage(ctx);
        }
        await check_migrate_chat(ctx);

        const isActionOrCallback = SessionManager.isExpecting(ctx, 'callback') || SessionManager.isExpecting(ctx, 'text') || ctx.session.paginationEnabled;

        const fullCommand = ctx.message?.text?.split(' ')[0] ?? '';
        const command = fullCommand.startsWith('/') ? fullCommand.slice(1).split('@')[0] : '';

        if ((!isActionOrCallback && fullCommand === '/') || command === 'start') {
          await startCommand(ctx)
          await initDynamicCommands(bot, ctx);
          return;
        }
        if (!isActionOrCallback && !allCommands.includes(command)) {
          console.log(`Comando não faz parte do bot: ${command}`)
          //Comando nao é do bot, retornar sem falar nada
          return;
        }
        if (!isActionOrCallback && isGroup(ctx) && !allowedInGroups.includes(command)) {
          await sendLocalizedMessage(ctx, 'command_group_blocked', { command });
          return;
        }

        ctx.user = await getEffectiveUserOrGroup(ctx);

        if (!ctx.user && command !== 'start') {
          await sendLocalizedMessage(ctx, 'user_not_found');
          return false;
        }

        // NOTE: Credit validation moved to withThinkingMessage for better security
        // Commands that require credits should use withThinkingMessage wrapper

        return await handler(ctx);
      } catch (err: any) {
        const commandText = ctx.message?.text || '';

        // Identifica se é erro de permissão
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

const check_migrate_chat = async (ctx: any) => {
  const oldChatId = ctx.message?.chat?.id;
  const newChatId = ctx.message?.migrate_to_chat_id;

  if (!oldChatId || !newChatId || oldChatId === newChatId) return;

  console.log(`🔄 Grupo migrado: ${oldChatId} → ${newChatId}`);

  const result = await prisma.user.updateMany({
    where: { telegramId: oldChatId.toString() },
    data: { telegramId: newChatId.toString() },
  });

  console.log(`✅ ${result.count} registros atualizados para o novo chatId`);
};


