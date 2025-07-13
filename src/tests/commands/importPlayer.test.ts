import { importPlayerCommand } from '../../commands/importPlayer';
import { createMockContext } from '../setup/mockContext';
import { resetAllMocks } from '../setup/testSetup';

// Mock command helpers
jest.mock('../../helpers/commandHelpers', () => ({
  getTranslation: jest.fn(() => [jest.fn((key: string) => key), 'en']),
  getImportPlayerHelpMessage: jest.fn(() => 'importplayer_help'),
  buildImportPlayerMenuMessage: jest.fn(() => 'importplayer_menu'),
}));

// Mock helper functions
jest.mock('../../helpers/parsePathbuilderCharacter', () => ({
  parsePathbuilderCharacter: jest.fn().mockReturnValue({
    name: 'Test Player',
    className: 'Fighter',
    level: 5,
    skills: { acrobatics: 10 },
  }),
}));

jest.mock('../../utils/htmlOutputFormat', () => ({
  formatPlayerHtml: jest.fn().mockReturnValue('<b>Test Player</b> (Fighter 5)'),
}));

jest.mock('../../helpers/actionButtons', () => ({
  actionButtons: jest.fn().mockReturnValue({ reply_markup: { inline_keyboard: [] } }),
}));

jest.mock('node-fetch', () => jest.fn().mockResolvedValue({
  ok: true,
  json: jest.fn().mockResolvedValue({ name: 'Test Player' }),
}));

// Mock withPrisma
const mockUpsert = jest.fn();
jest.mock('../../lib/withPrisma', () => ({
  withPrisma: jest.fn((callback: any) => {
    return callback({
      player: {
        upsert: mockUpsert,
      }
    });
  }),
}));

describe('importPlayer command', () => {
  let mockContext: any;

  beforeEach(() => {
    resetAllMocks();
    mockUpsert.mockClear();
    mockContext = createMockContext({
      user: { id: 123 },
      message: { text: '/importplayer' },
    });
  });

  it('should show help when help argument is provided', async () => {
    mockContext.message.text = '/importplayer help';

    await importPlayerCommand(mockContext);

    expect(mockContext.reply).toHaveBeenCalledWith(
      'importplayer_help',
      { parse_mode: 'HTML' }
    );
  });

  it('should execute directly with Pathbuilder URL', async () => {
    mockContext.message.text = '/importplayer https://pathbuilder2e.com/json.php?id=123456';
    mockUpsert.mockResolvedValue({
      id: 'player123',
      name: 'Test Player',
      userId: 123,
    });

    await importPlayerCommand(mockContext);

    expect(mockUpsert).toHaveBeenCalled();
  });

  it('should show menu when no arguments provided', async () => {
    mockContext.message.text = '/importplayer';
    mockContext.reply.mockResolvedValue({ message_id: 999 });

    await importPlayerCommand(mockContext);

    expect(mockContext.reply).toHaveBeenCalledWith(
      'importplayer_menu',
      expect.objectContaining({
        parse_mode: 'HTML',
        reply_markup: expect.any(Object)
      })
    );
  });
});