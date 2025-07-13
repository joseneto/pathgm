import { getTranslation, getRollHelpMessage, buildRollMenuMessage } from '../helpers/commandHelpers';
import { rollResult } from '../helpers/rollResult';
import { withPrisma } from '../lib/withPrisma';

interface RollParams {
  names: string[];
  attribute: string;
  modifier: number;
}

/**
 * Parse direct command arguments
 * /roll "Player1,Player2" perception +2
 * /roll "Player1" athletics
 */
function parseDirectArgs(args: string[]): RollParams | null {
  if (args.length < 2) return null;

  const last = args[args.length - 1];
  const secondLast = args[args.length - 2];
  let attribute = '';
  let modifierStr = '0';
  let nameParts: string[] = [];

  if (/^[+-]?\d+$/.test(last)) {
    modifierStr = last;
    attribute = secondLast;
    nameParts = args.slice(0, args.length - 2);
  } else {
    attribute = last;
    nameParts = args.slice(0, args.length - 1);
  }

  const namesRaw = nameParts.join(' ');
  const names = namesRaw
    .split(',')
    .map((n: string) => n.replace(/"/g, '').trim())
    .filter(Boolean);

  const modifier = parseInt(modifierStr, 10);

  return { names, attribute, modifier };
}

/**
 * Execute the roll for specified players
 */
async function executeRoll(ctx: any, params: RollParams, t: any) {
  const { names, attribute, modifier } = params;
  const results: string[] = [];

  for (const name of names) {
    const player = await withPrisma(async (prisma) => {
      return await prisma.player.findFirst({
        where: {
          userId: ctx.user.id,
          OR: [
            {
              name: {
                contains: name,
                mode: 'insensitive',
              },
            },
            {
              alias: {
                contains: name,
                mode: 'insensitive',
              },
            },
          ],
        },
      });
    });

    if (!player) {
      results.push(t('roll_player_not_found', { name }));
      continue;
    }

    rollResult(player, attribute, modifier, results, t);
  }

  await ctx.replyWithMarkdownV2(results.join('\n'));
}

export async function rollCommand(ctx: any) {
  const [t] = getTranslation(ctx);
  const args = ctx.message?.text?.match(/".*?"|[^\s]+/g)?.slice(1) || [];

  // Handle help
  if (args.includes('-h') || args.includes('--help') || args.includes('help')) {
    const helpMessage = getRollHelpMessage(t);
    await ctx.reply(helpMessage, { parse_mode: 'HTML' });
    return;
  }

  // Handle menu
  if (args.includes('-m') || args.includes('--menu') || args.includes('menu') || args.length === 0) {
    const menuMessage = buildRollMenuMessage(t);
    await ctx.reply(menuMessage, { parse_mode: 'HTML' });
    return;
  }

  // Parse and execute direct command
  const params = parseDirectArgs(args);
  if (!params) {
    await ctx.reply(t('roll_invalid_syntax'), { parse_mode: 'HTML' });
    return;
  }

  await executeRoll(ctx, params, t);
}