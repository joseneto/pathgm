// Helper for parsing player attributes - shared between editPlayer and newPlayer
// List of valid Pathfinder 2e skills
export const VALID_SKILLS = [
  'acrobatics', 'arcana', 'athletics', 'crafting', 'deception', 'diplomacy',
  'intimidation', 'medicine', 'nature', 'occultism', 'performance', 'religion',
  'society', 'stealth', 'survival', 'thievery',
];

export interface PlayerAttributeUpdates {
  name?: string;
  alias?: string;
  className?: string;
  level?: number;
  perception?: number;
  fortitude?: number;
  reflex?: number;
  will?: number;
  skills?: Record<string, number>;
}

export function isSkillName(key: string): boolean {
  return VALID_SKILLS.includes(key.toLowerCase());
}

/**
 * Parse attribute=value pairs from command arguments
 * Example: ["level=10", "perception=5", "athletics=15"]
 */
export function parseAttributeUpdates(args: string[]): PlayerAttributeUpdates {
  const updates: PlayerAttributeUpdates = {};

  for (const arg of args) {
    const match = arg.match(/^(\w+)=(.+)$/);
    if (match) {
      const [, key, value] = match;

      // Parse different types of values
      if (['level', 'perception', 'fortitude', 'reflex', 'will'].includes(key)) {
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue)) {
          (updates as any)[key] = numValue;
        }
      } else if (['name', 'alias', 'className'].includes(key)) {
        // Remove quotes if present
        (updates as any)[key] = value.replace(/^["']|["']$/g, '');
      } else if (isSkillName(key)) {
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue)) {
          if (!updates.skills) updates.skills = {};
          updates.skills[key.toLowerCase()] = numValue;
        }
      }
    }
  }

  return updates;
}

/**
 * Validate player attribute updates
 */
export function validatePlayerUpdates(
  updates: PlayerAttributeUpdates,
  t: any,
  existingSkills?: Record<string, any>,
): { isValid: boolean; validatedUpdates?: any; errorMessage?: string } {
  const validatedUpdates: any = {};

  for (const [key, value] of Object.entries(updates)) {
    switch (key) {
    case 'name':
    case 'alias':
    case 'className':
      if (typeof value === 'string' && value.length > 0) {
        validatedUpdates[key] = value;
      }
      break;
    case 'level':
      if (typeof value === 'number' && value >= 1 && value <= 20) {
        validatedUpdates[key] = value;
      } else {
        return {
          isValid: false,
          errorMessage: t('editplayer_invalid_level', { value }),
        };
      }
      break;
    case 'perception':
    case 'fortitude':
    case 'reflex':
    case 'will':
      if (typeof value === 'number' && value >= -10 && value <= 50) {
        validatedUpdates[key] = value;
      } else {
        return {
          isValid: false,
          errorMessage: t('editplayer_invalid_stat', { key, value }),
        };
      }
      break;
    case 'skills':
      if (typeof value === 'object' && value !== null) {
        const currentSkills = existingSkills || {};
        const updatedSkills = { ...currentSkills };

        for (const [skillName, skillValue] of Object.entries(value)) {
          if (isSkillName(skillName) && typeof skillValue === 'number' && skillValue >= -10 && skillValue <= 50) {
            updatedSkills[skillName] = skillValue;
          } else {
            return {
              isValid: false,
              errorMessage: t('editplayer_invalid_skill', { skill: skillName, value: skillValue }),
            };
          }
        }

        validatedUpdates[key] = updatedSkills;
      }
      break;
    default:
      return {
        isValid: false,
        errorMessage: t('editplayer_invalid_attribute', { key }),
      };
    }
  }

  return {
    isValid: true,
    validatedUpdates,
  };
}

/**
 * Create default skills object for new players
 */
export function createDefaultSkills(): Record<string, number> {
  const skills: Record<string, number> = {};

  for (const skill of VALID_SKILLS) {
    skills[skill] = 0; // Default all skills to 0
  }

  return skills;
}
