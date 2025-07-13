import { Markup } from 'telegraf';
import { getTranslation, getClearDataHelpMessage, buildClearDataMenuMessage } from '../helpers/commandHelpers';
import { handleClearData } from '../handlers/handleClearData';
import { SessionManager } from '../utils/SessionManager';
import { withPrisma } from '../lib/withPrisma';

/**
 * Parse direct command arguments
 * /cleardata all for group or private channel
 */
function parseDirectArgs(args: string[]): string[] | null {
  if (args.length === 0) return null;
  const validEntities = ['players'];
  const input = args.join(' ').toLowerCase();

  if (input === 'all') {
    return validEntities;
  }

  // Parse comma-separated list
  const entities = input.split(',').map(e => e.trim());
  const filteredEntities = entities.filter(e => validEntities.includes(e));
  return filteredEntities.length > 0 ? filteredEntities : null;
}

/**
 * Execute clear data operation
 */
async function executeClearData(ctx: any, t: any) {
  const results: Record<string, number> = {};

  try {
    const count = await withPrisma(async (prisma) => {
      const result = await prisma.player.deleteMany({ where: { userId: ctx.user.id } });
      return result.count;
    });

    results.players = count;

    const summary = Object.entries(results)
      .filter(([, count]) => count > 0)
      .map(([entity, count]) => `${count} ${t(entity)}`)
      .join(', ');

    if (summary) {
      await ctx.reply(t('cleardata_success_summary', { summary }), { parse_mode: 'HTML' });
    } else {
      await ctx.reply(t('cleardata_no_data'), { parse_mode: 'HTML' });
    }
  } catch (error) {
    await ctx.reply(t('cleardata_error'), { parse_mode: 'HTML' });
  }
}

export async function clearDataCommand(ctx: any) {
  const [t] = getTranslation(ctx);

  // Parse arguments
  const args = ctx.message?.text?.split(' ').slice(1) || [];

  // Check for help
  if (args.includes('help') || args.includes('--help') || args.includes('-h')) {
    return await showClearDataHelp(ctx, t);
  }

  // Try to parse direct command arguments
  const directEntities = parseDirectArgs(args);
  if (directEntities) {
    // Execute directly if entities are provided
    return await executeClearData(ctx, t);
  }

  // Otherwise show menu
  await showClearDataMenu(ctx, t);
}

async function showClearDataHelp(ctx: any, t: any) {
  const helpMessage = getClearDataHelpMessage(t);
  await ctx.reply(helpMessage, { parse_mode: 'HTML' });
}

async function showClearDataMenu(ctx: any, t: any) {
  const message = buildClearDataMenuMessage(t);

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback(t('clear_players'), 'clear_players')],
  ]);

  const sent = await ctx.reply(message, {
    parse_mode: 'HTML',
    reply_markup: keyboard.reply_markup
  });

  SessionManager.initCommand(ctx, {
    stepId: 'cleardata_menu',
    inputType: 'callback',
    lastMessageId: sent.message_id,
    params: {},
    handler: handleClearData
  });
}

export { executeClearData };