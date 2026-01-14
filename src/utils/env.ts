import Logger from '#root/utils/logger.js'
import store from '#root/databases/store.js'
import 'dotenv/config'

export default function initLocalEnv(): boolean {
  try {
    store.env = {
      BOT_TOKEN: process.env.BOT_TOKEN!,
      USER_CHAT_ID: process.env.USER_CHAT_ID!,
      UNSPLASH_ACCESS_KEY: process.env.UNSPLASH_ACCESS_KEY!,
    }
    return true
  }
  catch (error) {
    Logger.logError(`FATAL: Error while initializing local environment, please check .env file under root directory.', ${error}`)
    return false
  }
}
