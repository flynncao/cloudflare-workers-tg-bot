import { Bot, GrammyError, HttpError, session } from 'grammy'
import { autoRetry } from '@grammyjs/auto-retry'
import { commandList } from './constants/index.js'
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

function setErrorHandler(bot: Bot<MyContext>) {
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

async function init() {
  if (!initLocalEnv())
    return
  Logger.logProgress('Local env loaded, bot starting...')
  try {
    const { env } = store
    if (env === null)
      return
    await connectMongodb()
    const bot = new Bot<MyContext>(env.bot_token)
    store.bot = bot
    store.bot.api.config.use(autoRetry())
    // Register handlers and menus...
    registerMiddlewares()
    createAllConversations()
    await createAllMenus()
    await registerCommandHandler()
    registerMessageHandler()
    setErrorHandler(bot)
    initCrons()
    // Start bot
    bot.start()
    Logger.logSuccess('Bot started')
  }
  catch (error) {
    Logger.logError(`Error while initializing bot', ${error}`)
  }
}

init()
