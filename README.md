# tg-reminder-bot

A modular Telegram bot built with grammY, supporting both local development and Cloudflare Workers deployment.

## Features

* **Dual Runtime Support**: Runs locally (Node.js with long polling) or on Cloudflare Workers (webhook mode)
* **TypeScript-First**: Full type safety with decorators support
* **Modular Architecture**: Clear separation of commands, middlewares, and handlers
* **grammY Framework**: Auto-retry, conversations, menus, and session management
* **Optional MongoDB**: Mongoose + Typegoose integration for data persistence
* **ESLint**: [@antfu/eslint-config](https://github.com/antfu/eslint-config) for consistent code style
* **Scheduled Tasks**: Built-in cron support for Cloudflare Workers (8am, 12pm, 11pm daily)

## Tech Stack

- **Runtime**: Node.js 18+ / Cloudflare Workers
- **Framework**: [grammY](https://grammy.dev)
- **Language**: TypeScript with ESM modules
- **Database**: MongoDB (optional)
- **Build Tool**: tsup
- **Package Manager**: npm/pnpm

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd tg-reminder-bot
npm install
```

### 2. Environment Setup

Rename `.env.example` to `.env`, then configure:

```env
BOT_TOKEN=your_bot_token_here
USER_CHAT_ID=your_chat_id_here
UNSPLASH_ACCESS_KEY=your_unsplash_key_here  # Optional: for /wallpaper command
PROXY_ADDRESS=socks5://127.0.0.1:1080        # Optional: for restricted regions
```

#### Getting Your Bot Token

1. Open [Bot Father](https://telegram.me/BotFather) on Telegram
2. Send `/newbot` command and follow the prompts
3. Copy the HTTP API token as your `BOT_TOKEN`

![Bot Creation](https://raw.githubusercontent.com/flynncao/blog-images/main/img/20240101153019.png)

#### Getting Your Chat ID

**Method 1** (Fastest): 
- Add [Get My ID Bot](https://t.me/getmyid_bot) on Telegram
- Send `/start` command
- Copy the number as your `USER_CHAT_ID`

**Method 2** (Manual):
- Open [Telegram Web](https://web.telegram.org/)
- Click on "Saved Messages"
- The number after `web.telegram.org/a/#` is your chat ID
- Works for group/channel IDs too (usually negative numbers)

### 3. Run Locally

```bash
# Development mode with hot reload
npm run dev:local

# Production build
npm run build
npm run start:local
```

### 4. Deploy to Cloudflare Workers

```bash
# Set up Cloudflare secrets
wrangler secret put BOT_TOKEN
wrangler secret put USER_CHAT_ID
wrangler secret put UNSPLASH_ACCESS_KEY  # Optional

# Deploy
npm run deploy

# Development with Workers
npm run dev
```

## Available Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/start` | Welcome message | `/start` |
| `/help` | Show help text with all commands | `/help` |
| `/wallpaper` | Get random wallpaper from Unsplash | `/wallpaper tokyo night --landscape` |
| `/hello` | Interactive greeting menu | `/hello` |
| `/settings` | Open bot settings | `/settings` |
| `/about` | Show bot information | `/about` |

### Wallpaper Command Usage

```bash
# Random wallpaper
/wallpaper

# Search with keyword
/wallpaper mountain

# With orientation
/wallpaper "cyberpunk city" --portrait

# With quality
/wallpaper anime --landscape--full

# Orientation + Quality
/wallpaper --portrait--raw
```

**Orientations**: `landscape`, `portrait`, `squarish`  
**Qualities**: `raw`, `full`, `regular`, `small`, `thumb`

> **Note**: Requires `UNSPLASH_ACCESS_KEY` in `.env`. Get your key at [Unsplash Developers](https://unsplash.com/documentation)

## Architecture

```
src/
├── bot/              # Command and message handlers
├── constants/        # Command definitions
├── crons/            # Scheduled tasks
├── databases/        # Global state store
├── middlewares/      # Session, conversations, menus
├── models/           # MongoDB models (Typegoose)
├── modules/          # External API integrations (Unsplash, etc.)
├── types/            # TypeScript type definitions
└── utils/            # Logger, env loader, MongoDB connector
```

**Initialization Flow**: `middlewares → conversations → menus → commands → messages`

**Global Store**: Access shared state via `store.bot`, `store.env`, `store.menus`, `store.timer` from [src/databases/store.ts](src/databases/store.ts)

## Development

### Adding New Commands

1. Define command in [src/constants/index.ts](src/constants/index.ts):

```typescript
{
  command: 'mycommand',
  description: 'My command description',
  handler: async (ctx: MyContext) => {
    await ctx.reply('Hello!')
  },
  aliases: ['alias1', 'alias2']  // Optional
}
```

2. Commands auto-register via [src/bot/command-handler.ts](src/bot/command-handler.ts)

### Using the Logger

```typescript
import Logger from '#root/utils/logger.js'

Logger.logSuccess('Operation completed')
Logger.logError('Error occurred', error)
Logger.logProgress('Processing...')
```

### Path Aliases

Use `#root/*` instead of relative paths:

```typescript
import store from '#root/databases/store.js'
import type { MyContext } from '#root/types/bot.js'
```

## Scheduled Tasks

Cloudflare Workers automatically triggers cron jobs at:
- **8:00 AM** - Morning reminder
- **12:00 PM** - Noon reminder  
- **11:00 PM** - Night reminder

Configure in [wrangler.jsonc](wrangler.jsonc) and implement handlers in [src/crons/index.ts](src/crons/index.ts)

## MongoDB Integration

Optional MongoDB support via Mongoose + Typegoose:

```typescript
import { connectMongodb } from '#root/utils/mongodb.js'

// Connect (checks if already connected)
await connectMongodb()
```

Define models in `src/models/` using Typegoose decorators.

## Credits & Thanks

- [grammY](https://github.com/grammyjs/grammY) - Modern Telegram Bot Framework
- [Notion Potion](https://github.com/ShoroukAziz/notion-potion) - Project inspiration
- [@antfu/eslint-config](https://github.com/antfu/eslint-config) - ESLint configuration
- [Unsplash API](https://unsplash.com/developers) - High-quality wallpapers

## License

MIT © Flynn Cao
