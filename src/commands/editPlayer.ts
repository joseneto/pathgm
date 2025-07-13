import { formatPlayerHtml } from '../utils/htmlOutputFormat';
import { getTranslation, getEditPlayerHelpMessage, buildEditPlayerMenuMessage } from '../helpers/commandHelpers';
import { Markup } from 'telegraf';
import { handleEditPlayerInput } from '../handlers/text/handleEditPlayerInput';
import { actionButtons } from '../helpers/actionButtons';
import { parseAttributeUpdates, validatePlayerUpdates } from '../helpers/playerAttributeParser';
import { SessionManager } from '../utils/SessionManager';
import { withPrisma } from '../lib/withPrisma';

interface EditPlayerParams {
  playerId?: string;
  playerName?: string;
  updates?: Record<string, any>;
}

/**
 * Parse direct command arguments
 * /editplayer "Rurik" level=10 perception=5 fortitude=3
 * /editplayer 1 name="New Name" className=wizard
 */
function parseDirectArgs(args: string[]): EditPlayerParams | null {
  if (args.length < 2) return null;

  const [target, ...updateArgs] = args;
  const updates = parseAttributeUpdates(updateArgs);

  if (Object.keys(updates).length === 0) return null;

  // Check if target is numeric (ID) or string (name)
  if (/^\d+$/.test(target)) {
    return { playerId: target, updates };
  } else {
    return { playerName: target.replace(/^["']|["']$/g, ''), updates };
  }
}

/**
 * Find player by ID or name
 */
async function findPlayer(ctx: any, params: EditPlayerParams) {
  const { playerId, playerName } = params;

  if (playerId) {
    return await withPrisma(async (prisma) => {
      return await prisma.player.findFirst({
        where: {
          id: playerId,
          userId: ctx.user.id,
        },
      });
    });
  } else if (playerName) {
    return await withPrisma(async (prisma) => {
      return await prisma.player.findFirst({
        where: {
          name: { contains: playerName, mode: 'insensitive' },
          userId: ctx.user.id,
        },
      });
    });
  }

  return null;
}

/**
 * Execute the player edit
 */
async function executeEditPlayer(ctx: any, params: EditPlayerParams, t: any) {
  const { updates } = params;

  if (!updates || Object.keys(updates).length === 0) {
    await ctx.reply(t('editplayer_no_updates'), { parse_mode: 'HTML' });
    return;
  }

  const player = await findPlayer(ctx, params);
  if (!player) {
    await ctx.reply(t('editplayer_player_not_found'), { parse_mode: 'HTML' });
    return;
  }

  try {
    // Validate updates using shared helper
    const existingSkills = player.skills as Record<string, any> || {};
    const validation = validatePlayerUpdates(updates, t, existingSkills);

    if (!validation.isValid) {
      await ctx.reply(validation.errorMessage!, { parse_mode: 'HTML' });
      return;
    }

    const validatedUpdates = validation.validatedUpdates!;

    if (Object.keys(validatedUpdates).length === 0) {
      await ctx.reply(t('editplayer_no_valid_updates'), { parse_mode: 'HTML' });
      return;
    }

    // Update player
    const updatedPlayer = await withPrisma(async (prisma) => {
      return await prisma.player.update({
        where: { id: player.id },
        data: validatedUpdates,
      });
    });

    // Create action buttons for the updated player
    const ab = actionButtons(updatedPlayer, 'player', t);
    const message = formatPlayerHtml(updatedPlayer as any, t);

    // Show changes made
    const changes = Object.entries(validatedUpdates)
      .map(([key, value]) => `${t(key) || key}: ${value}`)
      .join(', ');

    await ctx.reply(
      `${t('editplayer_success', { name: updatedPlayer.name, changes })}\n\n${message}`,
      {
        parse_mode: 'HTML',
        reply_markup: ab.reply_markup,
      },
    );

  } catch {
    await ctx.reply(t('editplayer_error'), { parse_mode: 'HTML' });
  }
}

export const editPlayerCommand = async (ctx: any) => {
  const [t] = getTranslation(ctx);

  // Parse arguments
  const args = ctx.message?.text?.split(' ').slice(1) || [];

  // Check for help
  if (args.includes('help') || args.includes('--help') || args.includes('-h')) {
    return await showEditPlayerHelp(ctx, t);
  }

  // Try to parse direct command arguments
  const directParams = parseDirectArgs(args);
  if (directParams) {
    // Execute directly if params are provided
    return await executeEditPlayer(ctx, directParams, t);
  }

  // Otherwise show menu
  await showEditPlayerMenu(ctx, t);
};

async function showEditPlayerHelp(ctx: any, t: any) {
  const helpMessage = getEditPlayerHelpMessage(t);
  await ctx.reply(helpMessage, { parse_mode: 'HTML' });
}

async function showEditPlayerMenu(ctx: any, t: any) {
  const message = buildEditPlayerMenuMessage(t);

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback(t('editplayer_start_button'), 'editplayer_start')],
  ]);

  const sent = await ctx.reply(message, {
    parse_mode: 'HTML',
    reply_markup: keyboard.reply_markup,
  });

  SessionManager.initCommand(ctx, {
    stepId: 'editplayer_menu',
    inputType: 'callback',
    lastMessageId: sent.message_id,
    params: {},
    handler: handleEditPlayerInput,
  });
}

export { executeEditPlayer };
