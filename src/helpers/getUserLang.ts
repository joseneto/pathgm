import { Context } from 'telegraf';

export function getUserLang(ctx: Context): 'pt' | 'en' {
  const langCode = ctx.from?.language_code?.toLowerCase();
  return langCode?.startsWith('pt') ? 'pt' : 'en';
}
