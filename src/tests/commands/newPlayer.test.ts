import { newPlayerCommand } from '../../commands/newPlayer';
import { createMockContext } from '../setup/mockContext';
import { resetAllMocks } from '../setup/testSetup';

// Mock command helpers
jest.mock('../../helpers/commandHelpers', () => ({
  getTranslation: jest.fn(() => [jest.fn((key: string) => key), 'en']),
  getNewPlayerHelpMessage: jest.fn(() => 'newplayer_help'),
  buildNewPlayerMenuMessage: jest.fn(() => 'newplayer_menu'),
}));

// Mock helper functions
jest.mock('../../helpers/playerAttributeParser', () => ({
  parseAttributeUpdates: jest.fn().mockReturnValue({ perception: 10 }),
  validatePlayerUpdates: jest.fn().mockReturnValue({
    isValid: true,
    validatedUpdates: { perception: 10 },
  }),
  createDefaultSkills: jest.fn().mockReturnValue({ acrobatics: 0, athletics: 0 }),
}));

jest.mock('../../utils/htmlOutputFormat', () => ({
  formatPlayerHtml: jest.fn().mockReturnValue('<b>Test Player</b> (Fighter 5)'),
}));

jest.mock('../../helpers/actionButtons', () => ({
  actionButtons: jest.fn().mockReturnValue({ reply_markup: { inline_keyboard: [] } }),
}));

// Mock withPrisma
const mockCreate = jest.fn();
jest.mock('../../lib/withPrisma', () => ({
  withPrisma: jest.fn((callback: any) => {
    return callback({
      player: {
        create: mockCreate,
      }
    });
  }),
}));

describe('newPlayer command', () => {
  let mockContext: any;

  beforeEach(() => {
    resetAllMocks();
    mockCreate.mockClear();
    mockContext = createMockContext({
      user: { id: 123 },
      message: { text: '/newplayer' },
    });
  });

  it('should show help when help argument is provided', async () => {
    mockContext.message.text = '/newplayer help';

    await newPlayerCommand(mockContext);

    expect(mockContext.reply).toHaveBeenCalledWith(
      'newplayer_help',
      { parse_mode: 'HTML' }
    );
  });

  it('should execute directly with valid basic arguments', async () => {
    mockContext.message.text = '/newplayer TestPlayer fighter 5';
    mockCreate.mockResolvedValue({
      id: 'player123',
      name: 'TestPlayer',
      className: 'Fighter',
      level: 5,
      userId: 123,
    });

    await newPlayerCommand(mockContext);

    expect(mockCreate).toHaveBeenCalled();
  });

  it('should show menu when insufficient arguments provided', async () => {
    mockContext.message.text = '/newplayer TestPlayer fighter';
    mockContext.reply.mockResolvedValue({ message_id: 999 });

    await newPlayerCommand(mockContext);

    expect(mockContext.reply).toHaveBeenCalledWith(
      'newplayer_menu',
      expect.objectContaining({
        parse_mode: 'HTML',
        reply_markup: expect.any(Object)
      })
    );
  });
});