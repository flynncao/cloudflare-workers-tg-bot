import type { Bot } from 'grammy'
import Logger from '#root/utils/logger.js'
import type { MyContext } from '#root/types/bot.js'

export async function handleScheduled(
  controller: ScheduledController,
  bot: Bot<MyContext>,
  userChatId: string,
): Promise<void> {
  try {
    // Get the cron trigger that fired (e.g., "0 8 * * *")
    const cron = controller.cron

    Logger.logProgress(`Cron triggered: ${cron}`)

    // Match cron patterns to messages
    if (cron === '0 8 * * *')
      await bot.api.sendMessage(userChatId, '早上好')

    else if (cron === '0 12 * * *')
      await bot.api.sendMessage(userChatId, '中午好')

    else if (cron === '0 23 * * *')
      await bot.api.sendMessage(userChatId, '晚上好')

    Logger.logSuccess(`Cron job completed: ${cron}`)
  }
  catch (error) {
    Logger.logError(`Error in scheduled handler: ${error}`)
  }
}

// Keep initCrons for local development only
export function initCrons() {
  // Only runs in local Node.js environment, not in Workers
  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production')
    Logger.logProgress('Crons skipped in local dev (use wrangler for cron testing)')
}
