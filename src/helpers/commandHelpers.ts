// src/helpers/commandHelpers.ts - UPDATED with --in parameter documentation

import { getUserLang } from '../helpers/getUserLang';
import i18next from 'i18next';
import { Markup } from 'telegraf';
import { CREDIT_COSTS } from '../config/credits';

/**
 * Util para pegar tradução [t, lang] - reutilizável
 */
export function getTranslation(ctx: any): [any, string] {
  const lang = getUserLang(ctx);
  const t = i18next.getFixedT(lang);
  return [t, lang];
}

/**
 * Helper para criar botões de nível (reutilizável em qualquer comando)
 */
export function createLevelButtons(callbackPrefix: string, maxLevel: number = 20) {
  const levelButtons = [];

  // Botões de 1-maxLevel agrupados de 5 em 5
  for (let i = 1; i <= maxLevel; i += 5) {
    const row = [];
    for (let j = i; j < i + 5 && j <= maxLevel; j++) {
      row.push(Markup.button.callback(`${j}`, `${callbackPrefix}_${j}`));
    }
    levelButtons.push(row);
  }

  return levelButtons;
}

/**
 * Helper para criar botões de terreno (para encounter, etc.)
 */
export function createTerrainButtons(callbackPrefix: string, t: any) {
  return [
    [
      Markup.button.callback(t('encounter_type_forest'), `${callbackPrefix}_forest`),
      Markup.button.callback(t('encounter_type_cave'), `${callbackPrefix}_cave`)
    ],
    [
      Markup.button.callback(t('encounter_type_desert'), `${callbackPrefix}_desert`),
      Markup.button.callback(t('encounter_type_city'), `${callbackPrefix}_city`)
    ],
    [
      Markup.button.callback(t('encounter_type_mountains'), `${callbackPrefix}_mountains`)
    ]
  ];
}

/**
 * Helper para criar botões de tipo de item (para genitem, etc.)
 */
export function createItemTypeButtons(callbackPrefix: string, t: any) {
  return [
    [
      Markup.button.callback(t('item_type_weapon'), `${callbackPrefix}_weapon`),
      Markup.button.callback(t('item_type_armor'), `${callbackPrefix}_armor`)
    ],
    [
      Markup.button.callback(t('item_type_consumable'), `${callbackPrefix}_consumable`),
      Markup.button.callback(t('item_type_accessory'), `${callbackPrefix}_accessory`)
    ]
  ];
}

export interface ParsedArgsWithTags {
  userTags: string[];
  remainingArgs: string[];
}

/**
 * Parse tags do comando (começam com #) e retorna args limpos
 * @param args Array de argumentos do comando
 * @param maxTags Máximo de tags permitidas (default: 5)
 * @returns Objeto com userTags e remainingArgs
 */
export function parseUserTags(args: string[], maxTags: number = 5): ParsedArgsWithTags {
  const userTags: string[] = [];
  const remainingArgs: string[] = [];
  
  args.forEach(arg => {
    if (arg.startsWith('#') && userTags.length < maxTags) {
      // Remove # e normaliza (lowercase, trim)
      const cleanTag = arg.substring(1).toLowerCase().trim();
      if (cleanTag.length > 0) {
        userTags.push(cleanTag);
      }
    } else if (!arg.startsWith('#')) {
      remainingArgs.push(arg);
    }
  });
  
  return { userTags, remainingArgs };
}

/**
 * Parse flexível com callback para regras específicas de cada comando
 * @param args Array de argumentos do comando
 * @param parseCallback Função que recebe remainingArgs e retorna objeto parseado
 * @param maxTags Máximo de tags permitidas
 * @returns Objeto combinado com userTags e resultado do callback
 */
export function parseArgsWithTags<T>(
  args: string[], 
  parseCallback: (remainingArgs: string[]) => T,
  maxTags: number = 5
): T & { userTags?: string[] } {
  const { userTags, remainingArgs } = parseUserTags(args, maxTags);
  const parsedArgs = parseCallback(remainingArgs);
  
  return {
    ...parsedArgs,
    userTags: userTags.length > 0 ? userTags : undefined
  };
}

export function getGenContextualHelpMessage(t: any): string {
  return `
🔗 <b>${t('cmd_gencontextual')} (${CREDIT_COSTS.TEXT_GENERATION}💎)</b>

${t('gencontextual_description')}

<b>${t('usage')}:</b>
<code>/gencontextual --npc "NPC Name" [#tags] [--in "Place Name"]</code>
<code>/gencontextual -n "Partial Name" [#tag1 #tag2] [--in "Location"]</code>

<b>${t('examples')}:</b>
<code>/gencontextual --npc "Garrick Shadowblade"</code>
<code>/gencontextual -n Garrick #demon #ritual</code>
<code>/gencontextual John #merchant --in "Waterdeep"</code>
<code>/gencontextual "Sarah the Healer" --in "Temple District"</code>

<b>🎯 ${t('contextual_features')}:</b>
- <b>${t('smart_search')}:</b> ${t('smart_search_desc')}
- <b>${t('tag_expansion')}:</b> ${t('tag_expansion_desc')}
- <b>${t('relationship_replacement')}:</b> ${t('relationship_replacement_desc')}
- <b>${t('location_context')}:</b> ${t('location_context_desc')}

<b>🌍 ${t('location_integration')}:</b>
${t('gencontextual_location_help')}

<b>🔍 ${t('gencontextual_fuzzy_matching')}:</b>
${t('gencontextual_fuzzy_description')}

<b>🏷️ ${t('gencontextual_tags_feature')}:</b>
${t('gencontextual_tags_description')}

<b>⚠️ ${t('warning')}:</b>
${t('gencontextual_warning_replacement')}

<b>${t('supported_types')}:</b>
- <b><code>--npc</code></b> ${t('or')} <b><code>-n</code></b>: ${t('npcs')}
- ${t('gencontextual_other_types_soon')}

${t('or_use_menu', { command: 'gencontextual' })}
`.trim();
}

export function getGenPlotHelpMessage(t: any): string {
  return `
🎯 <b>${t('cmd_genplot')}</b>

<b>${t('usage')}:</b>
<code>/genplot [${t('theme').toLowerCase()}] [${t('difficulty').toLowerCase()}] [#tags] [--in "Place"] [--for-item "Item"]</code>

<b>${t('examples')}:</b>
<code>/genplot mystery</code>
<code>/genplot political complex</code>
<code>/genplot adventure #dungeon #treasure</code>
<code>/genplot mystery --in "Golden Tavern"</code>
<code>/genplot adventure --for-item "Magic Sword"</code>
<code>/genplot social --in "Royal Palace" --for-item "Crown Jewel" #noble</code>

<b>${t('parameters')}:</b>
- <b>${t('theme')}:</b> <code>mystery</code>, <code>political</code>, <code>adventure</code>, <code>social</code>, <code>combat</code>, <code>magical</code>, <code>horror</code>
- <b>${t('difficulty')}:</b> <code>simple</code> (${t('plot_difficulty_simple_desc')}) ${t('or')} <code>complex</code> (${t('plot_difficulty_complex_desc')})
- <b>Tags:</b> #tag1 #tag2 (${t('optional_for_reference')})
- <b><code>--in</code> "Place":</b> ${t('plot_location_help')} (${t('optional')})
- <b><code>--for-item</code> "Item":</b> ${t('plot_item_help')} (${t('optional')})

<b>🏛️ ${t('location_integration')}:</b>
${t('plot_location_help')}

<b>💎 ${t('item_integration')}:</b>
${t('plot_item_help')}

<b>🏷️ Tags:</b>
${t('plot_tags_help_desc')}

<b>🔗 ${t('combined_usage')}:</b>
${t('plot_combined_usage_desc')}

${t('or_use_menu', { command: 'genplot' })}
`.trim();
}

export function getGenRegionHelpMessage(t: any) {
  return `
🏰 <b>${t('cmd_genregion')}</b>

${t('genregion_description')}

<b>${t('usage')}:</b>
<code>/genregion "Region Name" [#tags] [--type &lt;type&gt;] [--threat &lt;level&gt;] [--climate &lt;climate&gt;]</code>

<b>${t('examples')}:</b>
<code>/genregion "Kingdom of Thalassia"</code>
<code>/genregion "Flaming Abyss" #demon #fire --type plane --threat 5</code>
<code>/genregion "Northern Forests" #elven --type wilderness --climate temperate</code>
<code>/genregion "Dark Realm" --type underworld --threat 4 --climate desert</code>

<b>${t('parameters')}:</b>
- <b>${t('region_name')}:</b> ${t('region_name_desc')} (${t('required')}, ${t('use_quotes_if_spaces')})
- <b><code>--type</code>:</b> kingdom, wilderness, plane, underworld (${t('default')}: kingdom)
- <b><code>--threat</code>:</b> ${t('threat_level_range')} (1=${t('peaceful')}, 5=${t('apocalyptic')}, ${t('default')}: 2)
- <b><code>--climate</code>:</b> tropical, temperate, arctic, desert, mountainous, coastal
- <b><code>#tags</code>:</b> ${t('region_themes_characteristics')}

<b>🏷️ ${t('region_types')}:</b>
- <b>kingdom:</b> ${t('region_type_kingdom_desc')}
- <b>wilderness:</b> ${t('region_type_wilderness_desc')}
- <b>plane:</b> ${t('region_type_plane_desc')}
- <b>underworld:</b> ${t('region_type_underworld_desc')}

${t('or_use_menu', { command: 'genregion' })}
`.trim();
}

export function getGenPlaceHelpMessage(t: any): string {
  return `
🏗️ <b>${t('cmd_genplace')}</b>

${t('genplace_description')}

<b>${t('usage')}:</b>
<code>/genplace --type &lt;type&gt; "Place Name" --in "Region Name" [#tags] [options]</code>

<b>${t('examples')}:</b>
<code>/genplace --type city "Greenstone" --in "Kingdom of Thalassia" #commercial #port</code>
<code>/genplace --type dungeon "Lost Tomb" --levels 3 --danger 4</code>
<code>/genplace --type village "Greenvale" --in "Northern Forests" --population 80</code>
<code>/genplace --type fortress "Stone Fort" #military --garrison 200</code>

<b>🏗️ ${t('place_types')}:</b>
- <b>${t('settlements')}:</b> city, town, village
- <b>${t('dungeons')}:</b> dungeon, ruins, tomb, cave
- <b>${t('natural')}:</b> forest, mountain, swamp, desert, lake
- <b>${t('structures')}:</b> fortress, temple, tower, bridge

<b>⚙️ ${t('place_options')}:</b>
- <b><code>--in "Region"</code>:</b> ${t('place_in_region')}
- <b><code>--population N</code>:</b> ${t('place_population')} (${t('settlements')})
- <b><code>--wealth 1-5</code>:</b> ${t('place_wealth')} (${t('settlements')})
- <b><code>--levels N</code>:</b> ${t('place_levels')} (${t('dungeons')})
- <b><code>--danger 1-5</code>:</b> ${t('place_danger')}
- <b><code>--size small|medium|large</code>:</b> ${t('place_size')}

<b>🌍 ${t('contextual_integration')}:</b>
${t('place_contextual_help')}

<b>🏷️ ${t('tags')}:</b>
${t('place_tags_help')}

${t('or_use_menu', { command: 'genplace' })}
`.trim();
}

// ✅ UPDATED: getGenNpcHelpMessage with --in parameter (English examples)
export function getGenNpcHelpMessage(t: any): string {
  return `
🎭 <b>${t('cmd_gennpc')}</b>

<b>${t('usage')}:</b>
<code>/gennpc [type] [importance] [level] [#tags] [--in "Place Name"] [--contextual]</code>

<b>${t('examples')}:</b>
<code>/gennpc friendly common</code>
<code>/gennpc enemy important 5</code>
<code>/gennpc friendly important #merchant #restov</code>
<code>/gennpc friendly important #mayor --in "Greenstone"</code>
<code>/gennpc enemy common #bandit --in "King's Road"</code>
<code>/gennpc enemy important --contextual #cult --in "Shadow Temple"</code>

<b>${t('parameters')}:</b>
- <b>${t('type')}:</b> <code>friendly</code> (${t('npc_type_friendly_desc') || 'ally'}) ${t('or')} <code>enemy</code> (${t('npc_type_enemy_desc') || 'enemy'})
- <b>${t('importance')}:</b> <code>common</code> (${t('npc_importance_common_desc') || 'common'}) ${t('or')} <code>important</code> (${t('npc_importance_important_desc') || 'important'})
- <b>${t('level')}:</b> 1-20 (${t('optional_default_1') || 'optional, default: 1'})
- <b>Tags:</b> #tag1 #tag2 (${t('optional_for_reference') || 'optional, for reference'})
- <b><code>--in</code> "Place":</b> ${t('npc_place_parameter_desc') || 'Generate NPC for specific location'} (${t('optional') || 'optional'})
- <b><code>--contextual</code>:</b> ${t('contextual_flag_desc') || 'Uses existing NPCs as context'} (${t('costs_1_credit') || `costs ${CREDIT_COSTS.TEXT_GENERATION}💎`})

<b>🏗️ ${t('place_integration')}:</b>
${t('npc_place_integration_help')}

<b>🧠 ${t('contextual_generation')}:</b>
${t('contextual_help')}

<b>🏷️ Tags:</b>
${t('tags_help_desc') || 'Tags are automatically included in the generated NPC and used to find relationships with other campaign NPCs.'}

${t('or_use_menu', { command: 'gennpc' })}
`.trim();
}

/**
 * Helper para criar menu de NPC internacionalizado (English examples)
 */
export function buildNpcMenuMessage(t: any): string {
  return `${t('npc_type_prompt')}\n\n${t('quick_commands')}:\n<code>/gennpc friendly common</code>\n<code>/gennpc enemy important 5</code>\n<code>/gennpc friendly common #mage</code>\n<code>/gennpc friendly important #mayor --in "Greenstone"</code>\n\n🧠 <b>${t('contextual_generation')}:</b>\n<code>/gennpc enemy important --contextual #cult</code>\n<i>${t('contextual_help')}</i>`;
}

/**
 * Help message for /listnpcs command
 */
export function getListNpcsHelpMessage(t: any): string {
  return `
👥 <b>${t('cmd_listnpcs')}</b>

${t('listnpcs_description')}

<b>${t('usage')}:</b>
<code>/listnpcs [#tags] [help]</code>

<b>${t('examples')}:</b>
<code>/listnpcs</code> - ${t('list_all_npcs')}
<code>/listnpcs #cult</code> - ${t('filter_by_single_tag')}
<code>/listnpcs #merchant #important</code> - ${t('filter_by_multiple_tags')}
<code>/listnpcs #human #noble #politician</code> - ${t('complex_filter_example')}

<b>🔍 ${t('search_features')}:</b>
- <b>${t('tag_filtering')}:</b> ${t('tag_filtering_desc')}
- <b>${t('relevance_scoring')}:</b> ${t('relevance_scoring_desc')}
- <b>${t('smart_pagination')}:</b> ${t('smart_pagination_desc')}

<b>🏷️ ${t('tag_system')}:</b>
- ${t('auto_generated_tags')}: ${t('auto_generated_tags_desc')}
- ${t('manual_tags')}: ${t('manual_tags_desc')}
- ${t('minimum_matches')}: ${t('minimum_matches_desc')}

<b>📱 ${t('interface')}:</b>
- ${t('triple_row_layout')}: ${t('triple_row_layout_desc')}
- ${t('quick_actions')}: ${t('quick_actions_desc')}
- ${t('navigation')}: ${t('navigation_desc')}

<b>💡 ${t('tips')}:</b>
- ${t('tip_combine_tags')}
- ${t('tip_use_specific_tags')}
- ${t('tip_check_autotags')}
`.trim();
}

/**
 * Help message for /listregions command
 */
export function getListRegionsHelpMessage(t: any): string {
  return `
🏰 <b>${t('cmd_listregions')}</b>

${t('listregions_description')}

<b>${t('usage')}:</b>
<code>/listregions [#tags] [--type &lt;type&gt;] [--threat &lt;level&gt;] [help]</code>

<b>${t('examples')}:</b>
<code>/listregions</code> - ${t('list_all_regions')}
<code>/listregions #maritime #commercial</code> - ${t('filter_by_tags')}
<code>/listregions --type kingdom</code> - ${t('filter_by_type')}
<code>/listregions --threat 3</code> - ${t('filter_by_threat')}
<code>/listregions #elven --type wilderness --threat 2</code> - ${t('combined_filters')}

<b>🗺️ ${t('region_types')}:</b>
- <b><code>kingdom</code>:</b> ${t('region_type_kingdom_desc')}
- <b><code>wilderness</code>:</b> ${t('region_type_wilderness_desc')}
- <b><code>plane</code>:</b> ${t('region_type_plane_desc')}
- <b><code>continent</code>:</b> ${t('region_type_continent_desc')}
- <b><code>underworld</code>:</b> ${t('region_type_underworld_desc')}

<b>⚡ ${t('threat_levels')}:</b>
- <b>1:</b> ${t('threat_level_1_desc')}
- <b>2:</b> ${t('threat_level_2_desc')}
- <b>3:</b> ${t('threat_level_3_desc')}
- <b>4:</b> ${t('threat_level_4_desc')}
- <b>5:</b> ${t('threat_level_5_desc')}

<b>🔍 ${t('advanced_features')}:</b>
- ${t('tag_search')}: ${t('tag_search_desc')}
- ${t('type_filtering')}: ${t('type_filtering_desc')}
- ${t('threat_filtering')}: ${t('threat_filtering_desc')}
- ${t('combined_search')}: ${t('combined_search_desc')}

<b>💡 ${t('tips')}:</b>
- ${t('tip_use_threat_filter')}
- ${t('tip_combine_type_tags')}
- ${t('tip_organize_by_threat')}
`.trim();
}

/**
 * Help message for /listplaces command
 */
export function getListPlacesHelpMessage(t: any): string {
  return `
🏘️ <b>${t('cmd_listplaces')}</b>

${t('listplaces_description')}

<b>${t('usage')}:</b>
<code>/listplaces [#tags] [--in "Region Name"] [--type &lt;type&gt;] [help]</code>

<b>${t('examples')}:</b>
<code>/listplaces</code> - ${t('list_all_places')}
<code>/listplaces --in "Kingdom of Thalassia"</code> - ${t('filter_by_region')}
<code>/listplaces --type city</code> - ${t('filter_by_place_type')}
<code>/listplaces #commercial #port</code> - ${t('filter_by_tags')}
<code>/listplaces --in "Northern Forests" --type village #rural</code> - ${t('complex_place_filter')}

<b>🏗️ ${t('place_types')}:</b>
- <b>${t('settlements')}:</b> city, town, village
- <b>${t('dungeons')}:</b> dungeon, ruins, tomb, cave
- <b>${t('natural_features')}:</b> forest, mountain, swamp, desert, lake
- <b>${t('structures')}:</b> fortress, temple, tower, bridge, portal

<b>🔍 ${t('filtering_options')}:</b>
- <b><code>--in "Region"</code>:</b> ${t('filter_by_region_desc')}
- <b><code>--type &lt;type&gt;</code>:</b> ${t('filter_by_type_desc')}
- <b><code>#tags</code>:</b> ${t('filter_by_tags_desc')}

<b>🌍 ${t('hierarchical_structure')}:</b>
${t('places_belong_to_regions')}

<b>📱 ${t('interface_features')}:</b>
- ${t('region_context')}: ${t('region_context_desc')}
- ${t('type_indicators')}: ${t('type_indicators_desc')}
- ${t('quick_navigation')}: ${t('quick_navigation_desc')}

<b>💡 ${t('tips')}:</b>
- ${t('tip_explore_by_region')}
- ${t('tip_filter_by_type')}
- ${t('tip_use_combined_filters')}
`.trim();
}

/**
 * Help message for /listplots command
 */
export function getListPlotsHelpMessage(t: any): string {
  return `
🎯 <b>${t('cmd_listplots')}</b>

${t('listplots_description')}

<b>${t('usage')}:</b>
<code>/listplots [#tags] [help]</code>

<b>${t('examples')}:</b>
<code>/listplots</code> - ${t('list_all_plots')}
<code>/listplots #mystery</code> - ${t('filter_mystery_plots')}
<code>/listplots #political #urban</code> - ${t('filter_political_urban')}
<code>/listplots #horror #forest #supernatural</code> - ${t('complex_plot_filter')}

<b>🎭 ${t('plot_themes')}:</b>
- <b>mystery:</b> ${t('mystery_plots_desc')}
- <b>political:</b> ${t('political_plots_desc')}
- <b>adventure:</b> ${t('adventure_plots_desc')}
- <b>social:</b> ${t('social_plots_desc')}
- <b>combat:</b> ${t('combat_plots_desc')}
- <b>magical:</b> ${t('magical_plots_desc')}
- <b>horror:</b> ${t('horror_plots_desc')}

<b>🔍 ${t('search_capabilities')}:</b>
- ${t('theme_based_search')}: ${t('theme_based_search_desc')}
- ${t('complexity_filtering')}: ${t('complexity_filtering_desc')}
- ${t('npc_connections')}: ${t('npc_connections_desc')}

<b>📚 ${t('plot_information')}:</b>
- ${t('hook_and_twist')}: ${t('hook_and_twist_desc')}
- ${t('suggested_npcs')}: ${t('suggested_npcs_desc')}
- ${t('related_content')}: ${t('related_content_desc')}

<b>💡 ${t('tips')}:</b>
- ${t('tip_combine_themes')}
- ${t('tip_check_npc_suggestions')}
- ${t('tip_use_for_inspiration')}
`.trim();
}

/**
 * Help message for general listing features
 */
export function getListingFeaturesHelp(t: any): string {
  return `
📋 <b>${t('listing_features_title')}</b>

<b>🔍 ${t('universal_search')}:</b>
- ${t('tag_based_filtering')}: ${t('tag_based_filtering_desc')}
- ${t('fuzzy_matching')}: ${t('fuzzy_matching_desc')}
- ${t('relevance_scoring')}: ${t('relevance_scoring_desc')}

<b>📱 ${t('interface_design')}:</b>
- ${t('triple_row_layout')}: ${t('triple_row_layout_desc')}
- ${t('visual_separators')}: ${t('visual_separators_desc')}
- ${t('quick_actions')}: ${t('quick_actions_desc')}

<b>⚡ ${t('performance')}:</b>
- ${t('optimized_pagination')}: ${t('optimized_pagination_desc')}
- ${t('smart_caching')}: ${t('smart_caching_desc')}
- ${t('fast_search')}: ${t('fast_search_desc')}
`.trim();
}

/**
 * Help message for /listnotes command
 */
export function getListNotesHelpMessage(t: any): string {
  return `
📝 <b>${t('cmd_listnotes')}</b>

${t('listnotes_description')}

<b>${t('usage')}:</b>
<code>/listnotes [#tags] [--session "Session Name"] [help]</code>

<b>${t('examples')}:</b>
<code>/listnotes</code> - ${t('list_all_notes')}
<code>/listnotes #important</code> - ${t('filter_important_notes')}
<code>/listnotes #combat #strategy</code> - ${t('filter_combat_strategy')}
<code>/listnotes --session "Chapter 1"</code> - ${t('filter_by_session')}
<code>/listnotes #npc #secrets --session "Intrigue Arc"</code> - ${t('complex_note_filter')}

<b>📋 ${t('note_categories')}:</b>
- <b>session:</b> ${t('session_notes_desc')}
- <b>important:</b> ${t('important_notes_desc')}
- <b>combat:</b> ${t('combat_notes_desc')}
- <b>story:</b> ${t('story_notes_desc')}
- <b>secrets:</b> ${t('secrets_notes_desc')}
- <b>npc:</b> ${t('npc_notes_desc')}
- <b>location:</b> ${t('location_notes_desc')}

<b>🔍 ${t('filtering_options')}:</b>
- <b><code>--session "Name"</code>:</b> ${t('filter_by_session_desc')}
- <b><code>#tags</code>:</b> ${t('filter_by_tags_desc')}

<b>📱 ${t('interface_features')}:</b>
- ${t('session_context')}: ${t('session_context_desc')}
- ${t('tag_indicators')}: ${t('tag_indicators_desc')}
- ${t('quick_navigation')}: ${t('quick_navigation_desc')}

<b>💡 ${t('tips')}:</b>
- ${t('tip_organize_by_session')}
- ${t('tip_use_descriptive_tags')}
- ${t('tip_combine_session_and_tags')}
`.trim();
}

/**
 * Help message for /listitems command
 */
export function getListItemsHelpMessage(t: any): string {
  return `
📦 <b>${t('cmd_listitems')}</b>

${t('listitems_description')}

<b>${t('usage')}:</b>
<code>/listitems [#tags] [--type &lt;type&gt;] [--rarity &lt;rarity&gt;] [--level &lt;level&gt;] [help]</code>

<b>${t('examples')}:</b>
<code>/listitems</code> - ${t('list_all_items')}
<code>/listitems #fire</code> - ${t('filter_fire_items')}
<code>/listitems #weapon #magic</code> - ${t('filter_magic_weapons')}
<code>/listitems --type armor --rarity rare</code> - ${t('filter_rare_armor')}
<code>/listitems --level 10 #consumable</code> - ${t('filter_level_consumables')}
<code>/listitems #healing #potion --rarity uncommon</code> - ${t('complex_item_filter')}

<b>⚔️ ${t('item_types')}:</b>
- <b>weapon:</b> ${t('weapon_items_desc')}
- <b>armor:</b> ${t('armor_items_desc')}
- <b>consumable:</b> ${t('consumable_items_desc')}
- <b>accessory:</b> ${t('accessory_items_desc')}
- <b>treasure:</b> ${t('treasure_items_desc')}
- <b>tool:</b> ${t('tool_items_desc')}
- <b>material:</b> ${t('material_items_desc')}

<b>💎 ${t('rarity_levels')}:</b>
- <b>common:</b> ${t('common_rarity_desc')}
- <b>uncommon:</b> ${t('uncommon_rarity_desc')}
- <b>rare:</b> ${t('rare_rarity_desc')}
- <b>very-rare:</b> ${t('very_rare_rarity_desc')}
- <b>legendary:</b> ${t('legendary_rarity_desc')}
- <b>artifact:</b> ${t('artifact_rarity_desc')}

<b>🔍 ${t('filtering_options')}:</b>
- <b><code>--type &lt;type&gt;</code>:</b> ${t('filter_by_type_desc')}
- <b><code>--rarity &lt;rarity&gt;</code>:</b> ${t('filter_by_rarity_desc')}
- <b><code>--level &lt;1-20&gt;</code>:</b> ${t('filter_by_level_desc')}
- <b><code>#tags</code>:</b> ${t('filter_by_tags_desc')}

<b>📱 ${t('interface_features')}:</b>
- ${t('type_and_level')}: ${t('type_and_level_desc')}
- ${t('rarity_indicators')}: ${t('rarity_indicators_desc')}
- ${t('tag_matching')}: ${t('tag_matching_desc')}

<b>💡 ${t('tips')}:</b>
- ${t('tip_combine_filters')}
- ${t('tip_use_level_ranges')}
- ${t('tip_check_item_effects')}
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
<code>/listplayers [#tags] [--class &lt;class&gt;] [--ancestry &lt;ancestry&gt;] [--level &lt;level&gt;] [--status &lt;status&gt;] [help]</code>

<b>${t('examples')}:</b>
<code>/listplayers</code> - ${t('list_all_players')}
<code>/listplayers #tank</code> - ${t('filter_tank_players')}
<code>/listplayers --class fighter</code> - ${t('filter_fighter_class')}
<code>/listplayers --ancestry elf --level 5</code> - ${t('filter_elf_level5')}
<code>/listplayers --status inactive</code> - ${t('filter_inactive_players')}
<code>/listplayers #healer #cleric --class cleric</code> - ${t('complex_player_filter')}

<b>⚔️ ${t('character_classes')}:</b>
- <b>fighter:</b> ${t('fighter_class_desc')}
- <b>wizard:</b> ${t('wizard_class_desc')}
- <b>cleric:</b> ${t('cleric_class_desc')}
- <b>rogue:</b> ${t('rogue_class_desc')}
- <b>ranger:</b> ${t('ranger_class_desc')}
- <b>barbarian:</b> ${t('barbarian_class_desc')}
- <b>bard:</b> ${t('bard_class_desc')}
- <b>sorcerer:</b> ${t('sorcerer_class_desc')}

<b>🧬 ${t('ancestries')}:</b>
- <b>human:</b> ${t('human_ancestry_desc')}
- <b>elf:</b> ${t('elf_ancestry_desc')}
- <b>dwarf:</b> ${t('dwarf_ancestry_desc')}
- <b>halfling:</b> ${t('halfling_ancestry_desc')}
- <b>gnome:</b> ${t('gnome_ancestry_desc')}
- <b>goblin:</b> ${t('goblin_ancestry_desc')}

<b>📊 ${t('player_status')}:</b>
- <b>active:</b> ${t('active_status_desc')}
- <b>inactive:</b> ${t('inactive_status_desc')}
- <b>retired:</b> ${t('retired_status_desc')}
- <b>dead:</b> ${t('dead_status_desc')}

<b>🔍 ${t('filtering_options')}:</b>
<b><code>--class &lt;class&gt;</code>:</b> ${t('filter_by_class_desc')}
<b><code>--ancestry &lt;ancestry&gt;</code>:</b> ${t('filter_by_ancestry_desc')}
<b><code>--level &lt;1-20&gt;</code>:</b> ${t('filter_by_level_desc')}
<b><code>--status &lt;status&gt;</code>:</b> ${t('filter_by_status_desc')}
<b><code>#tags</code>:</b> ${t('filter_by_tags_desc')}

<b>📱 ${t('interface_features')}:</b>
- ${t('class_and_ancestry')}: ${t('class_and_ancestry_desc')}
- ${t('level_indicators')}: ${t('level_indicators_desc')}
- ${t('status_tracking')}: ${t('status_tracking_desc')}

<b>💡 ${t('tips')}:</b>
- ${t('tip_organize_by_status')}
- ${t('tip_track_character_progression')}
- ${t('tip_use_role_tags')}
`.trim();
}

export function getListEncountersHelpMessage(t: any): string {
  return `
⚔️ <b>${t('cmd_listencounters')}</b>

${t('listencounters_description')}

<b>${t('usage')}:</b>
<code>/listencounters [#tags] [--terrain &lt;terrain&gt;] [--difficulty &lt;difficulty&gt;] [--level &lt;level&gt;] [help]</code>

<b>${t('examples')}:</b>
<code>/listencounters</code> - ${t('list_all_encounters')}
<code>/listencounters #boss</code> - ${t('filter_boss_encounters')}
<code>/listencounters #underdark #magic</code> - ${t('filter_magical_underdark')}
<code>/listencounters --terrain forest --difficulty moderate</code> - ${t('filter_forest_moderate')}
<code>/listencounters --level 5 #ambush</code> - ${t('filter_level5_ambush')}
<code>/listencounters #dragon #lair --terrain mountain</code> - ${t('complex_encounter_filter')}

<b>🏞️ ${t('terrain_types')}:</b>
- <b>forest:</b> ${t('forest_encounters_desc')}
- <b>cave:</b> ${t('cave_encounters_desc')}
- <b>city:</b> ${t('city_encounters_desc')}
- <b>desert:</b> ${t('desert_encounters_desc')}
- <b>mountain:</b> ${t('mountain_encounters_desc')}
- <b>swamp:</b> ${t('swamp_encounters_desc')}
- <b>ocean:</b> ${t('ocean_encounters_desc')}
- <b>dungeon:</b> ${t('dungeon_encounters_desc')}

<b>⚡ ${t('difficulty_levels')}:</b>
- <b>trivial:</b> ${t('trivial_encounters_desc')}
- <b>low:</b> ${t('low_encounters_desc')}
- <b>moderate:</b> ${t('moderate_encounters_desc')}
- <b>severe:</b> ${t('severe_encounters_desc')}
- <b>extreme:</b> ${t('extreme_encounters_desc')}

<b>🔍 ${t('filtering_options')}:</b>
- <b><code>--terrain &lt;type&gt;</code>:</b> ${t('filter_by_terrain_desc')}
- <b><code>--difficulty &lt;level&gt;</code>:</b> ${t('filter_by_difficulty_desc')}
- <b><code>--level &lt;1-25&gt;</code>:</b> ${t('filter_by_encounter_level_desc')}
- <b><code>#tags</code>:</b> ${t('filter_by_tags_desc')}

<b>🎯 ${t('encounter_features')}:</b>
- ${t('balanced_encounters')}: ${t('balanced_encounters_desc')}
- ${t('tactical_information')}: ${t('tactical_information_desc')}
- ${t('terrain_adaptation')}: ${t('terrain_adaptation_desc')}
- ${t('level_scaling')}: ${t('level_scaling_desc')}

<b>📱 ${t('interface_features')}:</b>
- ${t('terrain_and_level')}: ${t('terrain_and_level_desc')}
- ${t('difficulty_indicators')}: ${t('difficulty_indicators_desc')}
- ${t('tag_matching')}: ${t('tag_matching_desc')}

<b>💡 ${t('tips')}:</b>
- ${t('tip_filter_by_party_level')}
- ${t('tip_check_terrain_context')}
- ${t('tip_combine_difficulty_and_tags')}
`.trim();
}

export function getGenItemHelpMessage(t: any): string {
  return `
⚔️ <b>${t('cmd_genitem')}</b>

${t('genitem_description')}

<b>${t('usage')}:</b>
<code>/genitem &lt;level&gt; &lt;type&gt; [#tags] [--in "Place"] [--for-plot "Plot"] [help]</code>

<b>${t('examples')}:</b>
<code>/genitem 8 weapon</code> - ${t('genitem_example_basic')}
<code>/genitem 3 armor #magical</code> - ${t('genitem_example_magical')}
<code>/genitem 15 consumable #healing --in "Temple"</code> - ${t('genitem_example_place')}
<code>/genitem 10 accessory --for-plot "Mystery Quest"</code> - ${t('genitem_example_plot')}

<b>⚔️ ${t('item_types')}:</b>
- <b>weapon:</b> ${t('weapon_items_desc')}
- <b>armor:</b> ${t('armor_items_desc')}
- <b>consumable:</b> ${t('consumable_items_desc')}
- <b>accessory:</b> ${t('accessory_items_desc')}
- <b>treasure:</b> ${t('treasure_items_desc')}
- <b>tool:</b> ${t('tool_items_desc')}

<b>🎯 ${t('level_guidelines')}:</b>
- <b>1-5:</b> ${t('level_1_5_desc')}
- <b>6-10:</b> ${t('level_6_10_desc')}
- <b>11-15:</b> ${t('level_11_15_desc')}
- <b>16-20:</b> ${t('level_16_20_desc')}

<b>🏷️ ${t('common_tags')}:</b>
- <b>#magical, #mundane:</b> ${t('magic_level_tags')}
- <b>#fire, #ice, #electric:</b> ${t('elemental_tags')}
- <b>#healing, #protection, #damage:</b> ${t('function_tags')}

<b>🔗 ${t('contextual_features')}:</b>
- <b><code>--in</code> "Place":</b> ${t('item_place_integration_desc')}
- <b><code>--for-plot</code> "Plot":</b> ${t('item_plot_integration_desc')}

${t('or_use_menu', { command: 'genitem' })}
`.trim();
}

export function buildItemMenuMessage(t: any): string {
  return `${t('item_type_prompt')}\n\n${t('quick_commands')}:\n<code>/genitem 8 weapon</code>\n<code>/genitem 5 armor #magical</code>\n<code>/genitem 12 consumable #healing</code>\n<code>/genitem 10 accessory --in "Ancient Temple"</code>\n\n🔗 <b>${t('contextual_generation')}:</b>\n<code>/genitem 6 treasure --for-plot "Mystery Quest"</code>\n<i>${t('item_contextual_help')}</i>`;
}

// ✅ NEW: Adições para encounter - adicionar ao commandHelpers.ts existente

/**
 * Help message for encounter command (UPDATED with better examples)
 */
export function getGenEncounterHelpMessage(t: any): string {
  return `
⚔️ <b>${t('cmd_genencounter')}</b>

${t('genencounter_description')}

<b>${t('usage')}:</b>
<code>/genencounter &lt;level&gt; [terrain] [difficulty] [#tags] [--in "Place"] [--for-plot "Plot"]</code>

<b>${t('examples')}:</b>
<code>/genencounter 5</code> - ${t('genencounter_example_basic')}
<code>/genencounter 8 forest</code> - ${t('genencounter_example_terrain')}
<code>/genencounter 12 dungeon severe #undead</code> - ${t('genencounter_example_difficulty')}
<code>/genencounter 6 city moderate --in "Waterdeep"</code> - ${t('genencounter_example_place')}
<code>/genencounter 10 cave extreme --for-plot "Mystery Quest"</code> - ${t('genencounter_example_plot')}
<code>/genencounter 15 forest severe #boss</code> - ${t('genencounter_example_elite')}

<b>🏞️ ${t('terrain_types')}:</b>
- <b>forest:</b> ${t('forest_terrain_desc')}
- <b>cave:</b> ${t('cave_terrain_desc')}
- <b>desert:</b> ${t('desert_terrain_desc')}
- <b>city:</b> ${t('city_terrain_desc')}
- <b>mountains:</b> ${t('mountains_terrain_desc')}
- <b>swamp:</b> ${t('swamp_terrain_desc')}
- <b>ocean:</b> ${t('ocean_terrain_desc')}
- <b>dungeon:</b> ${t('dungeon_terrain_desc')}
- <b>arctic:</b> ${t('arctic_terrain_desc')}
- <b>volcanic:</b> ${t('volcanic_terrain_desc')}

<b>⚙️ ${t('parameters')}:</b>
- <b>&lt;level&gt;:</b> ${t('encounter_level_param')} (1-25, ${t('required')})
- <b>[terrain]:</b> ${t('encounter_terrain_param')} (${t('optional')})
- <b>[difficulty]:</b> trivial, low, moderate, severe, extreme (${t('optional')}, ${t('default')}: moderate)
- <b>[#tags]:</b> ${t('encounter_tags_param')} (${t('optional')})
- <b><code>--in</code> "Place":</b> ${t('encounter_place_param')} (${t('optional')})
- <b><code>--for-plot</code> "Plot":</b> ${t('encounter_plot_param')} (${t('optional')})

<b>⚡ ${t('difficulty_levels')}:</b>
- <b>trivial:</b> ${t('trivial_encounters_desc')}
- <b>low:</b> ${t('low_encounters_desc')}
- <b>moderate:</b> ${t('moderate_encounters_desc')}
- <b>severe:</b> ${t('severe_encounters_desc')} ⭐ ${t('includes_elite_creatures')}
- <b>extreme:</b> ${t('extreme_encounters_desc')} ⭐ ${t('includes_elite_creatures')}

<b>🎯 ${t('encounter_features')}:</b>
- ${t('encounter_feature_balanced')}
- ${t('encounter_feature_contextual')}
- ${t('encounter_feature_tactical')}
- ${t('encounter_feature_scalable')}

<b>🔗 ${t('contextual_integration')}:</b>
${t('encounter_contextual_help')}

<b>🏷️ ${t('common_tags')}:</b>
- <b>#undead, #fiend, #dragon:</b> ${t('creature_type_tags')}
- <b>#boss, #ambush, #patrol:</b> ${t('encounter_type_tags')}
- <b>#magic, #trap, #stealth:</b> ${t('encounter_style_tags')}

${t('or_use_menu', { command: 'genencounter' })}
`.trim();
}

/**
 * Build encounter menu message (consistent with NPC menu style)
 */
export function buildEncounterMenuMessage(t: any): string {
  return `⚔️ ${t('encounter_terrain_prompt')}\n\n${t('quick_commands')}:\n<code>/genencounter 5 forest</code>\n<code>/genencounter 8 dungeon severe #undead</code>\n<code>/genencounter 12 city moderate --in "Waterdeep"</code>\n<code>/genencounter 6 cave extreme --for-plot "Mystery Quest"</code>\n\n🎯 <b>${t('contextual_generation')}:</b>\n<code>/genencounter 10 forest severe --in "Dark Woods" #ambush</code>\n<i>${t('encounter_contextual_help')}</i>\n\n⭐ <b>${t('elite_creatures')}:</b>\n<i>${t('severe_extreme_include_elite')}</i>`;
}

export function getGenNarrateHelpMessage(t: any): string {
  return `
🎤 <b>${t('cmd_narrate') || 'Audio Narration'}</b>

${t('narrate_help_description') || 'Transform your text into immersive audio with specialized voices for RPG narration!'}

<b>💎 ${t('cost')}:</b> ${CREDIT_COSTS.AUDIO_GENERATION} ${t('gem')}

<b>📋 ${t('usage')}:</b>
<code>/narrate "your text" [--voice &lt;voice&gt;] [--speed &lt;speed&gt;] [--strict]</code>

<b>🎯 ${t('examples')}:</b>
<code>/narrate "The dragon roars!"</code>
<code>/narrate "Welcome, brave adventurers" --voice nova</code>
<code>/narrate "Ancient magic flows" --voice shimmer --speed 0.8</code>
<code>/narrate "Exact text here" --strict</code>

<b>🎭 ${t('voice_options')}:</b>
• <b>fable</b> (${t('voice_storyteller')}): ${t('voice_storyteller_desc')}
• <b>onyx</b> (${t('voice_warrior')}): ${t('voice_warrior_desc')}
• <b>echo</b> (${t('voice_mysterious')}): ${t('voice_mysterious_desc')}
• <b>nova</b> (${t('voice_noble')}): ${t('voice_noble_desc')}
• <b>alloy</b> (${t('voice_gentle')}): ${t('voice_gentle_desc')}
• <b>shimmer</b> (${t('voice_ethereal')}): ${t('voice_ethereal_desc')}

<b>⚡ ${t('speed_options')}:</b>
• <b>0.8</b> (${t('speed_slow')}): ${t('speed_slow_desc') || 'Dramatic and deliberate'}
• <b>1.0</b> (${t('speed_normal')}): ${t('speed_normal_desc') || 'Natural pace'}
• <b>1.2</b> (${t('speed_fast')}): ${t('speed_fast_desc') || 'Quick and energetic'}

<b>🛠️ ${t('options')}:</b>
• <b><code>--strict</code>:</b> ${t('narrate_strict_help') || 'Use exact text without epic enhancement'}
• <b><code>--voice</code>:</b> ${t('narrate_voice_help') || 'Choose specific voice for narration'}
• <b><code>--speed</code>:</b> ${t('narrate_speed_help') || 'Control playback speed'}

<b>✨ ${t('enhancement_feature')}:</b>
${t('narrate_enhancement_help') || 'By default, your text is automatically enhanced into epic RPG narration with richer language and dramatic flair. Use --strict to disable this feature.'}

<b>📏 ${t('limits')}:</b>
• ${t('narrate_normal_limit') || 'Normal mode: Maximum 280 characters'}
• ${t('narrate_strict_limit') || '--strict mode: Maximum 400 characters'}
• ${t('narrate_cache_info') || 'Smart caching system for faster repeated generations'}

${t('or_use_menu', { command: 'narrate' }) || 'Or use /narrate without parameters for the interactive menu.'}
`.trim();
}

export function buildNarrateMenuMessage(t: any): string {
  return `🎤 <b>${t('narrate_menu_title') || 'Audio Narration'}</b>

${t('narrate_menu_description') || 'Choose the voice that best fits your narrative:'}

📖 <b>${t('voice_storyteller')}</b> - ${t('voice_storyteller_desc')}
⚔️ <b>${t('voice_warrior')}</b> - ${t('voice_warrior_desc')}
🔮 <b>${t('voice_mysterious')}</b> - ${t('voice_mysterious_desc')}
👑 <b>${t('voice_noble')}</b> - ${t('voice_noble_desc')}
🌸 <b>${t('voice_gentle')}</b> - ${t('voice_gentle_desc')}
✨ <b>${t('voice_ethereal')}</b> - ${t('voice_ethereal_desc')}

<b>${t('quick_commands')}:</b>
<code>/narrate "The dragon awakens!"</code>
<code>/narrate "Welcome, heroes" --voice nova</code>
<code>/narrate "Ancient whispers" --voice echo --speed 0.8</code>
<code>/narrate "Exact text" --strict</code>

🎯 <b>${t('enhancement_feature')}:</b>
<i>${t('narrate_auto_enhancement') || 'Your text will be automatically enhanced into epic RPG narration!'}</i>`;
}

export function getGenEventHelpMessage(t: any): string {
  return `
🎭 <b>${t('cmd_genevent') || 'Gerador de Eventos'}</b>

${t('event_help_description') || 'Gere mini-eventos de aventura com desafios de skill checks que podem escalar para combate.'}

<b>💎 ${t('cost')}:</b> ${CREDIT_COSTS.TEXT_GENERATION} ${t('gem')}

<b>📋 ${t('parameters')}:</b>
• <b>${t('type')}:</b> obstacle, social, exploration, puzzle, trap, environmental, mystery
• <b>${t('level')}:</b> 1-25 (${t('required')})
• <b>${t('difficulty')}:</b> trivial, easy, moderate, hard, extreme

<b>🎯 ${t('examples')}:</b>
<code>/genevent 5 obstacle</code>
<code>/genevent 8 social moderate</code>
<code>/genevent 12 trap --in "Ancient Dungeon"</code>
<code>/genevent 6 puzzle --for-plot "Mystery Quest"</code>

<b>🔗 ${t('contextual_integration')}:</b>
${t('event_contextual_help') || 'Eventos contextuais usam locais e plots existentes.'}

<b>🏷️ ${t('common_tags')}:</b>
- <b>#climbing, #swimming, #negotiation:</b> ${t('skill_based_tags') || 'Tags baseadas em skills'}
- <b>#stealth, #magic, #ancient:</b> ${t('theme_tags') || 'Tags temáticas'}
- <b>#nature, #urban, #underground:</b> ${t('environment_tags') || 'Tags ambientais'}

${t('or_use_menu', { command: 'genevent' }) || 'Ou use /genevent sem parâmetros para o menu interativo.'}
`.trim();
}

export function getListEventsHelpMessage(t: any): string {
  return `
🎭 <b>${t('cmd_listevents')}</b>

${t('listevents_description')}

<b>${t('usage')}:</b>
<code>/listevents [#tags] [--type &lt;type&gt;] [--difficulty &lt;difficulty&gt;] [--level &lt;level&gt;] [help]</code>

<b>${t('examples')}:</b>
<code>/listevents</code> - ${t('list_all_events')}
<code>/listevents #puzzle</code> - ${t('filter_puzzle_events')}
<code>/listevents #trap #dungeon</code> - ${t('filter_trap_dungeon')}
<code>/listevents --type obstacle --difficulty moderate</code> - ${t('filter_obstacle_moderate')}
<code>/listevents --level 5 #social</code> - ${t('filter_level5_social')}
<code>/listevents #mystery #investigation --type mystery</code> - ${t('complex_event_filter')}

<b>🎭 ${t('event_types')}:</b>
- <b>obstacle:</b> ${t('obstacle_events_desc')}
- <b>social:</b> ${t('social_events_desc')}
- <b>exploration:</b> ${t('exploration_events_desc')}
- <b>puzzle:</b> ${t('puzzle_events_desc')}
- <b>trap:</b> ${t('trap_events_desc')}
- <b>environmental:</b> ${t('environmental_events_desc')}
- <b>mystery:</b> ${t('mystery_events_desc')}

<b>⚡ ${t('difficulty_levels')}:</b>
- <b>trivial:</b> ${t('trivial_events_desc')}
- <b>easy:</b> ${t('easy_events_desc')}
- <b>moderate:</b> ${t('moderate_events_desc')}
- <b>hard:</b> ${t('hard_events_desc')}
- <b>extreme:</b> ${t('extreme_events_desc')}

<b>🔍 ${t('filtering_options')}:</b>
- <b><code>--type &lt;type&gt;</code>:</b> ${t('filter_by_event_type_desc')}
- <b><code>--difficulty &lt;level&gt;</code>:</b> ${t('filter_by_event_difficulty_desc')}
- <b><code>--level &lt;1-25&gt;</code>:</b> ${t('filter_by_event_level_desc')}
- <b><code>#tags</code>:</b> ${t('filter_by_event_tags_desc')}

<b>🎯 ${t('event_features')}:</b>
- ${t('skill_checks')}: ${t('skill_checks_desc')}
- ${t('escalation_mechanics')}: ${t('escalation_mechanics_desc')}
- ${t('context_integration')}: ${t('context_integration_desc')}
- ${t('consequence_tracking')}: ${t('consequence_tracking_desc')}

<b>📱 ${t('interface_features')}:</b>
- ${t('type_and_level')}: ${t('type_and_level_desc')}
- ${t('difficulty_indicators')}: ${t('difficulty_indicators_desc')}
- ${t('tag_matching')}: ${t('tag_matching_desc')}
`.trim();
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
  return `${t('cleardata_menu_prompt')}\n\n${t('cleardata_instructions')}\n\n${t('quick_commands')}:\n<code>/cleardata all</code>\n<code>/cleardata npcs,players</code>\n<code>/cleardata notes</code>`;
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