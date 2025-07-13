import { TFunction } from 'i18next';

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
