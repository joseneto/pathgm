import { generateInteractiveListMarkup } from '../../helpers/interactiveList';
import { listHandler } from './listHandler';
import { getTranslation } from '../../helpers/commandHelpers';

async function handlePageAction(ctx: any, handler: any, user: any, value: string, baseCallback: string, t: any) {
  const page = parseInt(value, 10);
  ctx.session.page = page;

  // Get items with or without tag filtering (pageSize now 8)
  const result = await handler.getItems(user.id, page, 6);
  const { items, totalCount, searchInfo } = result;

  if (!totalCount) {
    let emptyMessage = t('list_empty');

    await ctx.editMessageText(emptyMessage, { parse_mode: 'HTML' });
    return false;
  }

  // Build message with search context
  let message = t(`${baseCallback}_prompt`);
  if (searchInfo) {
    message += `\n\n${t('search_results_info', {
      found: totalCount,
      minTags: searchInfo.minTagsRequired
    })}`;
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

  const match = data.match(/^([a-z]+?)_(page|item)_(.+)$/);
  if (!match) return false;

  const [, baseCallback, action, value] = match;
  const handler = listHandler[baseCallback as keyof typeof listHandler];
  if (!handler) return false;

  const [t] = getTranslation(ctx);

  if (action === 'page') {
    return await handlePageAction(ctx, handler, ctx.user, value, baseCallback, t);
  }

  if (action === 'item') {
    const { formated, item } = await handler.getItemDetails(value, t);
      const actionButtons = handler.createActionButtons(item, t);
      await ctx.reply(formated, {
        parse_mode: 'HTML',
        reply_markup: actionButtons.reply_markup
      });
    return true;
  }

  return false;
}
