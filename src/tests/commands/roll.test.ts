import { rollCommand } from '../../commands/roll';
import { rollAllCommand } from '../../commands/rollAll';
import { createMockContext } from '../setup/mockContext';
import { resetAllMocks } from '../setup/testSetup';

// Mock command helpers
jest.mock('../../helpers/commandHelpers', () => ({
  getTranslation: jest.fn(() => [jest.fn((key: string) => key), 'en']),
  getRollHelpMessage: jest.fn(() => 'roll_help'),
  buildRollMenuMessage: jest.fn(() => 'roll_menu'),
  getRollAllHelpMessage: jest.fn(() => 'rollall_help'),
  buildRollAllMenuMessage: jest.fn(() => 'rollall_menu'),
}));

// Mock rollResult helper
jest.mock('../../helpers/rollResult', () => ({
  rollResult: jest.fn().mockImplementation((player, attribute, _modifier, results) => {
    results.push(`${player.name} rolled ${attribute}: 15`);
  }),
}));

// Mock withPrisma
const mockFindFirst = jest.fn();
const mockFindMany = jest.fn();
jest.mock('../../lib/withPrisma', () => ({
  withPrisma: jest.fn((callback: any) => {
    return callback({
      player: {
        findFirst: mockFindFirst,
        findMany: mockFindMany,
      }
    });
  }),
}));

describe('roll commands', () => {
  let mockContext: any;

  beforeEach(() => {
    resetAllMocks();
    mockFindFirst.mockClear();
    mockFindMany.mockClear();
    mockContext = createMockContext({
      user: { id: 123 },
      message: { text: '/roll' },
      replyWithMarkdownV2: jest.fn(),
    });
  });

  describe('rollCommand', () => {
    it('should show help when help argument is provided', async () => {
      mockContext.message.text = '/roll help';

      await rollCommand(mockContext);

      expect(mockContext.reply).toHaveBeenCalledWith(
        'roll_help',
        { parse_mode: 'HTML' }
      );
    });

    it('should show menu when no arguments provided', async () => {
      mockContext.message.text = '/roll';

      await rollCommand(mockContext);

      expect(mockContext.reply).toHaveBeenCalledWith(
        'roll_menu',
        { parse_mode: 'HTML' }
      );
    });

    it('should execute roll for single player with attribute', async () => {
      mockContext.message.text = '/roll "Test Player" perception';
      mockFindFirst.mockResolvedValue({
        id: 'player1',
        name: 'Test Player',
        userId: 123,
      });

      await rollCommand(mockContext);

      expect(mockFindFirst).toHaveBeenCalled();
      expect(mockContext.replyWithMarkdownV2).toHaveBeenCalledWith('Test Player rolled perception: 15');
    });
  });

  describe('rollAllCommand', () => {
    it('should show help when help argument is provided', async () => {
      mockContext.message.text = '/rollall help';

      await rollAllCommand(mockContext);

      expect(mockContext.reply).toHaveBeenCalledWith(
        'rollall_help',
        { parse_mode: 'HTML' }
      );
    });

    it('should show menu when no arguments provided', async () => {
      mockContext.message.text = '/rollall';

      await rollAllCommand(mockContext);

      expect(mockContext.reply).toHaveBeenCalledWith(
        'rollall_menu',
        { parse_mode: 'HTML' }
      );
    });

    it('should execute roll for all players with attribute', async () => {
      mockContext.message.text = '/rollall perception';
      mockFindMany.mockResolvedValue([
        { id: 'player1', name: 'Player1', userId: 123 },
        { id: 'player2', name: 'Player2', userId: 123 },
      ]);

      await rollAllCommand(mockContext);

      expect(mockFindMany).toHaveBeenCalledWith({
        where: { userId: 123 }
      });
    });
  });
});