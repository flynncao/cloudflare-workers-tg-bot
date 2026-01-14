import type { MyContext } from '#root/types/bot.js'
import type Command from '#root/types/commands.js'
import store from '#root/databases/store.js'
import Logger from '#root/utils/logger.js'
import unsplash from '#root/modules/unsplash.js'

export const commandList: Command[] = [
  {
    command: 'start',
    description: 'Welcome! Up and running.',
    handler: async (ctx: MyContext) => {
      await ctx.reply('Welcome, up and running')
    },
  },
  { command: 'help', description: 'Show help text', handler: async (ctx: MyContext) => {
    await ctx.reply('Help text')
  } },
  {
    command: 'hello',
    description: 'Greet the bot',
    handler: async (ctx: MyContext) => {
      const { menus } = store
      if (!menus) {
        Logger.logError('Menus not loaded')
        return
      }
      await ctx.reply(':', {
        reply_markup: menus['greet-new'],
      })
    },
  },
  {
    command: 'settings',
    description: 'Open settings',
    handler: async (ctx: MyContext) => {
      await ctx.reply('Settings')
    },
  },
  { command: 'about', description: 'Show information about the bot', handler: (ctx: MyContext) => {
    const me = ctx.me
    ctx.reply(`<b>Hi!</b> <i>Welcome</i> to <a href="https://t.me/${me.username}">${me.first_name}</a><span class="tg-spoiler"> id:${me.id}</span>`, { parse_mode: 'HTML' })
  } },
  { command: 'wallpaper', description: 'Show random wallpaper', async  handler(ctx: MyContext) {
    await unsplash.photos.getRandom({ query: 'tokyo,night', orientation: 'landscape' }).then((result: any) => {
      if (result.errors) {
        ctx.reply(`error occurred: ${result.errors[0]}`)
      }
      else {
        console.log('result :>> ', result.response)
        ctx.replyWithPhoto(result.response.urls.regular)
        // https://unsplash.com/documentation#get-a-random-photo
      }
    })
  } },
  {
    command: 'newpost',
    description: 'Create a new post',
    handler: async (ctx: MyContext) => {
      await ctx.conversation.enter('createPostConversation')
    },
  },
  {
    command: 'menu',
    description: 'Show your lucky numbers today',
    handler: async (ctx: MyContext) => {
      // TODO: Put menus in ctx instead of store
      const { menus } = store
      if (!menus) {
        Logger.logError('Menus not loaded')
        return
      }
      console.log('menu', menus)
      await ctx.reply('Your ranged menu be like:', {
        reply_markup: menus['ranged-menu'],
      })
    },

  },
  {
    command: 'add',
    description: 'Add one dollar to your saving',
    handler: async (ctx: MyContext) => {
      const session = ctx.session
      if (session) {
        session.count = session.count || 0
        session.count++
        await ctx.reply(`Current saving: ${session.count}`)
      }
    },
  },
  {
    command: 'id',
    description: 'Show your id',
    handler: async (ctx: MyContext) => {
      await ctx.reply(`Your id is:\`${ctx?.from?.id}\``, { parse_mode: 'MarkdownV2' })
    },
  },

]
