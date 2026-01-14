import { Bot, GrammyError, HttpError } from 'grammy'
import { autoRetry } from '@grammyjs/auto-retry'
import Logger from './utils/logger.js'
import registerMessageHandler from './bot/message-handler.js'
import initLocalEnv from './utils/env.js'
import registerCommandHandler from './bot/command-handler.js'
import registerMiddlewares from './middlewares/index.js'
import { createAllMenus } from './middlewares/menu.js'
import { createAllConversations } from './middlewares/conversation.js'
import { initCrons } from './crons/index.js'
import { connectMongodb } from './utils/mongodb.js'
import type { MyContext } from '#root/types/bot.js'
import store from '#root/databases/store.js'

// ============ Error Handling ============

function setupErrorHandler(bot: Bot<MyContext>): void {
  bot.catch((err) => {
    const ctx = err.ctx
    Logger.logError(`Error while handling update ${ctx.update.update_id}:`)

    const e = err.error
    if (e instanceof GrammyError)
      Logger.logError('Error in request:', e.description)
    else if (e instanceof HttpError)
      Logger.logError('Could not contact Telegram:', e)
    else
      Logger.logError('Unknown error:', e)
  })
}

// ============ Initialization Phases ============

async function initEnvironment(): Promise<boolean> {
  if (!initLocalEnv()) {
    Logger.logError('Failed to load environment')
    return false
  }
  Logger.logProgress('Local env loaded')
  return true
}

async function initDatabase(): Promise<void> {
  const { env } = store
  if (env?.mongodb_connect_url)
    await connectMongodb()
}

function createBot(): Bot<MyContext> {
  const { env } = store
  if (!env)
    throw new Error('Environment not initialized')

  const bot = new Bot<MyContext>(env.bot_token)
  bot.api.config.use(autoRetry())
  store.bot = bot

  return bot
}

async function setupBot(bot: Bot<MyContext>): Promise<void> {
  // Order matters: middlewares → conversations → menus → commands → messages
  registerMiddlewares()
  createAllConversations()
  await createAllMenus()
  await registerCommandHandler()
  registerMessageHandler()
  setupErrorHandler(bot)
}

function startServices(): void {
  initCrons()
}

// ============ Main Entry Point ============

async function bootstrap(): Promise<void> {
  try {
    // Phase 1: Environment
    if (!await initEnvironment())
      return

    // Phase 2: Database
    await initDatabase()

    // Phase 3: Bot creation
    const bot = createBot()

    // Phase 4: Bot setup (handlers, middlewares, menus)
    await setupBot(bot)

    // Phase 5: Background services
    startServices()

    // Phase 6: Start bot
    bot.start()
    Logger.logSuccess('Bot started')
  }
  catch (error) {
    Logger.logError(`Error while initializing bot: ${error}`)
    process.exit(1)
  }
}

bootstrap()
