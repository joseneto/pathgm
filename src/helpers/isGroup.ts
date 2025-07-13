export function isGroup(ctx: any): boolean {
  const isCallbackQuery = ctx.callbackQuery && 'data' in ctx.callbackQuery;

  return  (ctx.chat?.type === 'group' || ctx.chat?.type === 'supergroup') && !isCallbackQuery;
}
