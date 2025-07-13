import i18next from 'i18next';
import { Telegraf } from 'telegraf';
import { getEffectiveTelegramId } from './getEffectiveTelegramId';
import { isGroup } from './isGroup';
const languages = ['en', 'pt'];

export async function initDynamicCommands(bot: Telegraf<any>, ctx: any) {
  const chatId = getEffectiveTelegramId(ctx);
  for (const forceLang of languages) {
    const t = i18next.getFixedT(forceLang);
    const commands = [
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

    if (isGroup(ctx)){
      await bot.telegram.setMyCommands([], {
        scope: { type: 'chat', chat_id: chatId },
        language_code: forceLang,
      });

      await bot.telegram.setMyCommands(commands, {
        scope: { type: 'chat', chat_id: chatId },
        language_code: forceLang,
      });
    }

    await bot.telegram.setMyCommands([], {
      scope: { type: 'default' },
      language_code: forceLang,
    });

    await bot.telegram.setMyCommands(commands, {
      scope: { type: 'default' },
      language_code: forceLang,
    });

    await bot.telegram.setMyCommands([], {
      scope: { type: 'all_group_chats' },
      language_code: forceLang,
    });

    await bot.telegram.setMyCommands(commands, {
      scope: { type: 'all_group_chats' },
      language_code: forceLang,
    });
  }
}
