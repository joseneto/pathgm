import { SessionManager } from '../../utils/SessionManager';
import { getTranslation } from '../../helpers/commandHelpers';

export const handleTextInput = async (ctx: any) => {
  if (!SessionManager.isExpecting(ctx, 'text')) return;

  const text = SessionManager.getMessageText(ctx);
  if (!text) return;

  if (text.toLowerCase() === 'cancel' || text.toLowerCase() === 'cancelar') {
    const [t] = getTranslation(ctx);

    SessionManager.clearSession(ctx);
    await ctx.reply(t('operation_cancelled'));
    return;
  }

  await SessionManager.executeCurrentHandler(ctx);
};
