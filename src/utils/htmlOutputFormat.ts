import { TFunction } from "i18next";

export function formatEncounterHtml(t: any, encounter: any): string {
  console.log('🏞️ Formatting encounter:', encounter);
  let message = `⚔️ <b>${encounter.title}</b>\n`;
  
  // Encounter type and level info
  const terrainIcon = getTerrainIcon(encounter.terrain);
  const difficultyIcon = getDifficultyIcon(encounter.difficulty);
  
  message += `${terrainIcon} ${t(`encounter_type_${encounter.terrain}`) || encounter.terrain}`;
  message += ` • ${t('level')} ${encounter.level}`;
  message += ` • ${difficultyIcon} ${t(`difficulty_${encounter.difficulty}`) || encounter.difficulty}\n\n`;
  
  // Description
  message += `📜 <b>${t('encounter_description')}:</b>\n${encounter.description}\n\n`;
  
  // Enemies with support for both official and custom formats
  if (encounter.enemies && Array.isArray(encounter.enemies) && encounter.enemies.length > 0) {
    message += `👹 <b>${t('encounter_enemies')}:</b>\n`;
    encounter.enemies.forEach((enemy: any) => {
      const count = enemy.count || 1;
      const countText = ` (${count}x)`;
      
      // Determine creature source
      const sourceIcon = enemy.isNewlyGenerated ? '🆕' : '📚';
      
      // Name with AoN link for official creatures
      if (enemy.aon_link) {
        message += `• <a href="${enemy.aon_link}">${enemy.name}</a>${countText} ${sourceIcon} (${t('level')} ${enemy.level})\n`;
      } else {
        message += `• <b>${enemy.name}</b>${countText} ${sourceIcon} (${t('level')} ${enemy.level})\n`;
      }
      
      // Stats for custom creatures
      if (enemy.hp) {
        message += `  ❤️ ${t('hp')}: ${enemy.hp}`;
        if (enemy.ac) message += ` • 🛡️ CA: ${enemy.ac}`;
        if (enemy.speed) message += ` • 🏃 ${t('speed')}: ${enemy.speed}`;
        message += `\n`;
      }
      
      // Saves for custom creatures
      if (enemy.fortitude || enemy.reflex || enemy.will) {
        message += `  🎯 <b>${t('saves')}:</b> `;
        const saves = [];
        if (enemy.fortitude) saves.push(`Fort +${enemy.fortitude}`);
        if (enemy.reflex) saves.push(`Ref +${enemy.reflex}`);
        if (enemy.will) saves.push(`Von +${enemy.will}`);
        message += saves.join(', ') + `\n`;
      }
      
      // Speed already displayed above with HP and AC
      
      // Ancestry for custom creatures
      if (enemy.ancestry) {
        message += `  🧬 ${t('ancestry')}: ${enemy.ancestry}`;
        if (enemy.size) {
          const sizeTranslation = t(`size_${enemy.size.toLowerCase()}`) || enemy.size;
          message += ` • 📏 ${t('size')}: ${sizeTranslation}`;
        }
        message += `\n`;
      } else if (enemy.size) {
        const sizeTranslation = t(`size_${enemy.size.toLowerCase()}`) || enemy.size;
        message += `  📏 ${t('size')}: ${sizeTranslation}\n`;
      }
      
      // Description
      if (enemy.description) {
        message += `  📝 ${enemy.description}\n`;
      }
      
      // Initiative and Perception for custom creatures
      if (enemy.initiative) {
        message += `  🎯 Iniciativa: ${enemy.initiative}`;
        if (enemy.perception) message += ` • 👁️ Percepção: ${enemy.perception}`;
        message += `\n`;
      } else if (enemy.perception) {
        message += `  👁️ Percepção: ${enemy.perception}\n`;
      }
      
      // Vision and Languages for custom creatures
      if (enemy.vision) {
        message += `  👀 Visão: ${enemy.vision}`;
        if (enemy.languages && Array.isArray(enemy.languages) && enemy.languages.length > 0) {
          const translatedLanguages = enemy.languages.map((lang: string) => {
            const langKey = `language_${lang.toLowerCase()}`;
            return t(langKey) || lang;
          });
          message += ` • 🗣️ Idiomas: ${translatedLanguages.join(', ')}`;
        }
        message += `\n`;
      } else if (enemy.languages && Array.isArray(enemy.languages) && enemy.languages.length > 0) {
        const translatedLanguages = enemy.languages.map((lang: string) => {
          const langKey = `language_${lang.toLowerCase()}`;
          return t(langKey) || lang;
        });
        message += `  🗣️ Idiomas: ${translatedLanguages.join(', ')}\n`;
      }
      
      // Attacks for custom creatures
      if (enemy.attacks && Array.isArray(enemy.attacks) && enemy.attacks.length > 0) {
        message += `  ⚔️ <b>${t('attacks')}:</b>\n`;
        enemy.attacks.forEach((attack: any) => {
          let attackText = `    • <b>${attack.name}</b>`;
          if (attack.actions) attackText += ` (${attack.actions}⭐)`;
          if (attack.proficiency) attackText += ` ${attack.proficiency}`;
          attackText += `: ${attack.damage}`;
          if (attack.reach) {
            attackText += ` (${attack.reach})`;
          }
          message += attackText + `\n`;
          if (attack.effect) {
            message += `      <i>${attack.effect}</i>\n`;
          }
        });
      }
      
      // Special abilities for custom creatures
      if (enemy.special_abilities && Array.isArray(enemy.special_abilities) && enemy.special_abilities.length > 0) {
        message += `  ✨ <b>${t('special_abilities')}:</b>\n`;
        enemy.special_abilities.forEach((ability: any) => {
          let abilityText = `    • <b>${ability.name}</b>`;
          if (ability.frequency) {
            abilityText += ` (${ability.frequency})`;
          }
          abilityText += `: ${ability.effect}`;
          message += abilityText + `\n`;
        });
      }
      
      // Reactions for custom creatures
      if (enemy.reactions && Array.isArray(enemy.reactions) && enemy.reactions.length > 0) {
        message += `  ⚡ <b>${t('reactions')}:</b>\n`;
        enemy.reactions.forEach((reaction: any) => {
          message += `    • <b>${reaction.name}</b>: ${reaction.description}\n`;
        });
      }
      
      // Elite status for custom creatures
      if (enemy.isElite) {
        message += `  ⭐ <b>Elite</b>\n`;
      }
      
      // Spell Attacks for custom creatures
      if (enemy.spellAttacks && Array.isArray(enemy.spellAttacks) && enemy.spellAttacks.length > 0) {
        message += `  🔮 <b>${t('spell_attacks')}:</b>\n`;
        enemy.spellAttacks.forEach((spell: any) => {
          let spellText = `    • <b>${spell.name}</b>`;
          if (spell.actions && spell.actions.toString().trim() !== '') spellText += ` (${spell.actions}⭐)`;
          if (spell.proficiency) spellText += ` ${spell.proficiency}`;
          spellText += ` (DC ${spell.dc})`;
          message += spellText + `\n`;
          if (spell.effect) {
            message += `      <i>${spell.effect}</i>\n`;
          }
        });
      }
      
      // Weaknesses, immunities, and resistances for custom creatures
      if (enemy.weaknesses || enemy.immunities || enemy.resistances) {
        const defenses = [];
        if (enemy.weaknesses && Array.isArray(enemy.weaknesses) && enemy.weaknesses.length > 0) {
          defenses.push(`💔 ${t('weaknesses')}: ${enemy.weaknesses.join(', ')}`);
        }
        if (enemy.immunities && Array.isArray(enemy.immunities) && enemy.immunities.length > 0) {
          defenses.push(`🛡️ ${t('immunities')}: ${enemy.immunities.join(', ')}`);
        }
        if (enemy.resistances && Array.isArray(enemy.resistances) && enemy.resistances.length > 0) {
          defenses.push(`🔰 ${t('resistances')}: ${enemy.resistances.join(', ')}`);
        }
        if (defenses.length > 0) {
          message += `  ${defenses.join(' • ')}\n`;
        }
      }
      message += `\n`;
    });
  }
  
  // Place context from generated JSON
  if (encounter.placeContext && typeof encounter.placeContext === 'object') {
    const context = encounter.placeContext;
    console.log('🏛️ Displaying place context:', context);
    message += `🏛️ <b>${t('location_context')}:</b>\n`;
    if (context.placeName) {
      message += `📍 ${t('place')}: ${context.placeName}\n`;
    }
    if (context.placeType) {
      message += `🏗️ ${t('type')}: ${t(`place_type_${context.placeType}`) || context.placeType}\n`;
    }
    if (context.tacticalConsiderations && Array.isArray(context.tacticalConsiderations)) {
      message += `⚔️ <b>${t('tactical_considerations')}:</b>\n`;
      context.tacticalConsiderations.forEach((consideration: string) => {
        // Clean up malformed considerations (remove leading commas)
        const cleanConsideration = consideration.replace(/^,\s*/, '').trim();
        if (cleanConsideration) {
          message += `• ${cleanConsideration}\n`;
        }
      });
    }
    message += `\n`;
  }
  
  // Plot context from generated JSON
  if (encounter.plotContext && typeof encounter.plotContext === 'object') {
    const context = encounter.plotContext;
    message += `📖 <b>${t('plot_connection')}:</b>\n`;
    if (context.plotName) {
      message += `📚 ${t('plot_name')}: ${context.plotName}\n`;
    }
    if (context.narrativeRole) {
      message += `🎭 ${t('narrative_role')}: ${context.narrativeRole}\n`;
    }
    if (context.plotRelevance) {
      message += `🔗 ${t('plot_relevance')}: ${context.plotRelevance}\n`;
    }
    message += `\n`;
  }
  
  // Place relation from database (if available)
  if (encounter.place) {
    message += `🏛️ <b>${t('location')}:</b> ${encounter.place.name}\n`;
    if (encounter.place.type) {
      message += `📍 ${t(`place_type_${encounter.place.type}`) || encounter.place.type}\n`;
    }
    message += `\n`;
  }
  
  // Plot relation from database (if available)
  if (encounter.plot) {
    message += `📖 <b>${t('connected_plot')}:</b> ${encounter.plot.title}\n`;
    if (encounter.plot.theme) {
      message += `🎯 ${t('theme')}: ${t(`plot_theme_${encounter.plot.theme}`) || encounter.plot.theme}\n`;
    }
    message += `\n`;
  }
  
  // Tags
  if (encounter.autoTags && Array.isArray(encounter.autoTags) && encounter.autoTags.length > 0) {
    message += `🏷️ <b>${t('tags')}:</b>\n`;
    message += encounter.autoTags.map((tag: string) => `#${tag}`).join(' ');
    message += `\n\n`;
  }
  
  // Meta info
  message += `📋 <b>${t('encounter_info')}:</b>\n`;
  message += `${t('terrain')}: ${t(`encounter_type_${encounter.terrain}`) || encounter.terrain}\n`;
  message += `${t('difficulty')}: ${t(`difficulty_${encounter.difficulty}`) || encounter.difficulty}\n`;
  message += `${t('level')}: ${encounter.level}`;
  
  if (encounter.place) {
    message += `\n${t('location')}: ${encounter.place.name}`;
  }
  if (encounter.plot) {
    message += `\n${t('plot')}: ${encounter.plot.title}`;
  }
  
  return message;
}

// Enhanced terrain icons
function getTerrainIcon(terrain: string): string {
  const icons: Record<string, string> = {
    forest: '🌲',
    cave: '🦇',
    desert: '🏜️',
    city: '🏙️',
    mountains: '🗻',
    swamp: '🐊',
    plains: '🌾',
    ocean: '🌊',
    dungeon: '🕳️',
    ruins: '🏛️',
    underground: '⚫',
    arctic: '❄️',
    volcanic: '🌋',
    urban: '🏙️'
  };
  return icons[terrain] || '🌍';
}

function getDifficultyIcon(difficulty: string): string {
  const icons: Record<string, string> = {
    trivial: '🟢',
    low: '🟡',
    moderate: '🟠',
    severe: '🔴',
    extreme: '💀'
  };
  return icons[difficulty] || '⚪';
}

export function formatNpcHtml(t: any, npc: any): string {
  let message = `👤 <b>${npc.name}</b>\n`;
  message += `🧬 ${npc.ancestry}\n`;
  message += `💼 ${npc.occupation}\n\n`;
  message += `${t('npc_personality')}: ${npc.personality}\n\n`;
  message += `${t('npc_secret')}: ${npc.secret}\n\n`;
  
  // Basic stats
  if (npc.basicStats) {
    message += `📊 <b>${t('stats_section')}:</b>\n`;
    Object.entries(npc.basicStats).forEach(([skill, value]) => {
      const skillName = t(`skill_${skill}`) || skill;
      message += `${skillName}: +${value}\n`;
    });
    message += `\n`;
  }
  
  // Tags (autoTags already normalized)
  if (npc.autoTags && npc.autoTags.length > 0) {
    message += `🏷️ <b>${t('tags')}:</b>\n`;
    message += npc.autoTags.map((tag: string) => `#${tag}`).join(' ');
    message += `\n\n`;
  }
  
  // Character information
  message += `📋 <b>${t('character_info')}:</b>\n`;
  message += `${t('type')}: ${t(`npc_type_${npc.npcType}`)}\n`;
  message += `${t('importance')}: ${t(`npc_importance_${npc.importance}`)}\n`;
  message += `${t('level')}: ${npc.level}`;
  
  // ✅ RELACIONAMENTOS: Usar dados diretamente do schema Prisma
  if (npc.sourceRelationships && npc.sourceRelationships.length > 0) {
    message += `\n\n🔗 <b>${t('npc_relationships_section')}:</b>\n`;
    
    npc.sourceRelationships.forEach((rel: any) => {
      const relationshipTypeKey = `relationship_type_${rel.relationshipType}`;
      const relationshipType = t(relationshipTypeKey);
      const strengthKey = `relationship_strength_${rel.strength}`;
      const strengthLabel = t(strengthKey);
      
      const targetName = rel.targetNpc?.name;
      const targetOccupation = rel.targetNpc?.occupation ? ` (${rel.targetNpc.occupation})` : '';
      
      message += `• <b>${targetName}${targetOccupation}</b> - ${relationshipType}\n`;
      message += `  <i>${rel.description}</i>\n`;
      message += `  💪 ${strengthLabel}\n\n`;
    });
  }
  
  return message;
}

export function formatLoreHtml(
  lore: {
    title: string;
    content: string;
  }
): string {
  return (
    `📜 <b>${lore.title}</b>\n\n` +
    `${lore.content}`
  );
}

export function formatNoteHtml(
  note: {
    title: string;
    content: string;
  }
): string {
  return (
    `📝 <b>${note.title}</b>\n\n` +
    `${note.content}`
  );
}

export function formatPlayerHtml(player: {
  name: string;
  className: string;
  level: number;
  perception: number;
  fortitude: number;
  reflex: number;
  will: number;
  skills: Record<string, number | Record<string, number>>;
  metadata?: any;
}, t: TFunction): string {
  const lines: string[] = [];

  lines.push(`🧙 <b>${player.name}</b> – ${player.className} (lvl ${player.level})`);

  if (player.metadata?.ancestry) {
    lines.push(`🏞️ <b>${t('ancestry')}:</b> ${player.metadata.ancestry}`);
  }

  lines.push('');
  lines.push(`🎯 <b>${t('perception')}</b>: +${player.perception}`);
  lines.push(`🛡️ <b>${t('fortitude')}</b>: +${player.fortitude}`);
  lines.push(`💨 <b>${t('reflex')}</b>: +${player.reflex}`);
  lines.push(`🧠 <b>${t('will')}</b>: +${player.will}`);

  // HP, AC e Class DC
  const { hp, ac, classDc } = player.metadata || {};
  if (hp !== undefined || ac !== undefined || classDc !== undefined) {
    const parts = [];
    if (hp !== undefined) parts.push(`❤️ HP ${hp}`);
    if (ac !== undefined) parts.push(`🛡️ AC ${ac}`);
    if (classDc !== undefined) parts.push(`🎓 Class DC ${classDc}`);
    lines.push(`\n${parts.join(' | ')}`);
  }

  // Atributos (se existirem)
  if (player.metadata?.attributes) {
    const attrs = player.metadata.attributes;
    const attrLine = `\n🧬 <b>${t('attributes')}:</b> ` +
      `STR ${attrs.strength}, DEX ${attrs.dexterity}, CON ${attrs.constitution}, ` +
      `INT ${attrs.intelligence}, WIS ${attrs.wisdom}, CHA ${attrs.charisma}`;
    lines.push(attrLine);
  }

  // Ataque principal (se houver)
  if (player.metadata?.attacks?.length > 0) {
    lines.push(`\n🗡️ <b>${t('attack')}:</b> ${player.metadata.attacks[0]}`);
  }

  // Magia (se houver)
  if (player.metadata?.spells?.spellAttack || player.metadata?.spells?.spellDc) {
    const spell = player.metadata.spells;
    lines.push(
      `✨ <b>${t('spells')}:</b> ` +
      (spell.spellAttack !== undefined ? `Atk +${spell.spellAttack}` : '') +
      (spell.spellAttack !== undefined && spell.spellDc !== undefined ? ', ' : '') +
      (spell.spellDc !== undefined ? `DC ${spell.spellDc}` : '')
    );
  }

  // Habilidades
  const skillLines: string[] = [];
  const loreLines: string[] = [];

  for (const [key, value] of Object.entries(player.skills)) {
    if (key === 'lores' && typeof value === 'object') {
      for (const [lore, bonus] of Object.entries(value)) {
        loreLines.push(`📖 <b>Lore (${capitalize(lore)})</b>: +${bonus}`);
      }
    } else if (typeof value === 'number') {
      skillLines.push(`• ${capitalize(key)}: ${value > 0 ? '+' : ''}${value}`);
    }
  }

  if (skillLines.length > 0) {
    skillLines.sort((a, b) => a.localeCompare(b));
    lines.push(`\n📚 <b>${t('skills')}</b>:\n${skillLines.join('\n')}`);
  }

  if (loreLines.length > 0) {
    loreLines.sort((a, b) => a.localeCompare(b));
    lines.push(`\n${loreLines.join('\n')}`);
  }

  return lines.join('\n');
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatPlaceHtml(t: any, place: any): string {
  let message = `🏗️ <b>${place.name}</b>\n`;
  
  // Place type and basic info
  message += `${t(`place_type_${place.type}`)}\n`;
  
  // Region connection if available
  if (place.region) {
    message += `🌍 ${t('located_in')}: ${place.region.name} (${t(`region_type_${place.region.type}`)})\n`;
  }
  
  message += `\n`;
  
  // Description
  message += `📜 <b>${t('description')}:</b>\n${place.description}\n\n`;
  
  // Notable Locations
  if (place.notableLocations && place.notableLocations.length > 0) {
    message += `🏛️ <b>${t('notable_locations')}:</b>\n`;
    place.notableLocations.forEach((location: any) => {
      message += `• <b>${location.name}</b>\n`;
      message += `  <i>${location.description}</i>\n\n`;
    });
  }
  
  // Rumors
  if (place.rumors && place.rumors.length > 0) {
    message += `💬 <b>${t('rumors')}:</b>\n`;
    place.rumors.forEach((rumor: any) => {
      message += `• <b>${t('hook')}:</b> ${rumor.hook}\n`;
      message += `  <b>${t('details')}:</b> ${rumor.details}\n\n`;
    });
  }
  
  // Threats
  if (place.threats && place.threats.length > 0) {
    message += `⚔️ <b>${t('threats')}:</b>\n`;
    place.threats.forEach((threat: string) => {
      message += `• ${threat}\n`;
    });
    message += `\n`;
  }
  
  // Resources
  if (place.resources && place.resources.length > 0) {
    message += `💎 <b>${t('resources')}:</b>\n`;
    place.resources.forEach((resource: string) => {
      message += `• ${resource}\n`;
    });
    message += `\n`;
  }
  
  // Metadata (type-specific information)
  if (place.metadata && Object.keys(place.metadata).length > 0) {
    message += `📊 <b>${t('place_details')}:</b>\n`;
    
    // Population for settlements
    if (place.metadata.population) {
      message += `👥 ${t('population')}: ${place.metadata.population.toLocaleString()}\n`;
    }
    
    // Wealth level for settlements
    if (place.metadata.wealth) {
      message += `💰 ${t('wealth_level')}: ${place.metadata.wealth}/5\n`;
    }
    
    // Government for settlements
    if (place.metadata.government) {
      message += `🏛️ ${t('government')}: ${place.metadata.government}\n`;
    }
    
    // Levels for dungeons
    if (place.metadata.levels) {
      message += `🏗️ ${t('levels')}: ${place.metadata.levels}\n`;
    }
    
    // Danger level
    if (place.metadata.danger) {
      const dangerIcon = getDangerLevelIcon(place.metadata.danger);
      message += `${dangerIcon} ${t('danger_level')}: ${place.metadata.danger}/5\n`;
    }
    
    // Size for natural features
    if (place.metadata.size) {
      message += `📏 ${t('size')}: ${t(`size_${place.metadata.size}`)}\n`;
    }
    
    // Garrison for fortresses
    if (place.metadata.garrison) {
      message += `🛡️ ${t('garrison')}: ${place.metadata.garrison}\n`;
    }
    
    // Treasure level for dungeons
    if (place.metadata.treasureLevel) {
      message += `💰 ${t('treasure_level')}: ${place.metadata.treasureLevel}\n`;
    }
    
    message += `\n`;
  }
  
  // Tags
  if (place.autoTags && place.autoTags.length > 0) {
    message += `🏷️ <b>${t('tags')}:</b>\n`;
    message += place.autoTags.map((tag: string) => `#${tag}`).join(' ');
    message += `\n\n`;
  }
  
  // Meta info
  message += `📋 <b>${t('place_info')}:</b>\n`;
  message += `${t('type')}: ${t(`place_type_${place.type}`)}\n`;
  if (place.region) {
    message += `${t('region')}: ${place.region.name}\n`;
  }
  return message;
}

function getPlaceTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    city: '🏙️',
    town: '🏘️',
    village: '🛖',
    dungeon: '🕳️',
    ruins: '🏛️',
    tomb: '⚰️',
    cave: '🦇',
    forest: '🌲',
    mountain: '🗻',
    swamp: '🐊',
    desert: '🏜️',
    lake: '🏞️',
    fortress: '🏰',
    temple: '⛪',
    tower: '🗼',
    bridge: '🌉',
    portal: '🌀',
    shrine: '🕯️',
    camp: '⛺'
  };
  return icons[type] || '🏗️';
}

function getDangerLevelIcon(level: number): string {
  const icons = ['', '🟢', '🟡', '🟠', '🔴', '💀'];
  return icons[level] || '🟡';
}

export function formatPlotHtml(t: any, plot: any, relatedContent?: any): string {
  let message = `🎯 <b>${plot.title}</b>\n\n`;
  message += `<b>${t('plot_hook')}</b>\n${plot.hook}\n\n`;
  message += `<b>${t('plot_twist')}</b>\n${plot.twist}\n\n`;

  if (plot.suggestedNpcs && Array.isArray(plot.suggestedNpcs) && plot.suggestedNpcs.length > 0) {
    message += `💡 <b>${t('suggested_npcs')}:</b>\n`;
    plot.suggestedNpcs.forEach((npcData: any) => {
      // ✅ Validação robusta para ambos os formatos
      const npcName = npcData.npc || npcData.name;
      const knowledge = npcData.knowledge;
      
      if (npcName && knowledge) {
        message += `• <b>${npcName}</b>\n`;
        message += `  <i>${knowledge}</i>\n`;
      } else {
        console.warn('⚠️ Invalid NPC data in display:', npcData);
      }
    });
    message += `\n`;
  }

  // Tags (autoTags)
  if (plot.autoTags && plot.autoTags.length > 0) {
    message += `🏷️ <b>${t('tags')}:</b>\n`;
    message += plot.autoTags.map((tag: string) => `#${tag}`).join(' ');
    message += `\n\n`;
  }
  
  // NPCs relacionados
  if (relatedContent?.npcs && relatedContent.npcs.length > 0) {
    message += `👥 <b>${t('related_npcs')}:</b>\n`;
    
    relatedContent.npcs.forEach((npc: any) => {
      message += `• ${npc.name} (${npc.occupation})\n`;
    });
    message += `\n`;
  }
  
  // Plots relacionados
  if (relatedContent?.plots && relatedContent.plots.length > 0) {
    message += `🔗 <b>${t('related_plots')}:</b>\n`;
    
    relatedContent.plots.forEach((relatedPlot: any) => {
      message += `• "${relatedPlot.title}"\n`;
    });
    message += `\n`;
  }
  
  // Mostrar se há mais conteúdo relacionado
  if (relatedContent && relatedContent.totalFound > (relatedContent.npcs?.length || 0) + (relatedContent.plots?.length || 0)) {
    const remaining = relatedContent.totalFound - (relatedContent.npcs?.length || 0) - (relatedContent.plots?.length || 0);
    message += `<i>${t('and_more_related', { count: remaining })}</i>\n`;
  }
  
  return message;
}

export function formatRegionHtml(t: any, region: any): string {
  let message = `🏰 <b>${region.name}</b>\n`;
  
  // Region type and threat level
  const typeIcon = getRegionTypeIcon(region.type);
  const threatIcon = getThreatLevelIcon(region.threatLevel);
  
  message += `${typeIcon} ${t(`region_type_${region.type}`)}`;
  if (region.climate) {
    message += ` • ${t('climate')}: ${t(`climate_${region.climate}`) || region.climate}`;
  }
  message += `\n${threatIcon} ${t('threat_level')}: ${region.threatLevel}/5 (${t(`threat_level_${region.threatLevel}_desc`)})\n\n`;
  
  // Description
  message += `📜 <b>${t('description')}:</b>\n${region.description}\n\n`;
  
  // ✅ UPDATED: Rulers with JSON structure
  if (region.rulers && Array.isArray(region.rulers) && region.rulers.length > 0) {
    message += `👑 <b>${t('rulers')}:</b>\n`;
    region.rulers.forEach((ruler: any) => {
      message += `• <b>${ruler.name}</b> - ${ruler.title}\n`;
      if (ruler.description) {
        message += `  <i>${ruler.description}</i>\n`;
      }
    });
    message += `\n`;
  }
  
  // ✅ UPDATED: Major threats with JSON structure
  if (region.majorThreats && Array.isArray(region.majorThreats) && region.majorThreats.length > 0) {
    message += `⚔️ <b>${t('major_threats')}:</b>\n`;
    region.majorThreats.forEach((threat: any) => {
      message += `• <b>${threat.name}</b>\n`;
      if (threat.description) {
        message += `  <i>${threat.description}</i>\n`;
      }
    });
    message += `\n`;
  }
  
  // ✅ UPDATED: Notable features with JSON structure
  if (region.notableFeatures && Array.isArray(region.notableFeatures) && region.notableFeatures.length > 0) {
    message += `🏛️ <b>${t('notable_features')}:</b>\n`;
    region.notableFeatures.forEach((feature: any) => {
      message += `• <b>${feature.name}</b>\n`;
      if (feature.description) {
        message += `  <i>${feature.description}</i>\n`;
      }
    });
    message += `\n`;
  }
  
  // Culture
  if (region.culture) {
    message += `🎭 <b>${t('culture')}:</b>\n${region.culture}\n\n`;
  }
  
  // Tags
  if (region.autoTags && region.autoTags.length > 0) {
    message += `🏷️ <b>${t('tags')}:</b>\n`;
    message += region.autoTags.map((tag: string) => `#${tag}`).join(' ');
    message += `\n\n`;
  }
  
  // Meta info
  message += `📋 <b>${t('region_info')}:</b>\n`;
  message += `${t('type')}: ${t(`region_type_${region.type}`)}\n`;
  message += `${t('threat_level')}: ${region.threatLevel}/5\n`;
  if (region.climate) {
    message += `${t('climate')}: ${t(`climate_${region.climate}`) || region.climate}\n`;
  }
  
  return message;
}

export function formatRegionListItem(region: any, t: any): { 
  label: string; 
  subtitle: string; 
  callbackId: string 
} {
  const typeIcon = getRegionTypeIcon(region.type);
  const threatIcon = getThreatLevelIcon(region.threatLevel);
  
  const autoTags = (region.autoTags as string[]) || [];
  const previewTags = autoTags.slice(0, 3).map(tag => `#${tag}`).join(' ');

  return {
    label: `${typeIcon} ${region.name}`,
    subtitle: `${threatIcon} ${t(`region_type_${region.type}`)} • ${previewTags || t('no_tags')}`,
    callbackId: region.id,
  };
}

function getRegionTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    kingdom: '🏰',
    wilderness: '🌲',
    plane: '🌀',
    continent: '🌍',
    underworld: '🕳️'
  };
  return icons[type] || '🏰';
}

function getThreatLevelIcon(level: number): string {
  const icons = ['', '🟢', '🟡', '🟠', '🔴', '💀'];
  return icons[level] || '🟡';
}

export function formatItemHtml(t: any, item: any): string {
  let message = `🎁 <b>${item.name}</b>\n`;
  
  // Item info line
  const rarityIcon = getRarityIcon(item.rarity);
  message += `${rarityIcon} ${t(`rarity_${item.rarity}`)} • ${t(`item_type_${item.type}`)} • ${t('level')} ${item.level}\n\n`;
  
  // Description
  message += `📝 <b>${t('description')}:</b>\n${item.description}\n\n`;
  
  // Effects
  if (item.effects && Array.isArray(item.effects) && item.effects.length > 0) {
    message += `✨ <b>${t('effects')}:</b>\n`;
    item.effects.forEach((effect: string) => {
      message += `• ${effect}\n`;
    });
    message += `\n`;
  }
  
  // Place context
  if (item.locationContext && typeof item.locationContext === 'object') {
    const context = item.locationContext;
    message += `🏛️ <b>${t('origin')}:</b> ${context.placeName}\n`;
    if (context.originStory) {
      message += `📜 ${context.originStory}\n`;
    }
    message += `\n`;
  }
  
  // Plot context
  if (item.plotContext && typeof item.plotContext === 'object') {
    const context = item.plotContext;
    message += `📖 <b>${t('plot_connection')}:</b> ${context.plotName}\n`;
    if (context.narrativeRole) {
      message += `🎭 ${context.narrativeRole}\n`;
    }
    if (context.usageHints && Array.isArray(context.usageHints)) {
      message += `💡 <b>${t('usage_hints')}:</b>\n`;
      context.usageHints.forEach((hint: string) => {
        message += `• ${hint}\n`;
      });
    }
    message += `\n`;
  }
  
  // Tags
  if (item.autoTags && Array.isArray(item.autoTags) && item.autoTags.length > 0) {
    message += `🏷️ <b>${t('tags')}:</b>\n`;
    message += item.autoTags.map((tag: string) => `#${tag}`).join(' ');
    message += `\n\n`;
  }

  return message;
}

function getRarityIcon(rarity: string): string {
  const icons: Record<string, string> = {
    'common': '⚪',
    'uncommon': '🟢',
    'rare': '🔵',
    'very-rare': '🟣',
    'legendary': '🟠',
    'artifact': '🔴'
  };
  return icons[rarity] || '⚪';
}

export function formatEventHtml(t: any, event: any): string {
  let message = `🎭 <b>${event.title}</b>\n`;
  
  // Event type and level info
  const typeIcon = getEventTypeIcon(event.type);
  const difficultyIcon = getEventDifficultyIcon(event.difficulty);
  
  message += `${typeIcon} ${t(`event_type_${event.type}`) || event.type}`;
  message += ` • ${t('level')} ${event.level}`;
  message += ` • ${difficultyIcon} ${t(`event_difficulty_${event.difficulty}`) || event.difficulty}\n\n`;
  
  // Description
  message += `📜 <b>${t('event_description')}:</b>\n${event.description}\n\n`;
  
  // Objective
  if (event.objective) {
    message += `🎯 <b>${t('objective')}:</b>\n${event.objective}\n\n`;
  }
  
  // Primary skill check
  if (event.primarySkillCheck && typeof event.primarySkillCheck === 'object') {
    const skillCheck = event.primarySkillCheck;
    const skillName = t(`skill_${skillCheck.skill}`) || skillCheck.skill;
    message += `🎯 <b>${t('primary_skill_check')}:</b>\n`;
    message += `• <b>${skillName}</b> (DC ${skillCheck.dc})\n`;
    message += `  📝 ${skillCheck.description}\n`;
    if (skillCheck.successOutcome) {
      message += `  ✅ <b>${t('success')}:</b> ${skillCheck.successOutcome}\n`;
    }
    if (skillCheck.failureOutcome) {
      message += `  ❌ <b>${t('failure')}:</b> ${skillCheck.failureOutcome}\n`;
    }
    if (skillCheck.alternativeSkills && Array.isArray(skillCheck.alternativeSkills) && skillCheck.alternativeSkills.length > 0) {
      message += `  🔄 <b>${t('alternative_skills')}:</b> ${skillCheck.alternativeSkills.join(', ')}\n`;
    }
    message += `\n`;
  }
  
  // Secondary skill checks
  if (event.secondarySkillChecks && Array.isArray(event.secondarySkillChecks) && event.secondarySkillChecks.length > 0) {
    message += `🎲 <b>${t('secondary_skill_checks')}:</b>\n`;
    event.secondarySkillChecks.forEach((skillCheck: any) => {
      const skillName = t(`skill_${skillCheck.skill}`) || skillCheck.skill;
      message += `• <b>${skillName}</b> (DC ${skillCheck.dc})\n`;
      message += `  📝 ${skillCheck.description}\n`;
      if (skillCheck.successOutcome) {
        message += `  ✅ ${skillCheck.successOutcome}\n`;
      }
      if (skillCheck.failureOutcome) {
        message += `  ❌ ${skillCheck.failureOutcome}\n`;
      }
    });
    message += `\n`;
  }
  
  // Escalation
  if (event.escalation && typeof event.escalation === 'object') {
    const escalation = event.escalation;
    message += `⚡ <b>${t('escalation')}:</b>\n`;
    message += `• <b>${t('trigger')}:</b> ${escalation.trigger}\n`;
    message += `• <b>${t('consequence')}:</b> ${escalation.consequence}\n`;
    if (escalation.resolution) {
      message += `• <b>${t('resolution')}:</b> ${escalation.resolution}\n`;
    }
    message += `\n`;
  }
  
  
  // Failure consequences
  if (event.failureConsequences && Array.isArray(event.failureConsequences) && event.failureConsequences.length > 0) {
    message += `💔 <b>${t('failure_consequences')}:</b>\n`;
    event.failureConsequences.forEach((consequence: string) => {
      message += `• ${consequence}\n`;
    });
    message += `\n`;
  }
  
  // Place context from generated JSON
  const placeContext = event.placeContext;
  if (placeContext && typeof placeContext === 'object') {
    const context = placeContext;
    console.log('🏛️ Displaying event place context:', context);
    message += `🏛️ <b>${t('location_context')}:</b>\n`;
    if (context.placeName) {
      message += `📍 ${t('place')}: ${context.placeName}\n`;
    }
    if (context.environmentalFactors && Array.isArray(context.environmentalFactors)) {
      message += `🌍 <b>${t('environmental_factors')}:</b>\n`;
      context.environmentalFactors.forEach((factor: string) => {
        message += `• ${factor}\n`;
      });
    }
    if (context.tacticalConsiderations && Array.isArray(context.tacticalConsiderations)) {
      message += `⚔️ <b>${t('tactical_considerations')}:</b>\n`;
      context.tacticalConsiderations.forEach((consideration: string) => {
        // Clean up malformed considerations (remove leading commas)
        const cleanConsideration = consideration.replace(/^,\s*/, '').trim();
        if (cleanConsideration) {
          message += `• ${cleanConsideration}\n`;
        }
      });
    }
    message += `\n`;
  }
  
  // Plot context from generated JSON
  if (event.plotContext && typeof event.plotContext === 'object') {
    const context = event.plotContext;
    message += `📖 <b>${t('plot_connection')}:</b>\n`;
    if (context.plotName) {
      message += `📚 ${t('plot_name')}: ${context.plotName}\n`;
    }
    if (context.narrativeRole) {
      message += `🎭 ${t('narrative_role')}: ${context.narrativeRole}\n`;
    }
    if (context.plotRelevance) {
      message += `🔗 ${t('plot_relevance')}: ${context.plotRelevance}\n`;
    }
    message += `\n`;
  }
  
  // Place relation from database (if available)
  if (event.place) {
    message += `🏛️ <b>${t('location')}:</b> ${event.place.name}\n`;
    if (event.place.type) {
      message += `📍 ${t(`place_type_${event.place.type}`) || event.place.type}\n`;
    }
    message += `\n`;
  }
  
  // Plot relation from database (if available)
  if (event.plot) {
    message += `📖 <b>${t('connected_plot')}:</b> ${event.plot.title}\n`;
    if (event.plot.theme) {
      message += `🎯 ${t('theme')}: ${t(`plot_theme_${event.plot.theme}`) || event.plot.theme}\n`;
    }
    message += `\n`;
  }
  
  // Tags
  if (event.autoTags && Array.isArray(event.autoTags) && event.autoTags.length > 0) {
    message += `🏷️ <b>${t('tags')}:</b>\n`;
    message += event.autoTags.map((tag: string) => `#${tag}`).join(' ');
    message += `\n\n`;
  }
  
  // Meta info
  message += `📋 <b>${t('event_info')}:</b>\n`;
  message += `${t('type')}: ${t(`event_type_${event.type}`) || event.type}\n`;
  message += `${t('difficulty')}: ${t(`event_difficulty_${event.difficulty}`) || event.difficulty}\n`;
  message += `${t('level')}: ${event.level}`;
  
  if (event.place) {
    message += `\n${t('location')}: ${event.place.name}`;
  }
  if (event.plot) {
    message += `\n${t('plot')}: ${event.plot.title}`;
  }
  
  return message;
}

// Event type icons
function getEventTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    obstacle: '🧗',
    social: '💬',
    exploration: '🗺️',
    puzzle: '🧩',
    trap: '🕳️',
    environmental: '🌩️',
    mystery: '🔍'
  };
  return icons[type] || '🎭';
}

function getEventDifficultyIcon(difficulty: string): string {
  const icons: Record<string, string> = {
    trivial: '🟢',
    easy: '🟡',
    moderate: '🟠',
    hard: '🔴',
    extreme: '💀'
  };
  return icons[difficulty] || '⚪';
}