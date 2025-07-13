import fetch from 'node-fetch';
import { parsePathbuilderCharacter } from '../helpers/parsePathbuilderCharacter';
import { formatPlayerHtml } from '../utils/htmlOutputFormat';
import { getTranslation, getImportPlayerHelpMessage, buildImportPlayerMenuMessage } from '../helpers/commandHelpers';
import { Markup } from 'telegraf';
import { handleImportPlayerInput } from '../handlers/text/handleImportPlayerInput';
import { actionButtons } from '../helpers/actionButtons';
import { SessionManager } from '../utils/SessionManager';
import { withPrisma } from '../lib/withPrisma';

/**
 * Parse direct command arguments
 * /importplayer "link_or_id"
 */
function parseDirectArgs(args: string[]): string | null {
  if (args.length === 0) return null;

  const input = args.join(' ').trim();
  return input || null;
}

/**
 * Extract ID from Pathbuilder link or return the ID if it's already numeric
 */
function extractPathbuilderId(input: string): string | null {
  const cleaned = input.replace(/['"]/g, '').trim();

  const urlMatch = cleaned.match(/pathbuilder2e\.com\/json\.php\?id=(\d{5,})/);
  if (urlMatch) {
    return urlMatch[1];
  }

  // Check if it's just a numeric ID
  const idMatch = cleaned.match(/^(\d{5,})$/);
  if (idMatch) {
    return idMatch[1];
  }

  return null;
}

/**
 * Execute the import process
 */
async function executeImportPlayer(ctx: any, input: string, t: any) {
  const id = extractPathbuilderId(input);

  if (!id) {
    await ctx.reply(t('addplayer_invalid_link'), { parse_mode: 'HTML' });
    return;
  }

  try {
    await ctx.reply('📥 Importando personagem...', { parse_mode: 'HTML' });

    const response = await fetch(`https://pathbuilder2e.com/json.php?id=${id}`);
    if (!response.ok) throw new Error('invalid response');

    const json = await response.json();
    const parsed = parsePathbuilderCharacter(json, id);

    if (!parsed || !parsed.name || !parsed.skills) {
      console.error('[importPlayer] Invalid parsed data:', parsed);
      await ctx.reply(t('addplayer_invalid_json'), { parse_mode: 'HTML' });
      return;
    }

    const savedPlayer = await withPrisma(async (prisma) => {
      return await prisma.player.upsert({
        where: {
          userId_pathbuilderId: {
            userId: ctx.user.id,
            pathbuilderId: id,
          },
        },
        update: {
          ...parsed,
          userId: ctx.user.id,
        },
        create: {
          ...parsed,
          userId: ctx.user.id,
        },
      });
    });

    // Create action buttons for the new player
    try {
      const ab = actionButtons(savedPlayer, 'player', t);
      const message = formatPlayerHtml(parsed, t);

      await ctx.reply(message, {
        parse_mode: 'HTML',
        reply_markup: ab.reply_markup,
      });
    } catch (formatError) {
      console.error('[importPlayer] Error in formatting/sending:', formatError);
      // Send a simple success message instead
      await ctx.reply(`✅ Personagem "${parsed.name}" importado com sucesso!`);
    }
  } catch (error) {
    console.error('[importPlayer] Error during import:', error);
    await ctx.reply(t('addplayer_error'), { parse_mode: 'HTML' });
  }
}

export async function importPlayerCommand(ctx: any) {
  const [t] = getTranslation(ctx);

  // Parse arguments
  const args = ctx.message?.text?.split(' ').slice(1) || [];

  // Check for help
  if (args.includes('help') || args.includes('--help') || args.includes('-h')) {
    return await showImportPlayerHelp(ctx, t);
  }

  // Try to parse direct command arguments
  const directInput = parseDirectArgs(args);
  if (directInput) {
    // Execute directly if input is provided
    return await executeImportPlayer(ctx, directInput, t);
  }

  // Otherwise show menu
  await showImportPlayerMenu(ctx, t);
}

async function showImportPlayerHelp(ctx: any, t: any) {
  const helpMessage = getImportPlayerHelpMessage(t);
  await ctx.reply(helpMessage, { parse_mode: 'HTML' });
}

async function showImportPlayerMenu(ctx: any, t: any) {
  const message = buildImportPlayerMenuMessage(t);

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback(t('import_player_start_button'), 'import_player_start')],
  ]);

  const sent = await ctx.reply(message, {
    parse_mode: 'HTML',
    reply_markup: keyboard.reply_markup,
  });

  SessionManager.initCommand(ctx, {
    stepId: 'import_player_menu',
    inputType: 'callback',
    lastMessageId: sent.message_id,
    params: {},
    handler: handleImportPlayerInput,
  });
}

export { executeImportPlayer };
