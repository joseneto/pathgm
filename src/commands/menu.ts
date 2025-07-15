import { escapeMarkdown } from '../utils/escapeMarkdown';
import { isGroup } from '../helpers/isGroup';
import { getTranslation } from '../helpers/commandHelpers';

export async function menuCommand(ctx: any) {
  const [t] = getTranslation(ctx);

  const allCommands = [
    `🚀 /pathgm – ${t('cmd_start')}`,
    `🎯 /d20 – ${t('cmd_d20')}`,
    `🎲 /roll – ${t('cmd_roll')}`,
    `🎲 /rollall – ${t('cmd_rollall')}`,
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
