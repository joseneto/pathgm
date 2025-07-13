import i18next from 'i18next';
import { getUserLang } from '../../helpers/getUserLang';
import { SessionManager } from '../../utils/SessionManager';
import { executeEditPlayer } from '../../commands/editPlayer';
import { isCancelInput } from '../../helpers/isCancelInput';
import { parseAttributeUpdates } from '../../helpers/playerAttributeParser';

export const handleEditPlayerInput = async (ctx: any): Promise<boolean> => {
  const lang = getUserLang(ctx);
  const t = i18next.getFixedT(lang);

  // Handle callback from menu button
  if (ctx.callbackQuery) {
    const callbackData = ctx.callbackQuery.data;
    
    if (callbackData === 'editplayer_start') {
      await ctx.answerCbQuery();
      
      // Delete the menu message
      try {
        await ctx.deleteMessage();
      } catch (error) {
        console.log('Could not delete menu message');
      }
      
      // Ask for input and init SessionManager to expect text
      const sent = await ctx.reply(t('editplayer_input_prompt'), { parse_mode: 'HTML' });
      
      SessionManager.initCommand(ctx, {
        stepId: 'editplayer_input',
        inputType: 'text',
        lastMessageId: sent.message_id,
        params: {},
        handler: handleEditPlayerInput
      });
      
      return true;
    }
  }
  
  // Handle text input (called by handleTextInput)
  const text = SessionManager.getMessageText(ctx);
  if (!text) return false;

  // Check for cancel
  if (isCancelInput(text)) {
    await ctx.reply(t('operation_cancelled'), { parse_mode: 'HTML' });
    SessionManager.clearSession(ctx);
    return true;
  }

  const input = text.trim().split(' ');
  if (input.length < 2) {
    await ctx.reply(t('editplayer_usage_error'), { parse_mode: 'HTML' });
    return true;
  }

  // Parse the input manually here for the interactive mode
  const [target, ...updateArgs] = input;
  const updates = parseAttributeUpdates(updateArgs);
  
  if (Object.keys(updates).length === 0) {
    await ctx.reply(t('editplayer_no_updates'), { parse_mode: 'HTML' });
    return true;
  }

  // Create params object
  const params: any = { updates };
  
  // Check if target is numeric (ID) or string (name)
  if (/^\d+$/.test(target)) {
    params.playerId = target;
  } else {
    params.playerName = target.replace(/^["']|["']$/g, '');
  }

  // Clear session before executing edit
  SessionManager.clearSession(ctx);
  
  // Execute the player edit
  await executeEditPlayer(ctx, params, t);
  
  return true;
};