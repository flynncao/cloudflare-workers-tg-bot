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
  { command: 'wallpaper', description: 'Show random wallpaper', async handler(ctx: MyContext) {
    console.log('[DEBUG /wallpaper] Command triggered')

    // Check if unsplash access key is set
    const { env } = store
    console.log('[DEBUG /wallpaper] Store env exists:', !!env)
    console.log('[DEBUG /wallpaper] UNSPLASH_ACCESS_KEY in env:', !!env?.UNSPLASH_ACCESS_KEY)
    console.log('[DEBUG /wallpaper] UNSPLASH_ACCESS_KEY value:', env?.UNSPLASH_ACCESS_KEY ? `${env.UNSPLASH_ACCESS_KEY.substring(0, 10)}...` : 'not set')

    try {
      console.log('[DEBUG /wallpaper] Calling unsplash.photos.getRandom...')
      const startTime = Date.now()

      const result = await unsplash.photos.getRandom({ query: 'tokyo night', orientation: 'landscape' })

      const endTime = Date.now()
      console.log('[DEBUG /wallpaper] Unsplash API call took:', endTime - startTime, 'ms')

      console.log('[DEBUG /wallpaper] Result has errors:', !!result.errors)
      if (result.errors) {
        console.log('[DEBUG /wallpaper] Errors:', result.errors)
        await ctx.reply(`error occurred: ${result.errors[0]}`)
        return
      }

      console.log('[DEBUG /wallpaper] Result has response:', !!result.response)
      const photo = Array.isArray(result.response) ? result.response[0] : result.response
      console.log('[DEBUG /wallpaper] Photo object:', JSON.stringify(photo, null, 2))
      console.log('[DEBUG /wallpaper] Photo URL:', photo?.urls?.regular)

      if (!photo?.urls?.regular) {
        console.log('[DEBUG /wallpaper] ERROR: No photo URL found')
        await ctx.reply('Error: No photo URL returned from Unsplash')
        return
      }

      console.log('[DEBUG /wallpaper] Sending photo to user...')
      await ctx.replyWithPhoto(photo.urls.regular)
      console.log('[DEBUG /wallpaper] Photo sent successfully')
    }
    catch (error) {
      console.log('[DEBUG /wallpaper] Exception caught:', error)
      await ctx.reply(`Exception: ${error}`)
    }
  } },
  {
    command: 'google',
    description: 'Search Wikipedia (debug command)',
    async handler(ctx: MyContext) {
      console.log('[DEBUG /google] Command triggered')

      // Get search query from command arguments
      const query = ctx.match?.toString().trim()
      console.log('[DEBUG /google] Query:', query)

      if (!query) {
        await ctx.reply('Usage: /google <search term>\nExample: /google Tokyo')
        return
      }

      try {
        console.log('[DEBUG /google] Fetching from Wikipedia...')
        const startTime = Date.now()

        // Search Wikipedia API
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&list=search&srsearch=${encodeURIComponent(query)}&limit=1`
        console.log('[DEBUG /google] URL:', searchUrl)

        const response = await fetch(searchUrl)
        console.log('[DEBUG /google] Response status:', response.status, response.statusText)

        if (!response.ok) {
          console.log('[DEBUG /google] ERROR: Response not ok')
          await ctx.reply(`Error: Wikipedia API returned ${response.status}`)
          return
        }

        const data = await response.json() as { query?: { search?: Array<{ title: string; snippet: string }> } }
        console.log('[DEBUG /google] Response data:', JSON.stringify(data, null, 2))

        const searchResults = data.query?.search
        console.log('[DEBUG /google] Search results:', searchResults)

        if (!searchResults || searchResults.length === 0) {
          await ctx.reply(`No results found for "${query}"`)
          return
        }

        const result = searchResults[0]
        const title = result.title
        const snippet = result.snippet.replace(/<[^>]*>/g, '') // Remove HTML tags
        const pageUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`

        const message = `<b>${title}</b>\n\n${snippet}\n\n<a href="${pageUrl}">Read more on Wikipedia</a>`

        const endTime = Date.now()
        console.log('[DEBUG /google] Request took:', endTime - startTime, 'ms')

        await ctx.reply(message, { parse_mode: 'HTML' })
        console.log('[DEBUG /google] Reply sent successfully')
      }
      catch (error) {
        console.log('[DEBUG /google] Exception caught:', error)
        await ctx.reply(`Exception: ${error}`)
      }
    },
  },
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
