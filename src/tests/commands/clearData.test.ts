import { clearDataCommand, executeClearData } from '../../commands/clearData';
import { createMockContext } from '../setup/mockContext';
import { resetAllMocks } from '../setup/testSetup';

// Mock all the helper functions
jest.mock('../../helpers/commandHelpers', () => ({
  getTranslation: jest.fn(() => [jest.fn((key: string) => key), 'en']),
  getClearDataHelpMessage: jest.fn(() => 'cleardata_help'),
  buildClearDataMenuMessage: jest.fn(() => 'cleardata_menu'),
}));

// Mock withPrisma directly
const mockDeleteMany = jest.fn();
jest.mock('../../lib/withPrisma', () => ({
  withPrisma: jest.fn((callback: any) => {
    return callback({
      player: {
        deleteMany: mockDeleteMany,
      }
    });
  }),
}));

describe('clearData command', () => {
  let mockContext: any;

  beforeEach(() => {
    resetAllMocks();
    mockDeleteMany.mockClear();
    mockContext = createMockContext({
      user: { id: 123 },
      message: { text: '/cleardata' },
    });
  });

  describe('clearDataCommand', () => {
    it('should show help when help argument is provided', async () => {
      mockContext.message.text = '/cleardata help';

      await clearDataCommand(mockContext);

      expect(mockContext.reply).toHaveBeenCalledWith(
        'cleardata_help',
        { parse_mode: 'HTML' }
      );
    });

    it('should execute directly with "all" argument', async () => {
      mockContext.message.text = '/cleardata all';
      mockDeleteMany.mockResolvedValue({ count: 5 });

      await clearDataCommand(mockContext);

      expect(mockDeleteMany).toHaveBeenCalledWith({
        where: { userId: 123 }
      });
      expect(mockContext.reply).toHaveBeenCalled();
    });

    it('should show menu when no valid arguments provided', async () => {
      mockContext.message.text = '/cleardata';
      mockContext.reply.mockResolvedValue({ message_id: 999 });

      await clearDataCommand(mockContext);

      expect(mockContext.reply).toHaveBeenCalledWith(
        'cleardata_menu',
        expect.objectContaining({
          parse_mode: 'HTML',
          reply_markup: expect.any(Object)
        })
      );
    });
  });

  describe('executeClearData', () => {
    it('should successfully delete players and show summary', async () => {
      mockDeleteMany.mockResolvedValue({ count: 10 });

      const simpleMockT = jest.fn((key: string, params?: any) => {
        if (params) return `${key}:${JSON.stringify(params)}`;
        return key;
      });

      await executeClearData(mockContext, simpleMockT);

      expect(mockDeleteMany).toHaveBeenCalledWith({
        where: { userId: mockContext.user.id }
      });
      expect(mockContext.reply).toHaveBeenCalledWith(
        'cleardata_success_summary:{"summary":"10 players"}',
        { parse_mode: 'HTML' }
      );
    });

    it('should show no data message when nothing to delete', async () => {
      mockDeleteMany.mockResolvedValue({ count: 0 });

      const simpleMockT = jest.fn((key: string) => key);

      await executeClearData(mockContext, simpleMockT);

      expect(mockContext.reply).toHaveBeenCalledWith(
        'cleardata_no_data',
        { parse_mode: 'HTML' }
      );
    });

    it('should handle database errors gracefully', async () => {
      mockDeleteMany.mockRejectedValue(new Error('Database error'));

      const simpleMockT = jest.fn((key: string) => key);

      await executeClearData(mockContext, simpleMockT);

      expect(mockContext.reply).toHaveBeenCalledWith(
        'cleardata_error',
        { parse_mode: 'HTML' }
      );
    });
  });
});