import { SessionManager } from '../../utils/SessionManager'
import { getUserLang } from '../../helpers/getUserLang';
import i18next from 'i18next';

export const handleTextInput = async (ctx: any) => {
  if (!SessionManager.isExpecting(ctx, 'text')) return;

  const text = SessionManager.getMessageText(ctx);
  if (!text) return;

  if (text.toLowerCase() === 'cancel' || text.toLowerCase() === 'cancelar') {
    const lang = getUserLang(ctx);
    const t = i18next.getFixedT(lang);
    
    SessionManager.clearSession(ctx);
    await ctx.reply(t('operation_cancelled'));
    return;
  }

  await SessionManager.executeCurrentHandler(ctx);
}
