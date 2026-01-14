import { commandList } from '#root/constants/index.js'
import Logger from '#root/utils/logger.js'
import store from '#root/databases/store.js'
import type Command from '#root/types/commands.js'
import type { MyContext } from '#root/types/bot.js'

export default async function registerCommandHandler() {
  const { env, bot, menus } = store
  if (env === null || bot === null || menus === null) {
    Logger.logError('Environment not loaded')
    return
  }

  commandList.forEach(async (element: Command) => {
    bot.command(element.command, element.handler)
  })

  const commands = commandList.map((Item) => {
    return { command: Item.command, description: Item.description }
  })
  bot.api.setMyCommands(commands).then((res) => {
    Logger.logSuccess('Command promption set successfully.')
  }).catch((err) => {
    Logger.logError('Command promption set failed.', err)
  })

  Logger.logSuccess('Commands registered')

  return Promise.resolve()
}
