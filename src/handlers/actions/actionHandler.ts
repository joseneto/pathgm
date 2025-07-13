import { getUserLang } from '../../helpers/getUserLang';
import { listHandler } from '../../handlers/pagination/listHandler';
import { getTranslation } from '../../helpers/commandHelpers';

export async function actionHandler(ctx: any) {
  if (!('data' in ctx.callbackQuery!)) return false;

  const data = ctx.callbackQuery.data;

  console.log("data actionHandler:", data)
  // Match pattern: entityType_action_actionName_entityId
  const match = data.match(/^([a-z]+)_action_([a-z]+)_(.+)$/);
  if (!match) return false;

  const [, entityType, actionName, entityId] = match;
  const [t] = getTranslation(ctx);
  try {
    switch (actionName) {
      case 'delete':
        await handleDeleteAction(ctx, entityType, entityId, t);
        break;
      case 'webapp':
        await handleWebappAction(ctx, entityType, entityId, t);
        break;
      default:
        await ctx.reply(`❌ ${t('unknown_action') || 'Unknown action'}: ${actionName}`);
        return false;
    }
    return true;
  } catch (error) {
    const errorMessage = (error instanceof Error) ? error.message : String(error);
    await ctx.reply(`❌ ${t('action_error') || 'Action error'}: ${errorMessage}`);
    return false;
  }
}

async function handleDeleteAction(ctx: any, entityType: string, entityId: string, t: any) {
  const handler = listHandler[`list${entityType}s` as keyof typeof listHandler];
  if (!handler) {
    await ctx.reply(`❌ ${t('entity_type_not_supported') || 'Entity type not supported'}: ${entityType}`);
    return;
  }

  const { item } = await handler.getItemDetails(entityId, t);
  if (!item) {
    await ctx.reply(`❌ ${t('entity_not_found') || 'Entity not found'}`);
    return;
  }

  const confirmButtons = [
    [
      { text: `✅ ${t('confirm_delete') || 'Confirm'}`, callback_data: `confirm_delete_${entityType}_${entityId}` },
      { text: `❌ ${t('cancel') || 'Cancel'}`, callback_data: `cancel_delete` }
    ]
  ];

  await ctx.reply(
    `⚠️ **${t('confirm_delete_entity') || 'Confirm deletion'}**\n\n` +
    `${t('entity_name') || 'Name'}: **${item.name || item.title}**\n` +
    `${t('entity_type') || 'Type'}: ${entityType}\n\n` +
    `${t('delete_warning') || 'This action cannot be undone.'}`,
    {
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: confirmButtons }
    }
  );
}

async function handleWebappAction(ctx: any, entityType: string, entityId: string, t: any) {
  const handler = listHandler[`list${entityType}s` as keyof typeof listHandler];
  const { item } = await handler.getItemDetails(entityId, t);

  if (!item) {
    await ctx.reply(`❌ ${t('entity_not_found') || 'Entity not found'}`);
    return;
  }

  // Generate webapp URL (using slug if available, fallback to ID)
  const identifier = item.slug || entityId;
  const itemName = item.name || item.title;

  await ctx.reply(
    `🌐 **${t('view_in_webapp') || 'View in WebApp'}:**\n\n` +
    `[${itemName}](${'pathbuild_url'})\n\n` +
    `📱 ${t('webapp_features') || 'WebApp features'}:\n` +
    `• ${t('detailed_view') || 'Detailed view'}\n` +
    `• ${t('pdf_export') || 'PDF export'}\n` +
    `• ${t('sharing_options') || 'Sharing options'}`,
    {
      parse_mode: 'Markdown',
      disable_web_page_preview: false
    }
  );
}

export async function handleDeleteConfirmation(ctx: any) {
  if (!('data' in ctx.callbackQuery!)) return false;

  const data = ctx.callbackQuery.data;

  if (data.startsWith('confirm_delete_')) {
    const match = data.match(/^confirm_delete_([a-z]+)_(.+)$/);
    if (!match) return false;

    const [, entityType, entityId] = match;
    const [t] = getTranslation(ctx);

    try {
      const handler = listHandler[`list${entityType}s` as keyof typeof listHandler];
      await handler.deleteItem(entityId);

      await ctx.editMessageText(
        `✅ **${t('entity_deleted_successfully') || 'Entity deleted successfully'}**\n\n${t('entity_removed_from_campaign') || 'The entity has been removed from your campaign.'}`,
        { parse_mode: 'HTML' }
      );

      return true;
    } catch (error) {
      const errorMessage = (error instanceof Error) ? error.message : String(error);
      await ctx.editMessageText(
        `❌ **${t('delete_error') || 'Delete error'}:** ${errorMessage}`,
        { parse_mode: 'HTML' }
      );
      return true;
    }
  }

  if (data === 'cancel_delete') {
    const [t] = getTranslation(ctx);

    await ctx.editMessageText(
      `❌ **${t('delete_cancelled') || 'Delete cancelled'}**\n\n${t('entity_not_modified') || 'The entity was not modified.'}`,
      { parse_mode: 'HTML' }
    );
    return true;
  }

  return false;
}

