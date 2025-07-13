type SkillType = Record<string, number | Record<string, number>>;

type ParsedPlayer = {
  pathbuilderId: string;
  name: string;
  alias: string;
  className: string;
  level: number;
  perception: number;
  fortitude: number;
  reflex: number;
  will: number;
  skills: SkillType;
};

const SKILL_ATTRIBUTE_MAP: Record<string, 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'> = {
  acrobatics: 'dex',
  arcana: 'int',
  athletics: 'str',
  crafting: 'int',
  deception: 'cha',
  diplomacy: 'cha',
  intimidation: 'cha',
  medicine: 'wis',
  nature: 'wis',
  occultism: 'int',
  performance: 'cha',
  religion: 'wis',
  society: 'int',
  stealth: 'dex',
  survival: 'wis',
  thievery: 'dex',
};

function getDexPenaltyFromArmor(armor: any[]): number {
  if (!Array.isArray(armor)) return 0;

  const wornArmor = armor.find((a) =>
    a.worn === true &&
    ['light', 'medium', 'heavy'].includes(a.prof)
  );

  if (!wornArmor) return 0;

  switch (wornArmor.prof) {
    case 'light': return 1;
    case 'medium': return 2;
    case 'heavy': return 3;
    default: return 0;
  }
}

function estimateRequiredStrength(acItemBonus: number): number | null {
  if (acItemBonus >= 6) return 18;
  if (acItemBonus >= 4) return 16;
  if (acItemBonus === 3) return 14;
  if (acItemBonus === 2) return 12;
  return null;
}

function hasArmorStrengthPenalty(acItemBonus: number, strMod: number): boolean {
  const requiredStr = estimateRequiredStrength(acItemBonus);
  if (!requiredStr) return false;

  const actualStr = 10 + strMod;
  return actualStr < requiredStr;
}

function calculateModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

function calculateDefense(base = 0, level = 0, abilityMod = 0): number {
  return base + level + abilityMod;
}

function calculateSkillProficiency(base = 0, level = 0, abilityMod = 0): number {
  return base + level + abilityMod;
}

export function parsePathbuilderCharacter(json: any, id: string): ParsedPlayer | null {
  if(!json.success) {
    return null;
  }
  const { build } = json;

  if (!build || !build.name || !build.class || !build.level || !build.abilities || !build.proficiencies) {
    return null;
  }

  const prof = build.proficiencies ?? {};
  const abilities = build.abilities ?? {};
  const armorList = build.armor ?? [];
  const lores = build.lores ?? [];

  const abilityMods = {
    str: calculateModifier(abilities.str),
    dex: calculateModifier(abilities.dex),
    con: calculateModifier(abilities.con),
    int: calculateModifier(abilities.int),
    wis: calculateModifier(abilities.wis),
    cha: calculateModifier(abilities.cha),
  };

  const level = build.level ?? 0;
  const acItemBonus = build.acTotal?.acItemBonus || 0;
  const strengthMod = abilityMods.str ?? 0;
  const armorPenaltyActive = hasArmorStrengthPenalty(acItemBonus, strengthMod);

  const dexPenalty = armorPenaltyActive ? getDexPenaltyFromArmor(armorList) : 0;

  const excluded = ['advanced', 'classdc', 'perception', 'fortitude', 'reflex', 'will', 'heavy', 'medium', 'light', 'unarmored', 'martial', 'simple', 'unarmed', 'castingarcane', 'castingdivine', 'castingoccult', 'castingprimal'];
  const skills: SkillType = {};

  for (const [key, value] of Object.entries(prof)) {
    const skillKey = key.toLowerCase();
    if (!excluded.includes(skillKey.toLowerCase()) && typeof value === 'number') {
      const ability = SKILL_ATTRIBUTE_MAP[skillKey] || 'int';
      let mod = abilityMods[ability] ?? 0;

      if (ability === 'dex') {
        mod -= dexPenalty;
      }

      skills[skillKey] = calculateSkillProficiency(value, level, mod);
    }
  }

  const loreSkills: Record<string, number> = {};
  for (const [name, rank] of lores) {
    if (typeof name === 'string' && typeof rank === 'number') {
      const total = calculateSkillProficiency(rank, level, abilityMods.int);
      loreSkills[name.toLowerCase()] = total;
    }
  }

  if (Object.keys(loreSkills).length > 0) {
    skills.lores = loreSkills;
  }

  const name = build.name.trim();
  return {
    pathbuilderId: id,
    name,
    alias: name.split(' ')[0],
    className: build.class,
    level,
    perception: calculateDefense(prof.perception, level, abilityMods.wis),
    fortitude: calculateDefense(prof.fortitude, level, abilityMods.con),
    reflex: calculateDefense(prof.reflex, level, abilityMods.dex),
    will: calculateDefense(prof.will, level, abilityMods.wis),
    skills,
  };
}
