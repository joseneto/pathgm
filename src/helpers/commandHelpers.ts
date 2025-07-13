import { getUserLang } from '../helpers/getUserLang';
import i18next from 'i18next';

export function getTranslation(ctx: any): [any, string] {
  const lang = getUserLang(ctx);
  const t = i18next.getFixedT(lang);
  return [t, lang];
}

export interface ParsedArgsWithTags {
  userTags: string[];
  remainingArgs: string[];
}

/**
 * Menu message for /importplayer command
 */
export function buildImportPlayerMenuMessage(t: any): string {
  return `${t('import_player_menu_prompt')}\n\n${t('import_player_instructions')}\n\n${t('quick_commands')}:\n<code>/importplayer https://pathbuilder2e.com/json.php?id=123456</code>\n<code>/importplayer 123456</code>`;
}

/**
 * Help message for /importplayer command
 */
export function getImportPlayerHelpMessage(t: any): string {
  return `
🧙‍♂️ <b>${t('cmd_importplayer')}</b>

${t('import_player_description')}

<b>📋 ${t('usage')}:</b>
<code>/importplayer [link_ou_id]</code>

<b>📖 ${t('examples')}:</b>
<code>/importplayer https://pathbuilder2e.com/json.php?id=123456</code>
<code>/importplayer 123456</code>

<b>⚙️ ${t('pathbuilder_setup')}:</b>
${t('pathbuilder_export_instructions')}

1. ${t('pathbuilder_step_1')}
2. ${t('pathbuilder_step_2')}
3. ${t('pathbuilder_step_3')}
4. ${t('pathbuilder_step_4')}

<b>🔗 ${t('supported_formats')}:</b>
• ${t('pathbuilder_link_format')}
• ${t('pathbuilder_id_format')}

${t('or_use_menu', { command: 'importplayer' }) || 'Or use /importplayer without parameters for the interactive menu.'}
`.trim();
}

/**
 * Menu message for /newplayer command
 */
export function buildNewPlayerMenuMessage(t: any): string {
  return `${t('newplayer_menu_prompt')}\n\n${t('newplayer_instructions')}\n\n${t('quick_commands')}:\n<code>/newplayer "Rurik" fighter 5</code>\n<code>/newplayer "Lyra" wizard 3 perception=12</code>\n<code>/newplayer "Theron" rogue 7 athletics=15 acrobatics=18</code>`;
}

/**
 * Help message for /newplayer command
 */
export function getNewPlayerHelpMessage(t: any): string {
  return `
🧙‍♂️ <b>${t('cmd_newplayer')}</b>

${t('newplayer_description')}

<b>📋 ${t('usage')}:</b>
<code>/newplayer &lt;nome&gt; &lt;classe&gt; &lt;nível&gt; [atributo=valor...]</code>

<b>📖 ${t('examples')}:</b>
<code>/newplayer "Rurik" fighter 5</code>
<code>/newplayer "Lyra" wizard 3 perception=12</code>
<code>/newplayer "Theron" rogue 7 athletics=15 acrobatics=18</code>
<code>/newplayer "Mago" wizard 5 level=8 fortitude=6 will=14</code>

<b>⚔️ ${t('character_classes')}:</b>
• fighter, wizard, cleric, rogue
• ranger, barbarian, bard, sorcerer
• paladin, druid, monk, oracle

<b>📊 ${t('level_range')}:</b>
• ${t('min_level')}: 1
• ${t('max_level')}: 20

<b>🎯 ${t('optional_attributes')}:</b>
• <b>name, alias, className, level:</b> ${t('character_basic_info')}
• <b>perception, fortitude, reflex, will:</b> ${t('character_saves_desc')} (-10 a 50)
• <b>skills:</b> ${t('character_skills_desc')} (-10 a 50)
  ${t('available_skills')}: acrobatics, arcana, athletics, crafting, deception, diplomacy, intimidation, medicine, nature, occultism, performance, religion, society, stealth, survival, thievery

<b>🎯 ${t('character_features')}:</b>
• ${t('basic_stats_initialized')}
• ${t('all_skills_zero')}
• ${t('auto_tags_applied')}
• ${t('ready_for_editing')}

<b>💡 ${t('tips')}:</b>
• ${t('tip_use_quotes_for_names')}
• ${t('tip_edit_after_creation')}
• ${t('tip_import_for_full_builds')}

${t('or_use_menu', { command: 'newplayer' }) || 'Or use /newplayer without parameters for the interactive menu.'}
`.trim();
}

/**
 * Menu message for /editplayer command
 */
export function buildEditPlayerMenuMessage(t: any): string {
  return `${t('editplayer_menu_prompt')}\n\n${t('editplayer_instructions')}\n\n${t('quick_commands')}:\n<code>/editplayer "Rurik" level=10 perception=5</code>\n<code>/editplayer "Rurik" acrobatics=10 athletics=12</code>\n<code>/editplayer "Lyra" fortitude=8 will=6 reflex=4</code>`;
}

/**
 * Help message for /editplayer command
 */
export function getEditPlayerHelpMessage(t: any): string {
  return `
🛠️ <b>${t('cmd_editplayer')}</b>

${t('editplayer_description')}

<b>📋 ${t('usage')}:</b>
<code>/editplayer &lt;nome&gt; &lt;atributo&gt;=&lt;valor&gt; [...]</code>

<b>📖 ${t('examples')}:</b>
<code>/editplayer "Rurik" level=10</code>
<code>/editplayer "Lyra" name="Nova Lyra" className=sorcerer</code>
<code>/editplayer "Theron" level=7 will=6 reflex=9</code>
<code>/editplayer "Mago" perception=5 fortitude=8</code>
<code>/editplayer "Rurik" acrobatics=12 athletics=15</code>

<b>🎯 ${t('editable_attributes')}:</b>
• <b>name:</b> ${t('player_name_desc')}
• <b>alias:</b> ${t('player_alias_desc')}
• <b>className:</b> ${t('player_class_desc')}
• <b>level:</b> ${t('player_level_desc')} (1-20)
• <b>perception:</b> ${t('player_perception_desc')} (-10 a 50)
• <b>fortitude:</b> ${t('player_fortitude_desc')} (-10 a 50)
• <b>reflex:</b> ${t('player_reflex_desc')} (-10 a 50)
• <b>will:</b> ${t('player_will_desc')} (-10 a 50)
• <b>skills:</b> ${t('player_skills_desc')} (-10 a 50)
  ${t('available_skills')}: acrobatics, arcana, athletics, crafting, deception, diplomacy, intimidation, medicine, nature, occultism, performance, religion, society, stealth, survival, thievery

<b>🔍 ${t('player_identification')}:</b>
• ${t('use_player_name')}: <code>"Nome do Personagem"</code>

<b>📊 ${t('multiple_updates')}:</b>
${t('multiple_updates_desc')}

<b>💡 ${t('tips')}:</b>
• ${t('tip_use_listplayers_for_ids')}
• ${t('tip_quotes_for_names_with_spaces')}
• ${t('tip_multiple_attributes_single_command')}

${t('or_use_menu', { command: 'editplayer' }) || 'Or use /editplayer without parameters for the interactive menu.'}
`.trim();
}

/**
 * Menu message for /cleardata command
 */
export function buildClearDataMenuMessage(t: any): string {
  return `${t('cleardata_menu_prompt')}\n\n${t('cleardata_instructions')}\n\n${t('quick_commands')}:\n<code>/cleardata all</code>\n<code>`;
}

/**
 * Help message for /cleardata command
 */
export function getClearDataHelpMessage(t: any): string {
  return `
🗑️ <b>${t('cmd_cleardata')}</b>

${t('cleardata_description')}

<b>📋 ${t('usage')}:</b>
<code>/cleardata [${t('entity_types').toLowerCase()}]</code>

<b>📖 ${t('examples')}:</b>
<code>/cleardata all</code>
<code>/cleardata npcs</code>
<code>/cleardata players,items,notes</code>
<code>/cleardata encounters,plots</code>

<b>🗂️ ${t('available_entities')}:</b>
• <b>notes:</b> ${t('entity_notes_desc')}
• <b>npcs:</b> ${t('entity_npcs_desc')}
• <b>encounters:</b> ${t('entity_encounters_desc')}
• <b>players:</b> ${t('entity_players_desc')}
• <b>plots:</b> ${t('entity_plots_desc')}
• <b>items:</b> ${t('entity_items_desc')}
• <b>regions:</b> ${t('entity_regions_desc')}
• <b>places:</b> ${t('entity_places_desc')}
• <b>events:</b> ${t('entity_events_desc')}

<b>⚠️ ${t('warning')}:</b>
${t('cleardata_warning')}

<b>💡 ${t('tips')}:</b>
• ${t('tip_comma_separated')}
• ${t('tip_all_keyword')}
• ${t('tip_irreversible_action')}

${t('or_use_menu', { command: 'cleardata' })}
`.trim();
}

export function getRollHelpMessage(t: any): string {
  return `
🎲 <b>${t('cmd_roll')}</b>

${t('roll_description')}

<b>${t('usage')}:</b>
<code>/roll "Player1,Player2" &lt;attribute&gt; [modifier]</code>

<b>${t('examples')}:</b>
<code>/roll "Rurik" perception</code>
<code>/roll "Lyra,Seelah" athletics +2</code>
<code>/roll "Ezren" diplomacy -1</code>

<b>${t('parameters')}:</b>
• <b>${t('players')}:</b> ${t('roll_players_desc')}
• <b>${t('attribute')}:</b> ${t('roll_attribute_desc')}
• <b>${t('modifier')}:</b> ${t('roll_modifier_desc')} (${t('optional')})

<b>🎯 ${t('supported_attributes')}:</b>
• <b>${t('saves')}:</b> fortitude, reflex, will
• <b>${t('skill_perception')}:</b> perception
• <b>${t('skills')}:</b> acrobatics, arcana, athletics, crafting, deception, diplomacy, intimidation, lore, medicine, nature, occultism, performance, religion, society, stealth, survival, thievery

<b>💡 ${t('tips')}:</b>
• ${t('tip_comma_separated_players')}
• ${t('tip_partial_names_allowed')}
• ${t('tip_alias_supported')}

${t('or_use_menu', { command: 'roll' })}
`.trim();
}

export function buildRollMenuMessage(t: any): string {
  return `
🎲 <b>${t('cmd_roll')}</b>

${t('roll_description')}

<b>${t('quick_commands')}:</b>
<code>/roll "Player" perception</code>
<code>/roll "P1,P2" athletics +2</code>

<b>🎯 ${t('common_rolls')}:</b>
• <b>${t('saves')}:</b> fortitude, reflex, will
• <b>${t('skills')}:</b> perception, athletics, stealth
• <b>${t('social')}:</b> diplomacy, deception, intimidation

${t('use_help_for_full_info', { command: '/roll' })}
`.trim();
}

export function getRollAllHelpMessage(t: any): string {
  return `
🎲 <b>${t('cmd_rollall')}</b>

${t('rollall_description')}

<b>${t('usage')}:</b>
<code>/rollall &lt;attribute&gt; [modifier]</code>

<b>${t('examples')}:</b>
<code>/rollall perception</code>
<code>/rollall athletics +2</code>
<code>/rollall stealth -1</code>

<b>${t('parameters')}:</b>
• <b>${t('attribute')}:</b> ${t('roll_attribute_desc')}
• <b>${t('modifier')}:</b> ${t('roll_modifier_desc')} (${t('optional')})

<b>🎯 ${t('supported_attributes')}:</b>
• <b>${t('saves')}:</b> fortitude, reflex, will
• <b>${t('skill_perception')}:</b> perception
• <b>${t('skills')}:</b> acrobatics, arcana, athletics, crafting, deception, diplomacy, intimidation, lore, medicine, nature, occultism, performance, religion, society, stealth, survival, thievery

<b>💡 ${t('tips')}:</b>
• ${t('tip_all_players_automatically')}
• ${t('tip_great_for_group_checks')}

${t('or_use_menu', { command: 'rollall' })}
`.trim();
}

export function buildRollAllMenuMessage(t: any): string {
  return `
🎲 <b>${t('cmd_rollall')}</b>

${t('rollall_description')}

<b>${t('quick_commands')}:</b>
<code>/rollall perception</code>
<code>/rollall athletics +2</code>

<b>🎯 ${t('common_group_rolls')}:</b>
• <b>${t('group_perception')}:</b> perception
• <b>${t('group_stealth')}:</b> stealth
• <b>${t('group_athletics')}:</b> athletics
• <b>${t('initiative')}:</b> perception

${t('use_help_for_full_info', { command: '/rollall' })}
`.trim();
}

export function getD20HelpMessage(t: any): string {
  return `
🎲 <b>${t('cmd_d20')}</b>

${t('d20_description')}

<b>${t('usage')}:</b>
<code>/d20 [modifier]</code>

<b>${t('examples')}:</b>
<code>/d20</code>
<code>/d20 +5</code>
<code>/d20 -2</code>

<b>${t('parameters')}:</b>
• <b>${t('modifier')}:</b> ${t('d20_modifier_desc')} (${t('optional')})

<b>💡 ${t('tips')}:</b>
• ${t('tip_simple_d20_roll')}
• ${t('tip_modifier_range')}
• ${t('tip_great_for_quick_rolls')}
`.trim();
}

/**
 * Help message for /listplayers command
 */
export function getListPlayersHelpMessage(t: any): string {
  return `
👥 <b>${t('cmd_listplayers')}</b>

${t('listplayers_description')}

<b>${t('usage')}:</b>
<code>/listplayers [--class &lt;class&gt;] [--ancestry &lt;ancestry&gt;] [--level &lt;level&gt;] [help]</code>

<b>${t('examples')}:</b>
<code>/listplayers</code> - ${t('list_all_players')}
<code>/listplayers --class fighter</code> - ${t('filter_fighter_class')}
<code>/listplayers --ancestry elf --level 5</code> - ${t('filter_elf_level5')}

<b>🔍 ${t('filtering_options')}:</b>
<b><code>--class &lt;class&gt;</code>:</b> ${t('filter_by_class_desc')}
<b><code>--ancestry &lt;ancestry&gt;</code>:</b> ${t('filter_by_ancestry_desc')}
<b><code>--level &lt;1-20&gt;</code>:</b> ${t('filter_by_level_desc')}

`.trim();
}
