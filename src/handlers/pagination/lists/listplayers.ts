import { TFunction } from 'i18next';
import { formatPlayerHtml } from '../../../utils/htmlOutputFormat';
import { actionButtons } from '../../../helpers/actionButtons';
import { withPrisma } from '../../../lib/withPrisma';

export const listplayers = {
  getItems: async (
    userId: string,
    page = 0,
    pageSize = 6,
    classFilter?: string,
    ancestryFilter?: string,
    levelFilter?: number,
    statusFilter?: string
  ) => {
    if (!classFilter && !ancestryFilter && !levelFilter && !statusFilter) {
      return await getStandardListing(userId, page, pageSize);
    }

    return await getFilteredListing(userId, page, pageSize, classFilter, ancestryFilter, levelFilter, statusFilter);
  },

  getItemDetails: async (id: string, t: TFunction): Promise<any> => {
    const player = await withPrisma(async (prisma) => {
      return await prisma.player.findUnique({ where: { id } });
    });
    if (!player) return { formated: t('player_not_found'), item: null };

    return {
      formated: formatPlayerHtml(player as any, t),
      item: player
    };
  },

  createActionButtons: (player: any, t: TFunction) => {
    return actionButtons(player, 'player', t);
  },

  deleteItem: async (id: string) => {
    await withPrisma(async (prisma) => {
      return await prisma.player.delete({ where: { id } });
    });
  },
};

async function getStandardListing(userId: string, page: number, pageSize: number) {
  const [items, totalCount] = await Promise.all([
    withPrisma(async (prisma) => {
      return await prisma.player.findMany({
        where: { userId },
        skip: page * pageSize,
        take: pageSize,
        orderBy: { updatedAt: 'desc' }
      });
    }),
    withPrisma(async (prisma) => {
      return await prisma.player.count({ where: { userId } });
    }),
  ]);

  return {
    items: items.map(player => formatPlayerListItem(player)),
    totalCount,
    searchInfo: undefined
  };
}

async function getFilteredListing(
  userId: string,
  page: number,
  pageSize: number,
  classFilter?: string,
  ancestryFilter?: string,
  levelFilter?: number,
  statusFilter?: string
) {
  // Build where clause
  let whereClause: any = { userId };

  // Add class filter
  if (classFilter) {
    whereClause.class = {
      contains: classFilter,
      mode: 'insensitive'
    };
  }

  // Add ancestry filter
  if (ancestryFilter) {
    whereClause.ancestry = {
      contains: ancestryFilter,
      mode: 'insensitive'
    };
  }

  // Add level filter
  if (levelFilter) {
    whereClause.level = levelFilter;
  }

  // Add status filter
  if (statusFilter) {
    whereClause.status = statusFilter;
  }

  const candidatePlayers = await withPrisma(async (prisma) => {
    return await prisma.player.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' }
    });
  });

  const paginatedPlayers = candidatePlayers.slice(page * pageSize, (page + 1) * pageSize);

  return {
    items: paginatedPlayers.map(player => formatPlayerListItem(player)),
    totalCount: candidatePlayers.length,
    searchInfo: undefined
  };
}

function formatPlayerListItem(player: any): { label: string; type: string; callbackId: string } {
  const autoTags = (player.autoTags as string[]) || [];
  const topTags = autoTags.slice(0, 2);

  let contextInfo = `${player.className} • Lv.${player.level}`;

  if (player.status && player.status !== 'active') {
    contextInfo += ` • ${player.status}`;
  }

  if (topTags.length > 0) {
    contextInfo += ` • ${topTags.join(', ')}`;
  }

  return {
    label: `${player.name} • ${contextInfo}`,
    type: 'player',
    callbackId: player.id,
  };
};
