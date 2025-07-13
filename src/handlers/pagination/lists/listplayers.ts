import { TFunction } from 'i18next';
import { prisma } from '@pathgm/shared/generated/client';
import { formatPlayerHtml } from '../../../utils/htmlOutputFormat';
import { TagUtils } from '../../../utils/tagUtils';
import { actionButtons } from '../../../helpers/actionButtons';

interface PlayerWithScore {
  player: any;
  relevanceScore: number;
  matchingTags: string[];
}

export const listplayers = {
  getItems: async (
    userId: string, 
    page = 0, 
    pageSize = 8,
    searchTags?: string[],
    classFilter?: string,
    ancestryFilter?: string,
    levelFilter?: number,
    statusFilter?: string
  ) => {
    if ((!searchTags || searchTags.length === 0) && !classFilter && !ancestryFilter && !levelFilter && !statusFilter) {
      return await getStandardListing(userId, page, pageSize);
    }

    return await getFilteredListing(userId, page, pageSize, searchTags, classFilter, ancestryFilter, levelFilter, statusFilter);
  },

  getItemDetails: async (id: string, t: TFunction): Promise<any> => {
    const player = await prisma.player.findUnique({ where: { id } });
    if (!player) return { formated: t('player_not_found'), item: null };

    return { 
      formated: formatPlayerHtml(player as any, t), 
      item: player 
    };
  },

  createActionButtons: (player: any, t: TFunction) => {
    console.log(`📋 Creating action buttons for Player: ${player.name} (ID: ${player.id})`);

    return actionButtons(player, 'player', t, false);
  },

  deleteItem: async (id: string) => {
    await prisma.player.delete({ where: { id } });
  },
};

async function getStandardListing(userId: string, page: number, pageSize: number) {
  const [items, totalCount] = await Promise.all([
    prisma.player.findMany({
      where: { userId },
      skip: page * pageSize,
      take: pageSize,
      orderBy: { updatedAt: 'desc' }
    }),
    prisma.player.count({ where: { userId } }),
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
  searchTags?: string[],
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

  // Add tag filter if provided
  if (searchTags && searchTags.length > 0) {
    const normalizedSearchTags = TagUtils.normalizeUserTags(searchTags);
    whereClause.autoTags = {
      hasSome: normalizedSearchTags
    };
  }

  const candidatePlayers = await prisma.player.findMany({
    where: whereClause,
    orderBy: { updatedAt: 'desc' }
  });

  // If we have search tags, calculate relevance scores
  if (searchTags && searchTags.length > 0) {
    const normalizedSearchTags = TagUtils.normalizeUserTags(searchTags);
    
    const playersWithScores: PlayerWithScore[] = candidatePlayers
      .map(player => calculateRelevanceScore(player, normalizedSearchTags))
      .filter(item => item.relevanceScore > 0)
      .sort((a, b) => {
        if (b.relevanceScore !== a.relevanceScore) {
          return b.relevanceScore - a.relevanceScore;
        }
        return new Date(b.player.updatedAt).getTime() - new Date(a.player.updatedAt).getTime();
      });

    const paginatedPlayers = playersWithScores.slice(page * pageSize, (page + 1) * pageSize);

    return {
      items: paginatedPlayers.map(item => formatPlayerListItemWithScore(item)),
      totalCount: playersWithScores.length,
      searchInfo: {
        minTagsRequired: 1,
        totalCandidates: candidatePlayers.length
      }
    };
  }

  // Simple filtering without tag scoring
  const paginatedPlayers = candidatePlayers.slice(page * pageSize, (page + 1) * pageSize);

  return {
    items: paginatedPlayers.map(player => formatPlayerListItem(player)),
    totalCount: candidatePlayers.length,
    searchInfo: undefined
  };
}

function calculateRelevanceScore(player: any, searchTags: string[]): PlayerWithScore {
  const playerAutoTags = (player.autoTags as string[]) || [];
  const matchingTags = TagUtils.getMatchingTags(searchTags, playerAutoTags);
  const relevanceScore = matchingTags.length;

  return {
    player,
    relevanceScore,
    matchingTags
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
}

function formatPlayerListItemWithScore(item: PlayerWithScore): { label: string; type: string; callbackId: string } {
  const { player, relevanceScore, matchingTags } = item;
  
  const matchingTagsDisplay = matchingTags.slice(0, 2).join(', ');
  const scoreIndicator = relevanceScore > 1 ? ` (${relevanceScore}✓)` : '';
  
  let contextInfo = `${player.className} • Lv.${player.level}`;
  
  if (player.status && player.status !== 'active') {
    contextInfo += ` • ${player.status}`;
  }
  
  contextInfo += ` • ${matchingTagsDisplay}`;

  return {
    label: `${player.name}${scoreIndicator} • ${contextInfo}`,
    type: 'player',
    callbackId: player.id,
  };
}
