import * as cron from 'node-cron';
import { withPrisma } from '../lib/withPrisma';

/**
 * Service to clean up inactive players (not updated for 6+ months)
 */
export class PlayerCleanupService {
  private static instance: PlayerCleanupService;
  private cronJob: cron.ScheduledTask | null = null;

  private constructor() {}

  public static getInstance(): PlayerCleanupService {
    if (!PlayerCleanupService.instance) {
      PlayerCleanupService.instance = new PlayerCleanupService();
    }
    return PlayerCleanupService.instance;
  }

  /**
   * Start the cleanup cron job
   * Runs every day at 2 AM
   */
  public start(): void {
    if (this.cronJob) {
      console.log('Player cleanup cron job is already running');
      return;
    }

    // Run every day at 2 AM
    this.cronJob = cron.schedule('0 2 * * *', async () => {
      await this.cleanupInactivePlayers();
    }, {
      timezone: 'UTC'
    });

    console.log('Player cleanup cron job started (runs daily at 2 AM UTC)');
  }

  /**
   * Stop the cleanup cron job
   */
  public stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      console.log('Player cleanup cron job stopped');
    }
  }

  /**
   * Clean up players that haven't been updated for 6+ months
   */
  public async cleanupInactivePlayers(): Promise<void> {
    try {
      console.log('Starting player cleanup process...');

      // Calculate cutoff date (6 months ago)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const result = await withPrisma(async (prisma) => {
        // Find players not updated for 6+ months
        const inactivePlayers = await prisma.player.findMany({
          where: {
            updatedAt: {
              lt: sixMonthsAgo
            }
          },
          select: {
            id: true,
            name: true,
            alias: true,
            updatedAt: true,
            user: {
              select: {
                telegramId: true,
                name: true
              }
            }
          }
        });

        if (inactivePlayers.length === 0) {
          console.log('No inactive players found for cleanup');
          return { deletedCount: 0, players: [] };
        }

        // Log players to be deleted
        console.log(`Found ${inactivePlayers.length} inactive players to clean up:`);
        inactivePlayers.forEach(player => {
          console.log(`- ${player.name} (${player.alias}) - Last updated: ${player.updatedAt.toISOString()} - User: ${player.user.name} (${player.user.telegramId})`);
        });

        // Delete inactive players
        const deleteResult = await prisma.player.deleteMany({
          where: {
            updatedAt: {
              lt: sixMonthsAgo
            }
          }
        });

        return {
          deletedCount: deleteResult.count,
          players: inactivePlayers
        };
      });

      console.log(`Player cleanup completed: ${result.deletedCount} players removed`);

    } catch (error) {
      console.error('Error during player cleanup:', error);
    }
  }

  /**
   * Manual cleanup trigger (for testing or admin use)
   */
  public async runCleanupNow(): Promise<void> {
    console.log('Manual player cleanup triggered');
    await this.cleanupInactivePlayers();
  }
}