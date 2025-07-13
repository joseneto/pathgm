import * as dotenv from 'dotenv'

// Load .env file if exists (development fallback)
// In production, use system environment variables (Vercel, Railway, etc.)
dotenv.config()

import { Telegraf, session } from 'telegraf'
import { initI18n } from './i18n'
import { startCommand } from './commands/start'
import { handleTextInput } from './handlers/text/handleTextInput'
import { noteCommand } from './commands/note'
import { rollCommand } from './commands/roll'
import { listPlayersCommand } from './commands/listPlayers'
import { listNotesCommand } from './commands/listNotes'
import { listNpcsCommand } from './commands/listNpcs'
import { rollAllCommand } from './commands/rollAll'
import { listEncountersCommand } from './commands/listEncounters'
import { listEventsCommand } from './commands/listEvents'
import { clearDataCommand } from './commands/clearData'
import { menuCommand } from './commands/menu'
import { listPlotsCommand } from './commands/listPlots'
import { makeSafeWrapper } from './utils/makeSafeWrapper'
import { d20Command } from './commands/d20'
import { initDynamicCommands } from './helpers/initDynamicCommands'
import { handleCallbackQuery } from './handlers/handleCallbackQuery'
import { listItemsCommand } from './commands/listItems'
import { creditsCommand } from './commands/credits'
import { importPlayerCommand } from './commands/importPlayer'
import { syncPlayersCommand } from './commands/syncPlayers'
import { newPlayerCommand } from './commands/newPlayer'
import { editPlayerCommand } from './commands/editPlayer'
import { genNpcCommand } from './commands/genNpc'
import { genPlotCommand } from './commands/genPlot'
import { genEncounterCommand } from './commands/genEncounter'
import { genEventCommand } from './commands/genEvent'
import { genItemCommand } from './commands/genItem'
import { genPlayerCommand } from './commands/genPlayer'
import { aboutCommand } from './commands/about'
import { helpCommand } from './commands/help'
import { genContextualCommand } from './commands/genContextual'
import { genRegionCommand } from './commands/genRegion'
import { askRuleCommand } from './commands/askRule'
import { listRegionsCommand } from './commands/listRegions'
import { genPlaceCommand } from './commands/genPlace'
import { listPlacesCommand } from './commands/listPlaces'
import { narrateCommand } from './commands/narrate'
import { plansCommand } from './commands/plans'
import { historyCommand } from './commands/history'
import { adminOnly } from './middleware/adminMiddleware'
import { adminGrantUnlimitedCommand } from './commands/admin/adminGrantUnlimited'
import { adminStatsCommand } from './commands/admin/adminStats'
import { adminSearchUserCommand } from './commands/admin/adminSearchUser'
import { adminGrantCreditsCommand } from './commands/admin/adminGrantCredits'
import { sendAdminHelp } from './middleware/adminMiddleware'

async function main() {
  await initI18n()

  const bot = new Telegraf<any>(process.env.TELEGRAM_BOT_TOKEN!)
  bot.use(session())
  const safeWrapper = makeSafeWrapper(bot);

  bot.start(safeWrapper(async (ctx) => {
    await initDynamicCommands(bot, ctx);
    await startCommand(ctx);
  }));
  bot.command('gennpc', safeWrapper(genNpcCommand))
  bot.command('note', safeWrapper(noteCommand))
  bot.command('genplot', safeWrapper(genPlotCommand))
  bot.command('listplots', safeWrapper(listPlotsCommand))
  bot.command('listnotes', safeWrapper(listNotesCommand))
  bot.command('listregions', safeWrapper(listRegionsCommand))
  bot.command('listplaces', safeWrapper(listPlacesCommand))
  bot.command('genencounter', safeWrapper(genEncounterCommand))
  bot.command('genevent', safeWrapper(genEventCommand))
  bot.command('askrule', safeWrapper(askRuleCommand))
  bot.command('importplayer', safeWrapper(importPlayerCommand))
  bot.command('roll', safeWrapper(rollCommand))
  bot.command('listplayers', safeWrapper(listPlayersCommand))
  bot.command('listnpcs', safeWrapper(listNpcsCommand))
  bot.command('rollall', safeWrapper(rollAllCommand))
  bot.command('d20', safeWrapper(d20Command));
  bot.command('syncplayers', safeWrapper(syncPlayersCommand))
  bot.command('listencounters', safeWrapper(listEncountersCommand))
  bot.command('listevents', safeWrapper(listEventsCommand))
  bot.command('cleardata', safeWrapper(clearDataCommand))
  bot.command('menu', safeWrapper(menuCommand))
  bot.command('about',safeWrapper(aboutCommand))
  bot.command('help', safeWrapper(helpCommand))
  bot.command('genitem', safeWrapper(genItemCommand));
  bot.command('listitems', safeWrapper(listItemsCommand));
  bot.command('credits', safeWrapper(creditsCommand));
  bot.command('newplayer', safeWrapper(newPlayerCommand));
  bot.command('genplayer', safeWrapper(genPlayerCommand));
  bot.command('gencontextual', safeWrapper(genContextualCommand));
  bot.command('genregion', safeWrapper(genRegionCommand))
  bot.command('genplace', safeWrapper(genPlaceCommand))
  bot.command('narrate', safeWrapper(narrateCommand))
  bot.command('editplayer', safeWrapper(editPlayerCommand))
  bot.command('plans', safeWrapper(plansCommand))
  bot.command('history', safeWrapper(historyCommand))
  
  // Admin commands - protected by adminOnly middleware
  bot.command('admin_search_user', adminOnly(adminSearchUserCommand))
  bot.command('admin_grant_unlimited', adminOnly(adminGrantUnlimitedCommand))
  bot.command('admin_grant_credits', adminOnly(adminGrantCreditsCommand))
  bot.command('admin_stats', adminOnly(adminStatsCommand))
  bot.command('admin_help', adminOnly(async (ctx) => await sendAdminHelp(ctx)))

  bot.on('message', safeWrapper(handleTextInput))

  bot.on('callback_query', async (ctx) => {
    await handleCallbackQuery(ctx, safeWrapper)
  })

  bot.launch()
}

main()
