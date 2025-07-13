import * as dotenv from 'dotenv'

// Load .env file if exists (development fallback)
// In production, use system environment variables (Vercel, Railway, etc.)
dotenv.config()

import { Telegraf, session } from 'telegraf'
import { initI18n } from './i18n'
import { startCommand } from './commands/start'
import { handleTextInput } from './handlers/text/handleTextInput'
import { rollCommand } from './commands/roll'
import { rollAllCommand } from './commands/rollAll'
import { clearDataCommand } from './commands/clearData'
import { menuCommand } from './commands/menu'
import { makeSafeWrapper } from './utils/makeSafeWrapper'
import { d20Command } from './commands/d20'
import { initDynamicCommands } from './helpers/initDynamicCommands'
import { handleCallbackQuery } from './handlers/handleCallbackQuery'
import { importPlayerCommand } from './commands/importPlayer'
import { syncPlayersCommand } from './commands/syncPlayers'
import { newPlayerCommand } from './commands/newPlayer'
import { editPlayerCommand } from './commands/editPlayer'
import { aboutCommand } from './commands/about'
import { helpCommand } from './commands/help'

async function main() {
  await initI18n()

  const bot = new Telegraf<any>(process.env.TELEGRAM_BOT_TOKEN!)
  bot.use(session())
  const safeWrapper = makeSafeWrapper(bot);

  bot.start(safeWrapper(async (ctx) => {
    await initDynamicCommands(bot, ctx);
    await startCommand(ctx);
  }));

  bot.command('importplayer', safeWrapper(importPlayerCommand))
  bot.command('roll', safeWrapper(rollCommand))
  bot.command('rollall', safeWrapper(rollAllCommand))
  bot.command('d20', safeWrapper(d20Command));
  bot.command('syncplayers', safeWrapper(syncPlayersCommand))
  bot.command('cleardata', safeWrapper(clearDataCommand))
  bot.command('menu', safeWrapper(menuCommand))
  bot.command('about',safeWrapper(aboutCommand))
  bot.command('help', safeWrapper(helpCommand))
  bot.command('newplayer', safeWrapper(newPlayerCommand));
  bot.command('editplayer', safeWrapper(editPlayerCommand))

  bot.on('message', safeWrapper(handleTextInput))

  bot.on('callback_query', async (ctx) => {
    await handleCallbackQuery(ctx, safeWrapper)
  })

  bot.launch()
}

main()
