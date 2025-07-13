import { TFunction } from "i18next";
import { Markup } from "telegraf";

export const actionButtons = (item: any, model: string, t: TFunction, includeNarration: boolean = true) => {
  if (includeNarration) {
    // Layout: [WebApp] [Narração] na primeira linha, [Delete] na segunda linha
    return Markup.inlineKeyboard([
      [
        Markup.button.callback(`🌐 ${t('view_webapp')}`, `${model}_action_webapp_${item.id}`),
        Markup.button.callback(`🎧 ${t('narration')}`, `audio_generate_${model}_${item.id}`)
      ],
      [
        Markup.button.callback(`🗑️ ${t(`delete_${model}`)}`, `${model}_action_delete_${item.id}`)
      ],
    ]);
  } else {
    // Layout: [WebApp] [Delete] na mesma linha
    return Markup.inlineKeyboard([
      [
        Markup.button.callback(`🌐 ${t('view_webapp')}`, `${model}_action_webapp_${item.id}`),
        Markup.button.callback(`🗑️ ${t(`delete_${model}`)}`, `${model}_action_delete_${item.id}`)
      ],
    ]);
  }
}
