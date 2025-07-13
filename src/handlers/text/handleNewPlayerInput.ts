import { getTranslation } from '../../helpers/commandHelpers';
import { executeNewPlayer } from '../../commands/newPlayer';
import { isCancelInput } from '../../helpers/isCancelInput';
import { parseAttributeUpdates } from '../../helpers/playerAttributeParser';
import { SessionManager } from '../../utils/SessionManager';

export const handleNewPlayerInput = async (ctx: any): Promise<boolean> => {
  const [t] = getTranslation(ctx);

  // Handle callback from menu button
  if (ctx.callbackQuery) {
    const callbackData = ctx.callbackQuery.data;

    if (callbackData === 'newplayer_start') {
      await ctx.answerCbQuery();
      // Delete the menu message
      try {
        await ctx.deleteMessage();
      } catch (error) {
        console.log('Could not delete menu message');
      }

      // Ask for input and init SessionManager to expect text
      const sent = await ctx.reply(t('newplayer_input_prompt'), { parse_mode: 'HTML' });

      SessionManager.initCommand(ctx, {
        stepId: 'newplayer_input',
        inputType: 'text',
        lastMessageId: sent.message_id,
        params: {},
        handler: handleNewPlayerInput
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
  if (input.length < 3) {
    await ctx.reply(t('createplayer_usage_error'), { parse_mode: 'HTML' });
    return true;
  }

  const [name, className, levelRaw, ...attributeArgs] = input;
  const level = parseInt(levelRaw, 10);

  if (isNaN(level) || level < 1 || level > 20) {
    await ctx.reply(t('createplayer_invalid_level'), { parse_mode: 'HTML' });
    return true;
  }

  // Parse additional attributes if provided
  const attributes = attributeArgs.length > 0 ? parseAttributeUpdates(attributeArgs) : undefined;

  // Clear session before executing creation
  SessionManager.clearSession(ctx);

  // Execute the player creation
  await executeNewPlayer(ctx, { name, className, level, attributes }, t);
  return true;
};
