import { Bot, GrammyError, HttpError, webhookCallback } from 'grammy'
import { autoRetry } from '@grammyjs/auto-retry'
import { SocksProxyAgent } from 'socks-proxy-agent'
import Logger from './utils/logger.js'
import registerMessageHandler from './bot/message-handler.js'
import initLocalEnv from './utils/env.js'
import registerCommandHandler from './bot/command-handler.js'
import registerMiddlewares from './middlewares/index.js'
import { createAllMenus } from './middlewares/menu.js'
import { createAllConversations } from './middlewares/conversation.js'
import { handleScheduled, initCrons } from './crons/index.js'
import type { MyEnv } from './types/env.js'
import type { MyContext } from '#root/types/bot.js'
import store from '#root/databases/store.js'

export { type MyEnv as Env }

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

// ============ Initialization ============

function initEnvFromWorker(env: MyEnv): void {
  store.env = env
  Logger.logProgress('Worker env loaded')
}

function createBot(): Bot<MyContext> {
  const { env } = store
  if (!env)
    throw new Error('Environment not initialized')
  const socksAgent = env.PROXY_ADDRESS ? new SocksProxyAgent(env.PROXY_ADDRESS!) : false
  console.log('socksAgent', socksAgent)

  let bot: Bot<MyContext> = null as any

  if (!env.BOT_INFO) {
    bot = new Bot<MyContext>(
      env.BOT_TOKEN,
      {
        client: {
          baseFetchConfig: {
            agent: socksAgent,
          },
        },
      },
    )
  }
  else { bot = new Bot<MyContext>(env.BOT_TOKEN, { botInfo: JSON.parse(env.BOT_INFO) }) }
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

// ============ Local Dev Entry Point ============

async function bootstrapLocal(): Promise<void> {
  try {
    console.log('Starting bot in local development mode...')
    if (!initLocalEnv()) {
      Logger.logError('Failed to load environment')
      return
    }
    Logger.logProgress('Local env loaded')

    const bot = createBot()
    await setupBot(bot)
    initCrons()

    bot.start()
    Logger.logSuccess('Bot started (polling)')
  }
  catch (error) {
    Logger.logError(`Error while initializing bot: ${error}`)
    process.exit(1)
  }
}

// ============ Cloudflare Worker Entry Point ============

let initialized = false

async function ensureInitialized(env: MyEnv): Promise<Bot<MyContext>> {
  if (!initialized) {
    initEnvFromWorker(env)
    const bot = createBot()
    await setupBot(bot)
    initialized = true
  }
  return store.bot!
}

export default {
  async fetch(
    request: Request,
    env: MyEnv,
    ctx: ExecutionContext,
  ): Promise<Response> {
    // Only handle POST requests from Telegram webhook
    if (request.method !== 'POST')
      return new Response('Bot is running!', { status: 200 })

    const bot = await ensureInitialized(env)
    return webhookCallback(bot, 'cloudflare-mod')(request)
  },

  async scheduled(
    controller: ScheduledController,
    env: MyEnv,
    ctx: ExecutionContext,
  ): Promise<void> {
    const bot = await ensureInitialized(env)
    const userChatId = env.USER_CHAT_ID

    if (!userChatId) {
      console.error('USER_CHAT_ID not configured')
      return
    }

    ctx.waitUntil(handleScheduled(controller, bot, userChatId))
  },
}

// Run locally if not in worker environment
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production')
  bootstrapLocal()
