import { InlineKeyboardButton, InlineKeyboardMarkup } from 'telegraf/typings/core/types/typegram';

export interface InteractiveListItem {
  label: string;
  type: string; // Para definir o ícone correto
  callbackId: string;
}

interface GenerateListMarkupOptions {
  items: InteractiveListItem[];
  page: number;
  pageSize?: number;
  baseCallback: string;
  totalCount: number;
  t?: any; // Translation function
}

// Função para ícones por tipo de entidade
function getIconForType(type: string): string {
  const icons: Record<string, string> = {
    npc: '👤',
    plot: '📜', 
    place: '🏛️',
    region: '🏰',
    encounter: '⚔️',
    item: '📦',
    player: '🎭',
    note: '📝'
  };
  return icons[type] || '📋';
}

export function generateInteractiveListMarkup({
  items,
  page,
  baseCallback,
  pageSize = 8, // ✅ Increased from 5 to 8 for better density
  totalCount,
  t,
}: GenerateListMarkupOptions): InlineKeyboardMarkup {
  const buttons: InlineKeyboardButton[][] = [];

  // ✅ SIMPLIFIED: One row per item only
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

  // Navigation row (unchanged)
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
