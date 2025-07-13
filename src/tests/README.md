# Tests

This folder contains unit tests for the PathGM bot commands.

## Structure

- `setup/` - Test configuration utilities
  - `mockContext.ts` - Functions to create mocked Telegram contexts
  - `testSetup.ts` - Global mock configuration (Prisma, i18n, SessionManager)

- `commands/` - Tests for main commands
  - `clearData.test.ts` - Tests the data clearing command
  - `editPlayer.test.ts` - Tests the player editing command
  - `importPlayer.test.ts` - Tests the Pathbuilder import command
  - `newPlayer.test.ts` - Tests the player creation command
  - `syncPlayers.test.ts` - Tests the synchronization command
  - `roll.test.ts` - Tests the dice rolling commands

## How to run

```bash
# Run all tests
npm test

# Run a specific test
npm test src/tests/commands/clearData.test.ts

# Run in watch mode
npm run test:watch
```

## Test Structure

Each test file follows a similar structure:

1. **Mock setup** - Mocks external dependencies
2. **beforeEach** - Resets mocks and creates clean context
3. **Command tests** - Verifies behavior with different inputs
4. **Helper function tests** - Tests internal logic

The tests cover:
- ✅ Help display
- ✅ Direct execution with valid arguments
- ✅ Menu display when needed
- ✅ Error handling
- ✅ Database interaction (mocked)
- ✅ Input validation

## Mocks Used

- **Prisma Client** - Database mock via `withPrisma` wrapper
- **Telegraf Context** - Bot function mocks
- **i18n** - Translation function mocks  
- **SessionManager** - Session manager mock
- **Fetch** - HTTP call mocks (Pathbuilder)
- **Command Helpers** - Helper function mocks (getTranslation, etc.)

## Mock Strategy

Each test file uses specific mocks to isolate the functionality being tested:

### Translation Mocks
```typescript
jest.mock('../../helpers/commandHelpers', () => ({
  getTranslation: jest.fn(() => [jest.fn((key: string) => key), 'en']),
  getClearDataHelpMessage: jest.fn(() => 'cleardata_help'),
  buildClearDataMenuMessage: jest.fn(() => 'cleardata_menu'),
}));
```

### Database Mocks
```typescript
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
```

This approach ensures that:
- External dependencies are properly isolated
- Tests run fast without real database calls
- Different scenarios can be easily simulated
- Error conditions can be tested reliably