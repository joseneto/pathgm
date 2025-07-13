import { generateInteractiveListMarkup } from '../../helpers/interactiveList';
import i18next from 'i18next';
import { listHandler } from './listHandler';
import { getUserLang } from '../../helpers/getUserLang';

async function handlePageAction(ctx: any, handler: any, user: any, value: string, baseCallback: string, t: any) {
  const page = parseInt(value, 10);
  ctx.session.page = page;
  
  // Check if there are search tags in session
  const searchTags = ctx.session.searchTags;
  
  // Get items with or without tag filtering (pageSize now 8)
  const result = await handler.getItems(user.id, page, 8, searchTags);
  const { items, totalCount, searchInfo } = result;

  if (!totalCount) {
    let emptyMessage = t('list_empty');
    if (searchTags && searchTags.length > 0) {
      const tagList = searchTags.map((tag: string) => `#${tag}`).join(' ');
      emptyMessage = `${t('no_items_found_with_tags')}: ${tagList}`;
    }
    await ctx.editMessageText(emptyMessage, { parse_mode: 'HTML' });
    return false;
  }

  // Build message with search context
  let message = t(`${baseCallback}_prompt`);
  if (searchTags && searchTags.length > 0) {
    const tagList = searchTags.map((tag: string) => `#${tag}`).join(' ');
    message = `${t('items_filtered_by_tags')}: ${tagList}\n\n${message}`;
    
    if (searchInfo) {
      message += `\n\n${t('search_results_info', { 
        found: totalCount, 
        minTags: searchInfo.minTagsRequired 
      })}`;
    }
  }

  const markup = generateInteractiveListMarkup({ items, page, baseCallback, totalCount, t });
  await ctx.editMessageText(message, { parse_mode: 'HTML', reply_markup: markup });
  return true;
}

export async function paginationHandler(ctx: any) {
  if (!('data' in ctx.callbackQuery!)) return;

  ctx.session.state ??= {};
  ctx.session.page ??= 0;
  const data = ctx.callbackQuery.data;
  
  // ✅ UPDATED: Removed delete handling from pagination, now handled in details
  const match = data.match(/^([a-z]+?)_(page|item)_(.+)$/);
  if (!match) return false;

  const [, baseCallback, action, value] = match;
  const handler = listHandler[baseCallback as keyof typeof listHandler];
  if (!handler) return false;

  const lang = getUserLang(ctx);
  const t = i18next.getFixedT(lang);

  if (action === 'page') {
    return await handlePageAction(ctx, handler, ctx.user, value, baseCallback, t);
  }

  if (action === 'item') {
    const { formated, item } = await handler.getItemDetails(value, t);
      console.log(`📋 Showing details with action buttons for ${baseCallback}: ${item.name || item.title} (ID: ${item.id})`);
      const actionButtons = handler.createActionButtons(item, t);
      await ctx.reply(formated, {
        parse_mode: 'HTML',
        reply_markup: actionButtons.reply_markup
      });
    return true;
  }

  return false;
}
