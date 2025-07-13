import { getTranslation, getRollAllHelpMessage, buildRollAllMenuMessage } from '../helpers/commandHelpers';
import { rollResult } from '../helpers/rollResult';
import { withPrisma } from '../lib/withPrisma';

interface RollAllParams {
  attribute: string;
  modifier: number;
}

/**
 * Parse direct command arguments
 * /rollall perception +2
 * /rollall athletics
 */
function parseDirectArgs(args: string[]): RollAllParams | null {
  if (args.length < 1) return null;

  const attribute = args[0];
  const modifier = parseInt(args[1] ?? '0', 10);

  return { attribute, modifier };
}


async function executeRollAll(ctx: any, params: RollAllParams, t: any) {
  const { attribute, modifier } = params;

  const players = await withPrisma(async (prisma) => {
    return await prisma.player.findMany({ where: { userId: ctx.user.id } });
  });
  
  if (players.length === 0) {
    await ctx.reply(t('listplayers_empty'), { parse_mode: 'HTML' });
    return;
  }

  const results: string[] = [];

  for (const player of players) {
    rollResult(player, attribute, modifier, results, t);
  }

  await ctx.replyWithMarkdownV2(results.join('\n'));
}

export async function rollAllCommand(ctx: any) {
  const [t] = getTranslation(ctx);
  const args = ctx.message?.text?.split(' ').slice(1) || [];

  // Handle help
  if (args.includes('-h') || args.includes('--help') || args.includes('help')) {
    const helpMessage = getRollAllHelpMessage(t);
    await ctx.reply(helpMessage, { parse_mode: 'HTML' });
    return;
  }

  // Handle menu
  if (args.includes('-m') || args.includes('--menu') || args.includes('menu') || args.length === 0) {
    const menuMessage = buildRollAllMenuMessage(t);
    await ctx.reply(menuMessage, { parse_mode: 'HTML' });
    return;
  }

  // Parse and execute direct command
  const params = parseDirectArgs(args);
  if (!params) {
    await ctx.reply(t('rollall_invalid_syntax'), { parse_mode: 'HTML' });
    return;
  }

  await executeRollAll(ctx, params, t);
}