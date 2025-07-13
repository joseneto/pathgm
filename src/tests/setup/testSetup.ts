import { jest } from '@jest/globals';

// Mock Prisma
const mockPrismaClient = {
  player: {
    findMany: jest.fn() as jest.MockedFunction<any>,
    findFirst: jest.fn() as jest.MockedFunction<any>,
    findUnique: jest.fn() as jest.MockedFunction<any>,
    create: jest.fn() as jest.MockedFunction<any>,
    update: jest.fn() as jest.MockedFunction<any>,
    delete: jest.fn() as jest.MockedFunction<any>,
    deleteMany: jest.fn() as jest.MockedFunction<any>,
    count: jest.fn() as jest.MockedFunction<any>,
    upsert: jest.fn() as jest.MockedFunction<any>,
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
};

jest.mock('../../lib/withPrisma', () => ({
  withPrisma: jest.fn((callback: any) => callback(mockPrismaClient)),
}));

// Mock i18n
const mockT = jest.fn().mockImplementation((key: any, params?: any) => {
  if (params) {
    return `${key}:${JSON.stringify(params)}`;
  }
  return key;
});

// Note: Individual tests should import and mock i18n/commandHelpers as needed
// Example for mocking getTranslation:
// jest.mock('../../helpers/commandHelpers', () => ({
//   getTranslation: jest.fn(() => [jest.fn((key: string) => key), 'en']),
//   // other helper functions...
// }));

// Example for mocking withPrisma:
// const mockDeleteMany = jest.fn();
// jest.mock('../../lib/withPrisma', () => ({
//   withPrisma: jest.fn((callback: any) => {
//     return callback({
//       player: {
//         deleteMany: mockDeleteMany,
//         // other methods...
//       }
//     });
//   }),
// }));

// Mock SessionManager
jest.mock('../../utils/SessionManager', () => ({
  SessionManager: {
    getSession: jest.fn(() => ({})),
    setSession: jest.fn(),
    clearSession: jest.fn(),
    updateSession: jest.fn(),
  },
}));

// Mock external modules
jest.mock('node-fetch', () => jest.fn());

export { mockPrismaClient, mockT };

export const resetAllMocks = () => {
  jest.clearAllMocks();
};