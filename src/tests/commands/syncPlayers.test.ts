import { syncPlayersCommand } from '../../commands/syncPlayers';
import { createMockContext } from '../setup/mockContext';
import { resetAllMocks } from '../setup/testSetup';

// Mock command helpers
jest.mock('../../helpers/commandHelpers', () => ({
  getTranslation: jest.fn(() => [jest.fn((key: string) => key), 'en']),
}));

// Mock helper functions
jest.mock('../../helpers/parsePathbuilderCharacter', () => ({
  parsePathbuilderCharacter: jest.fn().mockReturnValue({
    name: 'Updated Player',
    className: 'Fighter',
    level: 10,
    skills: { acrobatics: 15 },
  }),
}));

jest.mock('node-fetch', () => jest.fn().mockResolvedValue({
  ok: true,
  json: jest.fn().mockResolvedValue({ name: 'Updated Player' }),
}));

// Mock withPrisma
const mockFindMany = jest.fn();
const mockUpdate = jest.fn();
jest.mock('../../lib/withPrisma', () => ({
  withPrisma: jest.fn((callback: any) => {
    return callback({
      player: {
        findMany: mockFindMany,
        update: mockUpdate,
      }
    });
  }),
}));

describe('syncPlayers command', () => {
  let mockContext: any;

  beforeEach(() => {
    resetAllMocks();
    mockFindMany.mockClear();
    mockUpdate.mockClear();
    mockContext = createMockContext({
      user: { id: 123 },
      message: { text: '/syncplayers' },
    });
  });

  it('should execute directly when arguments provided', async () => {
    mockContext.message.text = '/syncplayers now';
    mockFindMany.mockResolvedValue([
      { id: 'player1', name: 'Player One', pathbuilderId: '123456', userId: 123 }
    ]);
    mockUpdate.mockResolvedValue({});

    await syncPlayersCommand(mockContext);

    expect(mockFindMany).toHaveBeenCalledWith({
      where: {
        userId: 123,
        pathbuilderId: { not: undefined },
      },
    });
  });

  it('should show menu when no arguments provided', async () => {
    mockContext.message.text = '/syncplayers';
    mockContext.reply.mockResolvedValue({ message_id: 999 });

    await syncPlayersCommand(mockContext);

    expect(mockContext.reply).toHaveBeenCalledWith(
      'sync_players_menu_message',
      expect.objectContaining({
        parse_mode: 'HTML',
        reply_markup: expect.any(Object)
      })
    );
  });
});