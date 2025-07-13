import { getTranslation, getD20HelpMessage } from '../helpers/commandHelpers';

export const d20Command = async (ctx: any) => {
  const [t] = getTranslation(ctx);
  const args = ctx.message?.text?.split(' ').slice(1) || [];

  // Handle help
  if (args.includes('-h') || args.includes('--help') || args.includes('help')) {
    const helpMessage = getD20HelpMessage(t);
    await ctx.reply(helpMessage, { parse_mode: 'HTML' });
    return;
  }

  const name = ctx.from?.first_name || ctx.from?.username || 'Usuário';

  const input = args[0] || '';
  const match = input.match(/^([+-]?\d+)$/);
  const modifier = match ? parseInt(match[1], 10) : 0;

  const clampedModifier = Math.max(-100, Math.min(100, modifier));

  const roll = Math.floor(Math.random() * 20) + 1;
  const total = roll + clampedModifier;
  const sign = clampedModifier >= 0 ? `+${clampedModifier}` : `${clampedModifier}`;

  const message = clampedModifier !== 0
    ? t('d20_result_with_modifier', { name, total, roll, sign })
    : t('d20_result_plain', { name, roll });

  await ctx.reply(message);
};
