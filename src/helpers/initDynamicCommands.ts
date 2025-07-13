import i18next from 'i18next';
import { Telegraf } from 'telegraf';
import { getEffectiveTelegramId } from './getEffectiveTelegramId';
import { isGroup } from './isGroup';
const languages = ['en', 'pt'];

export async function initDynamicCommands(bot: Telegraf<any>, ctx: any) {
  const chatId = getEffectiveTelegramId(ctx);
  for (const forceLang of languages) {
    const t = i18next.getFixedT(forceLang);
    const groupCommands = [
      { command: 'd20', description: t('cmd_d20') },
      { command: 'roll', description: t('cmd_roll') },
      { command: 'rollall', description: t('cmd_rollall') },
      { command: 'genplayer', description: t('cmd_genplayer') },
      { command: 'newplayer', description: t('cmd_newplayer') },
      { command: 'importplayer', description: t('cmd_importplayer') },
      { command: 'syncplayers', description: t('cmd_syncplayers') },
      { command: 'editplayer', description: t('cmd_editplayer') },
      { command: 'listplayers', description: t('cmd_listplayers') },
      { command: 'menu', description: t('cmd_menu') },
      { command: 'help', description: t('cmd_help') },
      { command: 'about', description: t('cmd_about') },
    ];

    const privateCommands = [
      ...groupCommands,
      { command: 'gennpc', description: t('cmd_gennpc') },
      { command: 'genplot', description: t('cmd_genplot') },
      { command: 'genencounter', description: t('cmd_genencounter') },
      { command: 'genitem', description: t('cmd_genitem') },
      { command: 'genplace', description: t('cmd_genplace') },
      { command: 'genregion', description: t('cmd_genregion') },
      { command: 'genevent', description: t('cmd_genevent') },
      { command: 'gencontextual', description: t('cmd_gencontextual') },
      { command: 'narrate', description: t('cmd_narrate') },
      { command: 'askrule', description: t('cmd_askrule') },
      { command: 'note', description: t('cmd_note') },
      { command: 'cleardata', description: t('cmd_cleardata') },
      { command: 'listnotes', description: t('cmd_listnotes') },
      { command: 'listnpcs', description: t('cmd_listnpcs') },
      { command: 'listplots', description: t('cmd_listplots') },
      { command: 'listencounters', description: t('cmd_listencounters') },
      { command: 'listitems', description: t('cmd_listitems') },
      { command: 'listplaces', description: t('cmd_listplaces') },
      { command: 'listregions', description: t('cmd_listregions') },
      { command: 'listevents', description: t('cmd_listevents') },
      { command: 'credits', description: t('cmd_credits') },
    ];

    if (isGroup(ctx)){
      await bot.telegram.setMyCommands([], {
        scope: { type: 'chat', chat_id: chatId },
        language_code: forceLang,
      });

      await bot.telegram.setMyCommands(groupCommands, {
        scope: { type: 'chat', chat_id: chatId },
        language_code: forceLang,
      });
    }

    await bot.telegram.setMyCommands([], {
      scope: { type: 'default' },
      language_code: forceLang,
    });

    await bot.telegram.setMyCommands(privateCommands, {
      scope: { type: 'default' },
      language_code: forceLang,
    });

    await bot.telegram.setMyCommands([], {
      scope: { type: 'all_group_chats' },
      language_code: forceLang,
    });

    await bot.telegram.setMyCommands(groupCommands, {
      scope: { type: 'all_group_chats' },
      language_code: forceLang,
    });
  }
}
