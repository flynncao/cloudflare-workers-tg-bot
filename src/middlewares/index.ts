import { conversations } from '@grammyjs/conversations'
import { session } from 'grammy'
import timestamp from './timestamp.js'
import store from '#root/databases/store.js'
import Logger from '#root/utils/logger.js'
import type { SessionData } from '#root/types/bot.js'

function createInitialSessionData(): SessionData {
  return {
    message: '',
    count: 0,
  }
}
export default function registerMiddlewares() {
  const { bot } = store
  if (!bot)
    return
  const middlewares = [
    timestamp,
    session({ initial: createInitialSessionData }),
    conversations(),
  ]
  for (const item of middlewares) {
    if (item)
      bot.use(item)
  }
  Logger.logSuccess('Critial middwares registered')
}
