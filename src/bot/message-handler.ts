import db from '#root/databases/store.js'
import Logger from '#root/utils/logger.js'

export default function registerMessageHandler() {
  const { bot } = db
  if (!bot)
    return

  bot.hears(/hello.*$/i, async (ctx) => {
    await ctx.reply('Pizza loves you!', {
      reply_to_message_id: ctx.msg.message_id,
    })
  })

  bot.on('message:entities:url', async (ctx) => {
    ctx.reply('Got a URL!')
  })
  Logger.logSuccess('Message handler registered')
}
