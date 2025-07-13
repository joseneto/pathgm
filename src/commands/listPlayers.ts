import { generateInteractiveListMarkup } from '../helpers/interactiveList';
import { listHandler } from '../handlers/pagination/listHandler';
import { getListPlayersHelpMessage, getTranslation } from '../helpers/commandHelpers';

interface SearchParams {
  classFilter?: string;
  ancestryFilter?: string;
  levelFilter?: number;
  statusFilter?: string;
  showHelp?: boolean;
}

function parseSearchArgs(args: string[]): SearchParams {
  let classFilter: string | undefined;
  let ancestryFilter: string | undefined;
  let levelFilter: number | undefined;
  let statusFilter: string | undefined;

  // Check for help flag
  const showHelp = args.includes('help') || args.includes('--help') || args.includes('-h');

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    // Parse --class
    if (arg === '--class' && i + 1 < args.length) {
      classFilter = args[i + 1];
      i++;
      continue;
    }

    // Parse --ancestry
    if (arg === '--ancestry' && i + 1 < args.length) {
      ancestryFilter = args[i + 1];
      i++;
      continue;
    }

    // Parse --level
    if (arg === '--level' && i + 1 < args.length) {
      const level = parseInt(args[i + 1]);
      if (!isNaN(level) && level >= 1 && level <= 20) {
        levelFilter = level;
      }
      i++;
      continue;
    }

    // Parse --status
    if (arg === '--status' && i + 1 < args.length) {
      statusFilter = args[i + 1];
      i++;
      continue;
    }
  }

  return { classFilter, ancestryFilter, levelFilter, statusFilter, showHelp };
}

export async function listPlayersCommand(ctx: any) {
  const [t] = getTranslation(ctx);

  // Parse command arguments
  const args = ctx.message?.text?.split(' ').slice(1) || [];
  const params = parseSearchArgs(args);
  const { classFilter, ancestryFilter, levelFilter, statusFilter, showHelp } = params;

  // Show help if requested
  if (showHelp) {
    const helpMessage = getListPlayersHelpMessage(t);
    await ctx.reply(helpMessage, { parse_mode: 'HTML' });
    return;
  }

  ctx.session.paginationEnabled = true;
  ctx.session.classFilter = classFilter;
  ctx.session.ancestryFilter = ancestryFilter;
  ctx.session.levelFilter = levelFilter;
  ctx.session.statusFilter = statusFilter;

  const { items, totalCount } = await listHandler.listplayers.getItems(
    ctx.user.id,
    0,
    6,
    classFilter,
    ancestryFilter,
    levelFilter,
    statusFilter,
  );

  if (totalCount === 0) {
    let emptyMessage = t('listplayers_empty');

    if (classFilter) {
      emptyMessage += `\n${t('of_class')}: ${t(`class_${classFilter}`)}`;
    }

    if (ancestryFilter) {
      emptyMessage += `\n${t('of_ancestry')}: ${t(`ancestry_${ancestryFilter}`)}`;
    }

    if (levelFilter) {
      emptyMessage += `\n${t('of_level')}: ${levelFilter}`;
    }

    if (statusFilter) {
      emptyMessage += `\n${t('with_status')}: ${t(`status_${statusFilter}`)}`;
    }

    emptyMessage += `\n\n💡 ${t('try_listplayers_help')}`;

    await ctx.reply(emptyMessage, { parse_mode: 'HTML' });
    return;
  }

  // Build response message
  let message = t('listplayers_prompt');

  // Add filter information
  const filters: string[] = [];

  if (classFilter) {
    filters.push(`${t('class')}: ${t(`class_${classFilter}`)}`);
  }

  if (ancestryFilter) {
    filters.push(`${t('ancestry')}: ${t(`ancestry_${ancestryFilter}`)}`);
  }

  if (levelFilter) {
    filters.push(`${t('level')}: ${levelFilter}`);
  }

  if (statusFilter) {
    filters.push(`${t('status')}: ${t(`status_${statusFilter}`)}`);
  }

  if (filters.length > 0) {
    message = `${t('players_filtered_by')}: ${filters.join(', ')}\n\n${message}`;
  }

  // Add help hint
  message += `\n\n💡 ${t('use_help_for_player_filters')}: <code>/listplayers help</code>`;

  const markup = generateInteractiveListMarkup({
    items,
    page: 0,
    baseCallback: 'listplayers',
    totalCount,
    t,
  });

  await ctx.reply(message, {
    reply_markup: markup,
    parse_mode: 'HTML',
  });
}
