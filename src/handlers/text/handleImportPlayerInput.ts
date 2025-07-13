import i18next from 'i18next';
import { getUserLang } from '../../helpers/getUserLang';
import { SessionManager } from '../../utils/SessionManager';
import { executeImportPlayer } from '../../commands/importPlayer';

export const handleImportPlayerInput = async (ctx: any): Promise<boolean> => {
  const lang = getUserLang(ctx);
  const t = i18next.getFixedT(lang);

  // Handle callback from menu button
  if (ctx.callbackQuery) {
    const callbackData = ctx.callbackQuery.data;
    
    if (callbackData === 'import_player_start') {
      await ctx.answerCbQuery();
      
      // Delete the menu message
      try {
        await ctx.deleteMessage();
      } catch (error) {
        console.log('Could not delete menu message');
      }
      
      // Ask for input and init SessionManager to expect text
      const sent = await ctx.reply(t('import_player_input_prompt'), { parse_mode: 'HTML' });
      
      SessionManager.initCommand(ctx, {
        stepId: 'import_player_input',
        inputType: 'text',
        lastMessageId: sent.message_id,
        params: {},
        handler: handleImportPlayerInput
      });
      
      return true;
    }
  }
  
  // Handle text input (called by handleTextInput)
  const text = SessionManager.getMessageText(ctx);
  if (!text) return false;

  const input = text.trim();
  if (!input) {
    await ctx.reply(t('import_player_input_prompt'), { parse_mode: 'HTML' });
    return true;
  }

  // Clear session before executing import
  SessionManager.clearSession(ctx);
  
  // Execute the import
  await executeImportPlayer(ctx, input, t);
  
  return true;
};