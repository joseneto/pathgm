import { formatPlayerHtml } from '../utils/htmlOutputFormat';
import { getTranslation, getNewPlayerHelpMessage, buildNewPlayerMenuMessage } from '../helpers/commandHelpers';
import { Markup } from 'telegraf';
import { handleNewPlayerInput } from '../handlers/text/handleNewPlayerInput';
import { actionButtons } from '../helpers/actionButtons';
import { parseAttributeUpdates, validatePlayerUpdates, createDefaultSkills, PlayerAttributeUpdates } from '../helpers/playerAttributeParser';
import { withPrisma } from '../lib/withPrisma';
import { SessionManager } from '../utils/SessionManager';

interface NewPlayerParams {
  name?: string;
  className?: string;
  level?: number;
  attributes?: PlayerAttributeUpdates;
}

/**
 * Parse direct command arguments
 * /newplayer "Rurik" fighter 5 perception=12 athletics=15
 * /newplayer "Lyra" wizard 3 level=5 fortitude=8
 */
function parseDirectArgs(args: string[]): NewPlayerParams | null {
  if (args.length < 3) return null;

  const [name, className, levelRaw, ...attributeArgs] = args;
  const level = parseInt(levelRaw, 10);

  if (isNaN(level) || level < 1 || level > 20) {
    return null;
  }

  // Parse additional attributes if provided
  const attributes = attributeArgs.length > 0 ? parseAttributeUpdates(attributeArgs) : undefined;
  return { name, className, level, attributes };
}

/**
 * Execute the player creation
 */
async function executeNewPlayer(ctx: any, params: NewPlayerParams, t: any) {
  const { name, className, level, attributes } = params;

  if (!name || !className || !level) {
    await ctx.reply(t('createplayer_usage_error'), { parse_mode: 'HTML' });
    return;
  }

  // Start with default values
  let playerData = {
    name,
    alias: name,
    className,
    level,
    perception: 0,
    fortitude: 0,
    reflex: 0,
    will: 0,
    skills: createDefaultSkills()
  };

  // Apply additional attributes if provided
  if (attributes && Object.keys(attributes).length > 0) {
    const validation = validatePlayerUpdates(attributes, t, playerData.skills);

    if (!validation.isValid) {
      await ctx.reply(validation.errorMessage!, { parse_mode: 'HTML' });
      return;
    }

    const validatedUpdates = validation.validatedUpdates!;

    // Apply validated updates to player data
    Object.assign(playerData, validatedUpdates);
  }

  try {
    const player = await withPrisma(async (prisma) => {
      return await prisma.player.create({
        data: {
          userId: ctx.user.id,
          ...playerData
        }
      });
    });

    // Create action buttons for the new player (without narration)
    const ab = actionButtons(player, 'player', t, false);
    const message = formatPlayerHtml(player as any, t);

    await ctx.reply(message, {
      parse_mode: 'HTML',
      reply_markup: ab.reply_markup
    });
  } catch (error) {
    await ctx.reply(t('createplayer_error'), { parse_mode: 'HTML' });
  }
}

export const newPlayerCommand = async (ctx: any) => {
  const [t] = getTranslation(ctx);

  // Parse arguments
  const args = ctx.message?.text?.split(' ').slice(1) || [];

  // Check for help
  if (args.includes('help') || args.includes('--help') || args.includes('-h')) {
    return await showNewPlayerHelp(ctx, t);
  }

  // Try to parse direct command arguments
  const directParams = parseDirectArgs(args);
  if (directParams) {
    // Execute directly if all params are provided
    return await executeNewPlayer(ctx, directParams, t);
  }

  // Otherwise show menu
  await showNewPlayerMenu(ctx, t);
};

async function showNewPlayerHelp(ctx: any, t: any) {
  const helpMessage = getNewPlayerHelpMessage(t);
  await ctx.reply(helpMessage, { parse_mode: 'HTML' });
}

async function showNewPlayerMenu(ctx: any, t: any) {
  const message = buildNewPlayerMenuMessage(t);

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback(t('newplayer_start_button'), 'newplayer_start')]
  ]);

  const sent = await ctx.reply(message, {
    parse_mode: 'HTML',
    reply_markup: keyboard.reply_markup
  });

  SessionManager.initCommand(ctx, {
    stepId: 'newplayer_menu',
    inputType: 'callback',
    lastMessageId: sent.message_id,
    params: {},
    handler: handleNewPlayerInput
  });
}

export { executeNewPlayer };
