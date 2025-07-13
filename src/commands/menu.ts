import { escapeMarkdown } from '../utils/escapeMarkdown';
import { getUserLang } from '../helpers/getUserLang';
import i18next from 'i18next';
import { isGroup } from '../helpers/isGroup';

export async function menuCommand(ctx: any) {
  const lang = getUserLang(ctx);
  const t = i18next.getFixedT(lang);

  const groupCommands = [
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

  const privateCommands = [
    `🎭 /gennpc – ${t('cmd_gennpc')}`,
    `🎯 /genplot – ${t('cmd_genplot')}`,
    `☠️ /genencounter – ${t('cmd_genencounter')}`,
    `📦 /genitem – ${t('cmd_genitem')}`,
    `🏛️ /genplace – ${t('cmd_genplace')}`,
    `🗺️ /genregion – ${t('cmd_genregion')}`,
    `⚡ /genevent – ${t('cmd_genevent')}`,
    `🔗 /gencontextual – ${t('cmd_gencontextual')}`,
    `🎤 /narrate – ${t('cmd_narrate')}`,
    `📖 /askrule – ${t('cmd_askrule')}`,
    `📝 /note – ${t('cmd_note')}`,
    `🗑️ /cleardata – ${t('cmd_cleardata')}`,
    `📋 /listnotes – ${t('cmd_listnotes')}`,
    `🎭 /listnpcs – ${t('cmd_listnpcs')}`,
    `🎯 /listplots – ${t('cmd_listplots')}`,
    `☠️ /listencounters – ${t('cmd_listencounters')}`,
    `📦 /listitems – ${t('cmd_listitems')}`,
    `🏛️ /listplaces – ${t('cmd_listplaces')}`,
    `🗺️ /listregions – ${t('cmd_listregions')}`,
    `⚡ /listevents – ${t('cmd_listevents')}`,
    `💰 /credits – ${t('cmd_credits')}`,
  ];

  const allCommands = isGroup(ctx) ? groupCommands : [...privateCommands, ...groupCommands];

  const header = isGroup(ctx)
    ? t('menu_group_title')
    : t('menu_private_title');

  const text = `${header}\n\n${allCommands.join('\n')}`;

  await ctx.replyWithMarkdownV2(escapeMarkdown(text));
}