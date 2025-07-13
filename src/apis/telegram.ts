import { getUserLang } from '../helpers/getUserLang';
import { Context } from 'telegraf'

export const sendLocalizedMessage = async (
  ctx: Context,
  key: string,
  vars: Record<string, string> = {}
) => {
  const lang = getUserLang(ctx);
  const t = require('i18next').getFixedT(lang)
  await ctx.reply(t(key, vars))
}
