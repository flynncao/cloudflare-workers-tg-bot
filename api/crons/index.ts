import { CronJob } from 'cron'
import store from '#root/databases/store.js'
import Logger from '#root/utils/logger.js'

export function initCrons() {
  try {
    const botInstance = store.bot!
    const userChatId = store.env!.user_chat_id!
    const timeZone = 'Asia/Shanghai'

    const monringJob = new CronJob('0 0 8 * * *', () => {
      console.log('running a task every 8:00')
      botInstance.api.sendMessage(userChatId, '早上好')
    }, null, false, timeZone)

    const noonJob = new CronJob('0 0 12 * * *', () => {
      console.log('running a task every 12:00')
      botInstance.api.sendMessage(userChatId, '中午好')
    }, null, false, timeZone)

    const nightJob = new CronJob('0 0 23 * * *', () => {
      console.log('running a task every 21:00')
      botInstance.api.sendMessage(userChatId, '晚上好')
    }, null, false, timeZone)

    const jobs = [monringJob, noonJob, nightJob]
    jobs.forEach(job => job.start())
    Logger.logSuccess('Crons initialized')
  }
  catch (error) {
    Logger.logError(`Error while initializing crons', ${error}`)
  }
}
