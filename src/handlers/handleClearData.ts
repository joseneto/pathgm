import { SessionManager } from '../utils/SessionManager';
import { executeClearData } from '../commands/clearData';
import { getTranslation } from '../helpers/commandHelpers';

export async function handleClearData(ctx: any) {
  const buttonData = SessionManager.getButtonData(ctx);
  if (!buttonData?.startsWith('clear_')) return false;

  const [t] = getTranslation(ctx);

  switch (buttonData) {
  case 'clear_players':
    break;
  case 'clear_all':
    break;
  default:
    return false;
  }

  await ctx.answerCbQuery(); // remove loading

  // Delete the menu message
  try {
    await ctx.deleteMessage();
  } catch {
    console.log('Could not delete menu message');
  }

  SessionManager.clearSession(ctx);

  // Execute the clear operation using the shared function
  await executeClearData(ctx, t);

  return true;
}
