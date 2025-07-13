import { isGroup } from "./isGroup";

export const getEffectiveTelegramId = (ctx: any) => {
  const chatId = ctx.chat?.id ?? ctx.message?.chat?.id ?? ctx.callbackQuery?.message?.chat?.id;
  const userId = ctx.from?.id;
  return isGroup(ctx)
    ? chatId?.toString()
    : userId?.toString();
};
