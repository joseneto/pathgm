import { getTranslation } from '../../helpers/commandHelpers';
import { executeSyncPlayers } from '../../commands/syncPlayers';
import { SessionManager } from '../../utils/SessionManager';

export const handleSyncPlayersInput = async (ctx: any): Promise<boolean> => {
  const [t] = getTranslation(ctx);

  // Handle callback from menu button
  if (ctx.callbackQuery) {
    const callbackData = ctx.callbackQuery.data;

    if (callbackData === 'sync_players_start') {
      await ctx.answerCbQuery();

      // Delete the menu message
      try {
        await ctx.deleteMessage();
      } catch (error) {
        console.log('Could not delete menu message');
      }

      // Clear session and execute sync
      SessionManager.clearSession(ctx);

      // Execute the sync
      await executeSyncPlayers(ctx, t);
      return true;
    }
  }

  return false;
};
