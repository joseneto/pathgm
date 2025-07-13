import { PlayerCleanupService } from '../../services/playerCleanup';

// Mock node-cron
jest.mock('node-cron', () => ({
  schedule: jest.fn(() => ({
    stop: jest.fn()
  }))
}));

// Mock withPrisma
const mockDeleteMany = jest.fn().mockResolvedValue({ count: 0 });
const mockFindMany = jest.fn().mockResolvedValue([]);

jest.mock('../../lib/withPrisma', () => ({
  withPrisma: jest.fn((callback: any) => {
    return callback({
      player: {
        findMany: mockFindMany,
        deleteMany: mockDeleteMany,
      }
    });
  }),
}));

describe('PlayerCleanupService', () => {
  let cleanupService: PlayerCleanupService;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    cleanupService = PlayerCleanupService.getInstance();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    cleanupService.stop();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = PlayerCleanupService.getInstance();
      const instance2 = PlayerCleanupService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('cleanupInactivePlayers', () => {
    it('should delete players older than 6 months', async () => {
      const mockInactivePlayers = [
        {
          id: 'player1',
          name: 'Old Player',
          alias: 'old_player',
          updatedAt: new Date('2023-01-01'),
          user: { telegramId: '123', name: 'User 1' }
        }
      ];

      mockFindMany.mockResolvedValueOnce(mockInactivePlayers);
      mockDeleteMany.mockResolvedValueOnce({ count: 1 });

      await cleanupService.cleanupInactivePlayers();

      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          updatedAt: {
            lt: expect.any(Date)
          }
        },
        select: expect.any(Object)
      });

      expect(mockDeleteMany).toHaveBeenCalledWith({
        where: {
          updatedAt: {
            lt: expect.any(Date)
          }
        }
      });

      expect(consoleLogSpy).toHaveBeenCalledWith('Player cleanup completed: 1 players removed');
    });

    it('should handle no inactive players', async () => {
      mockFindMany.mockResolvedValueOnce([]);

      await cleanupService.cleanupInactivePlayers();

      expect(consoleLogSpy).toHaveBeenCalledWith('No inactive players found for cleanup');
      expect(mockDeleteMany).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockFindMany.mockRejectedValueOnce(new Error('Database error'));

      await cleanupService.cleanupInactivePlayers();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error during player cleanup:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });

  describe('start and stop', () => {
    it('should start cron job', () => {
      const cron = require('node-cron');
      
      cleanupService.start();

      expect(cron.schedule).toHaveBeenCalledWith(
        '0 2 * * *',
        expect.any(Function),
        {
          timezone: 'UTC'
        }
      );
      expect(consoleLogSpy).toHaveBeenCalledWith('Player cleanup cron job started (runs daily at 2 AM UTC)');
    });

    it('should not start if already running', () => {
      const cron = require('node-cron');
      
      cleanupService.start();
      cleanupService.start();

      expect(cron.schedule).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith('Player cleanup cron job is already running');
    });

    it('should stop cron job', () => {
      cleanupService.start();
      cleanupService.stop();

      expect(consoleLogSpy).toHaveBeenCalledWith('Player cleanup cron job stopped');
    });
  });

  describe('runCleanupNow', () => {
    it('should trigger manual cleanup', async () => {
      const cleanupSpy = jest.spyOn(cleanupService, 'cleanupInactivePlayers').mockResolvedValue();

      await cleanupService.runCleanupNow();

      expect(consoleLogSpy).toHaveBeenCalledWith('Manual player cleanup triggered');
      expect(cleanupSpy).toHaveBeenCalled();

      cleanupSpy.mockRestore();
    });
  });
});