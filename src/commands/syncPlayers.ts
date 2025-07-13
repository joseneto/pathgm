import fetch from 'node-fetch';
import { getTranslation } from '../helpers/commandHelpers';
import { parsePathbuilderCharacter } from '../helpers/parsePathbuilderCharacter';
import { Markup } from 'telegraf';
import { handleSyncPlayersInput } from '../handlers/text/handleSyncPlayersInput';
import { SessionManager } from 'src/utils/SessionManager';
import { withPrisma } from '../lib/withPrisma';

async function executeSyncPlayers(ctx: any, t: any) {
  const players = await withPrisma(async (prisma) => {
    return await prisma.player.findMany({
      where: {
        userId: ctx.user.id,
        pathbuilderId: { not: undefined },
      },
    });
  });

  if (players.length === 0) {
    await ctx.reply(t('updateplayers_none_found'), { parse_mode: 'HTML' });
    return;
  }

  await ctx.reply(t('sync_players_progress', { count: players.length }), { parse_mode: 'HTML' });

  const updated: string[] = [];

  for (const player of players) {
    try {
      const response = await fetch(`https://pathbuilder2e.com/json.php?id=${player.pathbuilderId}`);
      if (!response.ok) throw new Error('Invalid Pathbuilder response');

      const json = await response.json();
      const parsed = parsePathbuilderCharacter(json, player.pathbuilderId!);

      if (!parsed || !parsed.name || !parsed.skills) {
        updated.push(`❌ ${player.name} — ${t('sync_failed_invalid_data')}`);
        continue;
      }

      await withPrisma(async (prisma) => {
        return await prisma.player.update({
          where: { id: player.id },
          data: {
            ...parsed,
          },
        });
      });

      updated.push(`✅ ${parsed.name} (${parsed.className} ${parsed.level})`);

    } catch {
      updated.push(`❌ ${player.name} — ${t('sync_failed_connection')}`);
    }
  }

  await ctx.reply(updated.join('\n'), { parse_mode: 'HTML' });
}

export async function syncPlayersCommand(ctx: any) {
  const [t] = getTranslation(ctx);

  // Parse arguments
  const args = ctx.message?.text?.split(' ').slice(1) || [];

  // Check for direct execution (any argument will trigger sync)
  if (args.length > 0) {
    return await executeSyncPlayers(ctx, t);
  }

  // Otherwise show menu
  await showSyncPlayersMenu(ctx, t);
}

async function showSyncPlayersMenu(ctx: any, t: any) {
  const message = t('sync_players_menu_message');

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback(t('sync_players_start_button'), 'sync_players_start')],
  ]);

  const sent = await ctx.reply(message, {
    parse_mode: 'HTML',
    reply_markup: keyboard.reply_markup,
  });

  SessionManager.initCommand(ctx, {
    stepId: 'sync_players_menu',
    inputType: 'callback',
    lastMessageId: sent.message_id,
    params: {},
    handler: handleSyncPlayersInput,
  });
}

export { executeSyncPlayers };
