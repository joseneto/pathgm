import { Markup } from 'telegraf';
import { getTranslation, getClearDataHelpMessage, buildClearDataMenuMessage } from '../helpers/commandHelpers';
import { handleCriticalError } from '../helpers/errorHandler';
import { SessionManager } from '../utils/SessionManager';
import { handleClearData } from '../handlers/handleClearData';
import { prisma } from '@pathgm/shared/generated/client';

/**
 * Parse direct command arguments
 * /cleardata all
 * /cleardata npcs
 * /cleardata players,items,notes
 */
function parseDirectArgs(args: string[]): string[] | null {
  if (args.length === 0) return null;
  
  const input = args.join(' ').toLowerCase();
  
  if (input === 'all') {
    return ['notes', 'npcs', 'encounters', 'players', 'plots', 'items', 'regions', 'places', 'events'];
  }
  
  // Parse comma-separated list
  const entities = input.split(',').map(e => e.trim());
  const validEntities = ['notes', 'npcs', 'encounters', 'players', 'plots', 'items', 'regions', 'places', 'events'];
  
  const filteredEntities = entities.filter(e => validEntities.includes(e));
  return filteredEntities.length > 0 ? filteredEntities : null;
}

/**
 * Execute clear data operation
 */
async function executeClearData(ctx: any, entities: string[], t: any) {
  const results: Record<string, number> = {};
  
  try {
    for (const entity of entities) {
      let count = 0;
      
      switch (entity) {
        case 'notes':
          count = await prisma.note.deleteMany({ where: { userId: ctx.user.id } }).then(r => r.count);
          break;
        case 'npcs':
          count = await prisma.npc.deleteMany({ where: { userId: ctx.user.id } }).then(r => r.count);
          break;
        case 'encounters':
          count = await prisma.encounter.deleteMany({ where: { userId: ctx.user.id } }).then(r => r.count);
          break;
        case 'players':
          count = await prisma.player.deleteMany({ where: { userId: ctx.user.id } }).then(r => r.count);
          break;
        case 'plots':
          count = await prisma.plot.deleteMany({ where: { userId: ctx.user.id } }).then(r => r.count);
          break;
        case 'items':
          count = await prisma.item.deleteMany({ where: { userId: ctx.user.id } }).then(r => r.count);
          break;
        case 'regions':
          count = await prisma.region.deleteMany({ where: { userId: ctx.user.id } }).then(r => r.count);
          break;
        case 'places':
          count = await prisma.place.deleteMany({ where: { userId: ctx.user.id } }).then(r => r.count);
          break;
        case 'events':
          count = await prisma.event.deleteMany({ where: { userId: ctx.user.id } }).then(r => r.count);
          break;
      }
      
      results[entity] = count;
    }
    
    // Create summary message
    const summary = Object.entries(results)
      .filter(([, count]) => count > 0)
      .map(([entity, count]) => `${count} ${t(entity)}`)
      .join(', ');
    
    if (summary) {
      await ctx.reply(t('cleardata_success_summary', { summary }), { parse_mode: 'HTML' });
    } else {
      await ctx.reply(t('cleardata_no_data'), { parse_mode: 'HTML' });
    }
    
    console.log(`✅ Data cleared for user ${ctx.user.id}:`, results);
    
  } catch (error) {
    // CRITICAL: Use handleCriticalError to ensure error propagates and credits aren't consumed
    await handleCriticalError(
      error,
      '[clearData] Error',
      t('cleardata_error'),
      ctx
    );
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
    return await executeClearData(ctx, directEntities, t);
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
    [Markup.button.callback(t('clear_notes'), 'clear_notes')],
    [Markup.button.callback(t('clear_npcs'), 'clear_npcs')],
    [Markup.button.callback(t('clear_encounters'), 'clear_encounters')],
    [Markup.button.callback(t('clear_players'), 'clear_players')],
    [Markup.button.callback(t('clear_plots'), 'clear_plots')],
    [Markup.button.callback(t('clear_items'), 'clear_items')],
    [Markup.button.callback(t('clear_regions'), 'clear_regions')],
    [Markup.button.callback(t('clear_places'), 'clear_places')],
    [Markup.button.callback(t('clear_events'), 'clear_events')],
    [Markup.button.callback(t('clear_all'), 'clear_all')]
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