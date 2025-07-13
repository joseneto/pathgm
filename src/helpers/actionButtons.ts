import { TFunction } from 'i18next';
import { Markup } from 'telegraf';

export const actionButtons = (item: any, model: string, t: TFunction) => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(`🗑️ ${t(`delete_${model}`)}`, `${model}_action_delete_${item.id}`),
    ],
  ]);
};
