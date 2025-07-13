import { prisma } from '@pathgm/shared/generated/client';
import { sendLocalizedMessage } from '../apis/telegram';
import { SessionManager } from '../utils/SessionManager';
import { executeClearData } from '../commands/clearData';
import { getUserLang } from '../helpers/getUserLang';
import i18next from 'i18next';

export async function handleClearData(ctx: any) {
  const buttonData = SessionManager.getButtonData(ctx);
  if (!buttonData?.startsWith('clear_')) return false;

  const lang = getUserLang(ctx);
  const t = i18next.getFixedT(lang);

  let entities: string[] = [];

  switch (buttonData) {
    case 'clear_notes':
      entities = ['notes'];
      break;
    case 'clear_npcs':
      entities = ['npcs'];
      break;
    case 'clear_encounters':
      entities = ['encounters'];
      break;
    case 'clear_players':
      entities = ['players'];
      break;
    case 'clear_plots':
      entities = ['plots'];
      break;
    case 'clear_items':
      entities = ['items'];
      break;
    case 'clear_regions':
      entities = ['regions'];
      break;
    case 'clear_places':
      entities = ['places'];
      break;
    case 'clear_events':
      entities = ['events'];
      break;
    case 'clear_all':
      entities = ['notes', 'npcs', 'encounters', 'players', 'plots', 'items', 'regions', 'places', 'events'];
      break;
    default:
      return false;
  }

  await ctx.answerCbQuery(); // remove loading
  
  // Delete the menu message
  try {
    await ctx.deleteMessage();
  } catch (error) {
    console.log('Could not delete menu message');
  }
  
  SessionManager.clearSession(ctx);
  
  // Execute the clear operation using the shared function
  await executeClearData(ctx, entities, t);

  return true;
}
