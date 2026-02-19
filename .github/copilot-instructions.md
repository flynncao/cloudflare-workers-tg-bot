# Project Guidelines

## Code Style

- Uses [@antfu/eslint-config](../eslint.config.js) with console logging allowed
- TypeScript with decorators enabled (`experimentalDecorators`, `emitDecoratorMetadata`)
- ESM modules only (`type: "module"` in package.json)
- Path aliases: `#root/*` maps to `./src/*`
- See [src/bot/command-handler.ts](../src/bot/command-handler.ts) for typical async/await patterns

## Architecture

**Dual Runtime**: Supports both local dev (Node.js with polling) and Cloudflare Workers (webhook mode)

**Initialization Order** (critical - see [src/index.ts](../src/index.ts#L75-L81)):
```
middlewares → conversations → menus → commands → messages
```

**Global State**: [src/databases/store.ts](../src/databases/store.ts) provides shared access to `bot`, `env`, `menus`, `timer`. Always check `store.env` and `store.bot` are initialized before use.

**Command Registration**: Define commands in [src/constants/index.ts](../src/constants/index.ts) as `Command[]` array. Each command auto-registers via [command-handler.ts](../src/bot/command-handler.ts).

**Type System**: 
- Custom context extends `Context & SessionFlavor<SessionData> & ConversationFlavor` - see [src/types/bot.ts](../src/types/bot.ts)
- Environment vars typed in [src/types/env.ts](../src/types/env.ts)

## Build and Test

```bash
# Local development (Node.js with long polling)
npm run dev:local

# Cloudflare Workers development
npm run dev

# Build for production
npm run build

# Deploy to Cloudflare
npm run deploy

# Run tests
npm test
```

**Environment Setup**: Copy `.env.example` to `.env` and set `BOT_TOKEN`, `USER_CHAT_ID`, optional `UNSPLASH_ACCESS_KEY`, `PROXY_ADDRESS`

## Project Conventions

- **Logger**: Use `Logger.logSuccess()`, `Logger.logError()`, `Logger.logProgress()` from [src/utils/logger.ts](../src/utils/logger.ts) instead of raw console
- **Middleware Registration**: Always use array iteration pattern from [src/middlewares/index.ts](../src/middlewares/index.ts)
- **Environment Loading**: Workers use `initEnvFromWorker(env)`, local dev uses `initLocalEnv()` - never mix them
- **Typed Contexts**: Always type handlers as `(ctx: MyContext)` not plain `Context`

## Integration Points

- **grammY**: Core bot framework with plugins for auto-retry, conversations, menus, MongoDB storage
- **MongoDB**: Optional via Mongoose + Typegoose. Connection in [src/utils/mongodb.ts](../src/utils/mongodb.ts)
- **Unsplash API**: Wallpaper module in [src/modules/unsplash.ts](../src/modules/unsplash.ts)
- **Cloudflare Workers**: Webhook handler + cron triggers (8am, 12pm, 11pm daily)

## Security

- Never commit `.env` - use Cloudflare secrets for `BOT_TOKEN` in production
- `USER_CHAT_ID` restricts who can use the bot (optional enforcement)
- Proxy support via `PROXY_ADDRESS` for Telegram API access in restricted regions
