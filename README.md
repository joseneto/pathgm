# 🎲 PathGM Bot

> **Your Ultimate Pathfinder 2e Telegram Companion**

PathGM Bot transforms your Telegram into a simple Pathfinder 2e game management hub. Seamlessly import characters from Pathbuilder, manage your party, and roll dice with style - all within your favorite messaging platform.

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Telegram](https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://telegram.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)
[![Jest](https://img.shields.io/badge/Jest-323330?style=for-the-badge&logo=Jest&logoColor=white)](https://jestjs.io/)

</div>

## ✨ Features

### 🧙‍♂️ **Character Management**
- **Import from Pathbuilder** - Direct integration with Pathbuilder 2e
- **Create Characters** - Build characters directly in Telegram
- **Edit Attributes** - Update stats, skills, and modifiers on the fly
- **Sync Characters** - Keep your Pathbuilder characters up to date

### 🎲 **Dice Rolling System**
- **Individual Rolls** - Roll for specific characters
- **Party Rolls** - Roll for all characters simultaneously
- **Skill Checks** - Automated skill bonuses and modifiers
- **Save Throws** - Quick Fortitude, Reflex, and Will saves

### 🌍 **Multilingual Support**
- **English & Portuguese** - Fully localized interface
- **Dynamic Language** - Automatic detection and switching
- **Expandable** - Easy to add new languages

### 🔧 **Developer Experience**
- **TypeScript** - Full type safety and IntelliSense
- **Comprehensive Tests** - 23 unit tests with 100% mock coverage
- **Modern Architecture** - Clean, maintainable, and scalable code
- **Database Integration** - Prisma ORM with PostgreSQL support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Telegram Bot Token

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pathgm.git
   cd pathgm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Initialize the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start the bot**
   ```bash
   npm run dev
   ```

## 🎮 Usage

### Basic Commands

- `/start` - Initialize the bot and get started
- `/help` - Show available commands and features
- `/menu` - Access the main interactive menu

### Character Commands

- `/newplayer "Name" class level` - Create a new character
- `/importplayer <pathbuilder-url>` - Import from Pathbuilder
- `/editplayer "Name" attribute=value` - Edit character attributes
- `/listplayers` - View all your characters
- `/syncplayers` - Sync with Pathbuilder updates

### Dice Commands

- `/roll "Character" skill +modifier` - Roll for specific character
- `/rollall perception` - Roll perception for all characters
- `/d20` - Simple d20 roll

### Management Commands

- `/cleardata all` - Clear all character data
- `/about` - Bot information and credits

## 🏗️ Architecture

```
src/
├── commands/          # Bot command handlers
├── handlers/          # Message and callback handlers
├── helpers/           # Utility functions
├── lib/              # Core library functions
├── utils/            # General utilities
├── tests/            # Comprehensive test suite
├── locales/          # Internationalization files
└── prisma/           # Database schema and migrations
```

### Key Technologies

- **Telegraf** - Modern Telegram bot framework
- **Prisma** - Next-generation ORM
- **i18next** - Internationalization framework
- **Jest** - Testing framework with comprehensive coverage
- **TypeScript** - Type-safe JavaScript

## 🧪 Testing

PathGM Bot includes a comprehensive test suite with 23 unit tests covering all major functionality.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test src/tests/commands/roll.test.ts
```

### Test Coverage
- ✅ Command parsing and execution
- ✅ Database operations (mocked)
- ✅ Error handling
- ✅ User input validation
- ✅ Telegram API interactions (mocked)

## 🌐 Internationalization

The bot supports multiple languages with easy expansion:

```typescript
// Add new translations in locales/
{
  "welcome_message": "Welcome to PathGM Bot!",
  "character_created": "Character {{name}} created successfully!"
}
```

Currently supported:
- 🇺🇸 English
- 🇧🇷 Portuguese

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Write tests** for your changes
4. **Commit your changes** (`git commit -m 'Add amazing feature'`)
5. **Push to the branch** (`git push origin feature/amazing-feature`)
6. **Open a Pull Request**

### Development Guidelines

- Write TypeScript with strict typing
- Add tests for new functionality
- Follow the existing code style
- Update documentation as needed
- Ensure all tests pass

## 📝 License

This project is open source and available under a permissive license. You are free to use, modify, and distribute this software, even in commercial projects, provided that proper attribution is given to the original authors.

**Requirements:**
- Include attribution to the original PathGM Bot project
- Mention the source repository in your documentation
- Credit the original authors in derivative works

## 🙏 Credits

PathGM Bot is developed and maintained by passionate tabletop RPG enthusiasts who believe in making gaming more accessible and enjoyable for everyone.

**Special Thanks:**
- **Pathbuilder 2e** team for their amazing character builder
- **Paizo Publishing** for Pathfinder 2e
- **Telegram** for their robust bot platform
- The **open source community** for incredible tools and libraries

---

<div align="center">

**Made with ❤️ for the TTRPG community**

*Experience the magic of tabletop gaming, enhanced by technology*

**A [MythBind](https://mythbind.com) Project** - *Crafting legendary digital experiences for tabletop adventures*

</div>