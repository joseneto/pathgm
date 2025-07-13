import { editPlayerCommand } from '../../commands/editPlayer';
import { createMockContext } from '../setup/mockContext';
import { resetAllMocks } from '../setup/testSetup';

// Mock command helpers
jest.mock('../../helpers/commandHelpers', () => ({
  getTranslation: jest.fn(() => [jest.fn((key: string) => key), 'en']),
  getEditPlayerHelpMessage: jest.fn(() => 'editplayer_help'),
  buildEditPlayerMenuMessage: jest.fn(() => 'editplayer_menu'),
}));

// Mock helper functions
jest.mock('../../helpers/playerAttributeParser', () => ({
  parseAttributeUpdates: jest.fn().mockReturnValue({ level: 10 }),
  validatePlayerUpdates: jest.fn().mockReturnValue({
    isValid: true,
    validatedUpdates: { level: 10 },
  }),
}));

jest.mock('../../utils/htmlOutputFormat', () => ({
  formatPlayerHtml: jest.fn().mockReturnValue('<b>Test Player</b> (Fighter 10)'),
}));

jest.mock('../../helpers/actionButtons', () => ({
  actionButtons: jest.fn().mockReturnValue({ reply_markup: { inline_keyboard: [] } }),
}));

// Mock withPrisma
const mockFindFirst = jest.fn();
const mockUpdate = jest.fn();
jest.mock('../../lib/withPrisma', () => ({
  withPrisma: jest.fn((callback: any) => {
    return callback({
      player: {
        findFirst: mockFindFirst,
        update: mockUpdate,
      }
    });
  }),
}));

describe('editPlayer command', () => {
  let mockContext: any;
  const mockPlayer = {
    id: 'player123',
    name: 'Test Player',
    className: 'Fighter',
    level: 5,
    skills: {},
    userId: 123,
  };

  beforeEach(() => {
    resetAllMocks();
    mockFindFirst.mockClear();
    mockUpdate.mockClear();
    mockContext = createMockContext({
      user: { id: 123 },
      message: { text: '/editplayer' },
    });
  });

  describe('editPlayerCommand', () => {
    it('should show help when help argument is provided', async () => {
      mockContext.message.text = '/editplayer help';

      await editPlayerCommand(mockContext);

      expect(mockContext.reply).toHaveBeenCalledWith(
        'editplayer_help',
        { parse_mode: 'HTML' }
      );
    });

    it('should execute directly with valid arguments (by ID)', async () => {
      mockContext.message.text = '/editplayer 1 level=10';
      mockFindFirst.mockResolvedValue(mockPlayer);
      mockUpdate.mockResolvedValue({ ...mockPlayer, level: 10 });

      await editPlayerCommand(mockContext);

      expect(mockFindFirst).toHaveBeenCalledWith({
        where: { id: '1', userId: 123 }
      });
      expect(mockUpdate).toHaveBeenCalled();
    });

    it('should show menu when no valid arguments provided', async () => {
      mockContext.message.text = '/editplayer';
      mockContext.reply.mockResolvedValue({ message_id: 999 });

      await editPlayerCommand(mockContext);

      expect(mockContext.reply).toHaveBeenCalledWith(
        'editplayer_menu',
        expect.objectContaining({
          parse_mode: 'HTML',
          reply_markup: expect.any(Object)
        })
      );
    });
  });
});