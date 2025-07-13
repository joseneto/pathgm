import { InlineKeyboardButton, InlineKeyboardMarkup } from 'telegraf/typings/core/types/typegram';

export interface InteractiveListItem {
  label: string;
  type: string;
  callbackId: string;
}

interface GenerateListMarkupOptions {
  items: InteractiveListItem[];
  page: number;
  pageSize?: number;
  baseCallback: string;
  totalCount: number;
  t?: any;
}

function getIconForType(type: string): string {
  const icons: Record<string, string> = {
    player: '🎭',
  };
  return icons[type] || '📋';
}

export function generateInteractiveListMarkup({
  items,
  page,
  baseCallback,
  pageSize = 6,
  totalCount,
  t,
}: GenerateListMarkupOptions): InlineKeyboardMarkup {
  const buttons: InlineKeyboardButton[][] = [];

  items.forEach((item) => {
    const icon = getIconForType(item.type);
    const displayText = `${icon} ${item.label}`;

    buttons.push([
      {
        text: displayText,
        callback_data: `${baseCallback}_item_${item.callbackId}`
      }
    ]);
  });

  const totalPages = Math.ceil(totalCount / pageSize);
  const navRow: InlineKeyboardButton[] = [];

  if (page > 0) {
    const prevText = t ? t('previous') : 'Previous';
    navRow.push({ text: `⬅️ ${prevText}`, callback_data: `${baseCallback}_page_${page - 1}` });
  }

  // Page indicator with total count
  if (totalPages > 1) {
    navRow.push({
      text: `📄 ${page + 1}/${totalPages} (${totalCount} total)`, 
      callback_data: `${baseCallback}_page_${page}` // Current page (no action)
    });
  }

  if (page < totalPages - 1) {
    const nextText = t ? t('next') : 'Next';
    navRow.push({ text: `${nextText} ➡️`, callback_data: `${baseCallback}_page_${page + 1}` });
  }

  if (navRow.length) {
    buttons.push(navRow);
  }

  return { inline_keyboard: buttons };
}
