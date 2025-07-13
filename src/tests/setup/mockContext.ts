import { Context } from 'telegraf';

export interface MockTelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface MockTelegramChat {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

export interface MockMessage {
  message_id: number;
  from?: MockTelegramUser;
  chat: MockTelegramChat;
  date: number;
  text?: string;
}

export interface MockCallbackQuery {
  id: string;
  from: MockTelegramUser;
  message?: MockMessage;
  data?: string;
}

export const createMockUser = (overrides: Partial<MockTelegramUser> = {}): MockTelegramUser => ({
  id: 123456789,
  first_name: 'Test User',
  last_name: 'Last',
  username: 'testuser',
  language_code: 'en',
  ...overrides,
});

export const createMockChat = (overrides: Partial<MockTelegramChat> = {}): MockTelegramChat => ({
  id: 123456789,
  type: 'private',
  ...overrides,
});

export const createMockMessage = (overrides: Partial<MockMessage> = {}): MockMessage => ({
  message_id: 1,
  from: createMockUser(),
  chat: createMockChat(),
  date: Math.floor(Date.now() / 1000),
  text: 'test message',
  ...overrides,
});

export const createMockCallbackQuery = (overrides: Partial<MockCallbackQuery> = {}): MockCallbackQuery => ({
  id: 'callback_query_id',
  from: createMockUser(),
  message: createMockMessage(),
  data: 'test_data',
  ...overrides,
});

export const createMockContext = (overrides: any = {}): jest.Mocked<Context> => {
  const mockContext = {
    // User and chat info
    from: createMockUser(),
    chat: createMockChat(),
    message: createMockMessage(),
    callbackQuery: undefined,

    // Bot methods
    reply: jest.fn().mockResolvedValue({ message_id: 1 }),
    replyWithHTML: jest.fn().mockResolvedValue({ message_id: 1 }),
    replyWithMarkdown: jest.fn().mockResolvedValue({ message_id: 1 }),
    editMessageText: jest.fn().mockResolvedValue(true),
    editMessageReplyMarkup: jest.fn().mockResolvedValue(true),
    deleteMessage: jest.fn().mockResolvedValue(true),
    answerCbQuery: jest.fn().mockResolvedValue(true),

    // Telegram methods
    telegram: {
      sendMessage: jest.fn().mockResolvedValue({ message_id: 1 }),
      editMessageText: jest.fn().mockResolvedValue(true),
      editMessageReplyMarkup: jest.fn().mockResolvedValue(true),
      deleteMessage: jest.fn().mockResolvedValue(true),
      answerCallbackQuery: jest.fn().mockResolvedValue(true),
    },

    // Session and state
    session: {},
    state: {},

    // Update info
    update: {
      update_id: 1,
    },
    updateType: 'message' as const,

    // Bot info
    botInfo: {
      id: 987654321,
      is_bot: true,
      first_name: 'Test Bot',
      username: 'testbot',
      can_join_groups: true,
      can_read_all_group_messages: false,
      supports_inline_queries: false,
    },

    ...overrides,
  } as jest.Mocked<Context>;

  return mockContext;
};

export const createMockContextWithCallback = (data: string = 'test_data'): jest.Mocked<Context> => {
  const callbackQuery = createMockCallbackQuery({ data });
  return createMockContext({
    callbackQuery,
    updateType: 'callback_query',
    update: {
      update_id: 1,
      callback_query: callbackQuery,
    },
  });
};