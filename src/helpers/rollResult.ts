import { TFunction } from "i18next";
import { escapeMarkdown } from "../utils/escapeMarkdown";
import { Player } from "generated/client";

function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

export function rollResult(
  player: Player,
  inputAttribute: string,
  modifier: number,
  results: string[],
  t: TFunction<"translation", undefined>
) {
  const saveFields = ['perception', 'fortitude', 'reflex', 'will'] as const;
  type SaveField = (typeof saveFields)[number];
  const attribute = inputAttribute.toLowerCase();

  let base = 0;

  if (attribute === 'lore' || attribute === 'lores') {
    const lores = (player.skills as any)?.lores ?? {};
    if (Object.keys(lores).length === 0) {
      results.push(t('roll_no_lores', { name: player.name }));
      return;
    }

    for (const [loreKey, loreValue] of Object.entries(lores as Record<string, number>)) {
      const die = rollDie(20);
      const total = die + loreValue + modifier;
      const sign = modifier >= 0 ? '+' : '-';
      const modDisplay = modifier !== 0 ? ` ${sign} ${Math.abs(modifier)}` : '';

      results.push(t('roll_result', {
        name: escapeMarkdown(player.name),
        attribute: escapeMarkdown(`Lore (${capitalize(loreKey)})`),
        die,
        base: loreValue,
        modDisplay,
        total
      }));
    }

    return;
  }

  if (saveFields.includes(attribute as SaveField)) {
    base = player[attribute as SaveField] ?? 0;
  } else {
    const skills = player.skills as Record<string, number>;
    base = skills?.[attribute] ?? 0;

    if (base === 0 && !(attribute in skills)) {
      results.push(t('roll_attribute_not_found', {
        attribute,
        name: player.name
      }));
      return;
    }
  }

  const die = rollDie(20);
  const total = die + base + modifier;
  const sign = modifier >= 0 ? '+' : '-';
  const modDisplay = modifier !== 0 ? ` ${sign} ${Math.abs(modifier)}` : '';

  results.push(t('roll_result', {
    name: escapeMarkdown(player.name),
    attribute: escapeMarkdown(attribute),
    die,
    base,
    modDisplay,
    total
  }));
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
