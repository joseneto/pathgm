import { escapeMarkdown } from '../utils/escapeMarkdown';
import { getUserLang } from '../helpers/getUserLang';
import i18next from 'i18next';
import { isGroup } from '../helpers/isGroup';

export async function menuCommand(ctx: any) {
  const lang = getUserLang(ctx);
  const t = i18next.getFixedT(lang);

  const allCommands = [
    `🎯 /d20 – ${t('cmd_d20')}`,
    `🎲 /roll – ${t('cmd_roll')}`,
    `🎲 /rollall – ${t('cmd_rollall')}`,
    `🧙‍♂️ /genplayer – ${t('cmd_genplayer')}`,
    `🧙‍♂️ /newplayer – ${t('cmd_newplayer')}`,
    `📥 /importplayer – ${t('cmd_importplayer')}`,
    `🔄 /syncplayers – ${t('cmd_syncplayers')}`,
    `🛠️ /editplayer – ${t('cmd_editplayer')}`,
    `🧑‍🤝‍🧑 /listplayers – ${t('cmd_listplayers')}`,
    `📜 /menu – ${t('cmd_menu')}`,
    `📘 /help – ${t('cmd_help')}`,
    `ℹ️ /about – ${t('cmd_about')}`,
  ];

  const header = isGroup(ctx)
    ? t('menu_group_title')
    : t('menu_private_title');

  const text = `${header}\n\n${allCommands.join('\n')}`;

  await ctx.replyWithMarkdownV2(escapeMarkdown(text));
}
