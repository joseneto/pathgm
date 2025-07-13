import { SessionManager } from '../utils/SessionManager';
import { sendLocalizedMessage } from '../apis/telegram';
import { paginationHandler } from './pagination/paginationHandler';
import { actionHandler, handleDeleteConfirmation } from './actions/actionHandler';
import { handleAudioGeneration } from './handleAudioGeneration';

export async function handleCallbackQuery(ctx: any, safeWrapper: any) {
  try {
    const currentContext = SessionManager.getCurrentContext(ctx);
    if (currentContext && SessionManager.isExpecting(ctx, 'callback')) {
      if (!currentContext.handler) {
        console.warn('handleCallbackQuery: Context without handler');
        await sendLocalizedMessage(ctx, 'callback_invalid');
        SessionManager.clearSession(ctx);
        return;
      }

      console.log(`handleCallbackQuery: Using SessionManager for stepId: ${currentContext.stepId}`);
      await safeWrapper(currentContext.handler)(ctx);
      return;
    }

    // ✅ NEW: Priority 1.5 - Handle new simplified list system
    const data = ctx.callbackQuery?.data;
    if (data) {
      // Handle audio generation callbacks
      if (data.startsWith('audio_generate_')) {
        console.log('handleCallbackQuery: Using audio generation handler');
        await safeWrapper(handleAudioGeneration)(ctx);
        return;
      }

      // Handle new entity actions (delete, edit, contextual, etc.)
      if (data.match(/^[a-z]+_action_[a-z]+_/)) {
        console.log('handleCallbackQuery: Using new action handler');
        await safeWrapper(actionHandler)(ctx);
        return;
      }

      // Handle delete confirmations
      if (data.startsWith('confirm_delete_') || data === 'cancel_delete') {
        console.log('handleCallbackQuery: Using delete confirmation handler');
        await safeWrapper(handleDeleteConfirmation)(ctx);
        return;
      }


      // Handle new simplified pagination
      if (data.match(/^(listnpcs|listplots|listplaces|listregions|listencounters|listitems|listnotes|listplayers)_(page|item)_/)) {
        console.log('handleCallbackQuery: Using new pagination handler');
        await safeWrapper(paginationHandler)(ctx);
        return;
      }
    }

    // ✅ Prioridade 2: Paginação (sistema antigo - mantido para compatibilidade)
    if (ctx.session?.paginationEnabled) {
      console.log('handleCallbackQuery: Using legacy pagination handler');
      await safeWrapper(paginationHandler)(ctx);
      return;
    }

    console.warn('handleCallbackQuery: No valid context found for callback:', data);
    await sendLocalizedMessage(ctx, 'callback_invalid');

  } catch (error) {
    console.error('handleCallbackQuery: Unexpected error', error);
    SessionManager.clearSession(ctx);
    await ctx.reply('🔄 Erro inesperado. Sessão foi resetada. Tente novamente.');
  }
}
