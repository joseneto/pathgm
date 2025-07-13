import { paginationHandler } from './pagination/paginationHandler';
import { actionHandler, handleDeleteConfirmation } from './actions/actionHandler';
import { SessionManager } from '../utils/SessionManager';
import { getTranslation } from '../helpers/commandHelpers';

export async function handleCallbackQuery(ctx: any, safeWrapper: any) {
  const [t] = getTranslation(ctx);
  try {
    // Handle new simplified list system first (priority over session context)
    const data = ctx.callbackQuery?.data;
    if (data) {
      // Handle new entity actions (delete) - always process these regardless of session
      if (data.match(/^[a-z]+_action_[a-z]+_/)) {
        await safeWrapper(actionHandler)(ctx);
        return;
      }
    }

    const currentContext = SessionManager.getCurrentContext(ctx);
    if (currentContext && SessionManager.isExpecting(ctx, 'callback')) {
      if (!currentContext.handler) {
        console.warn('handleCallbackQuery: Context without handler');
        await ctx.reply(t('callback_invalid'), { parse_mode: 'HTML' });
        SessionManager.clearSession(ctx);
        return;
      }
      await safeWrapper(currentContext.handler)(ctx);
      return;
    }

    if (data) {

      // Handle delete confirmations
      if (data.startsWith('confirm_delete_') || data === 'cancel_delete') {
        await safeWrapper(handleDeleteConfirmation)(ctx);
        return;
      }

      // Handle new simplified pagination
      if (data.match(/^(listplayers)_(page|item)_/)) {
        await safeWrapper(paginationHandler)(ctx);
        return;
      }
    }

    if (ctx.session?.paginationEnabled) {
      await safeWrapper(paginationHandler)(ctx);
      return;
    }

    console.warn('handleCallbackQuery: No valid context found for callback:', data);
    await ctx.reply(t('callback_invalid'), { parse_mode: 'HTML' });

  } catch {
    SessionManager.clearSession(ctx);
    await ctx.reply(t('unexpected_error_session_reset'));
  }
}
