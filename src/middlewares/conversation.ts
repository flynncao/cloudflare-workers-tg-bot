import { createConversation } from '@grammyjs/conversations'
import type { MyContext, MyConversation } from '#root/types/bot.js'
import store from '#root/databases/store.js'
import Logger from '#root/utils/logger.js'
import { createNewPost, editPost, findOrCreateUser } from '#root/models/Post.js'

async function greeting(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply('Hello, what do you want to do?')
  const titleCtx = await conversation.waitFor(':text')
  await ctx.reply(`You said: ${titleCtx.update.message?.text}`)
}

async function editPostConversation(conversation: MyConversation, ctx: MyContext) {
  const id = ctx.session.postID
  if (!id) {
    Logger.logError('editPostConversation: id is null')
    return
  }
  await ctx.reply('Enter the new post content')
  const contentCtx = await conversation.waitFor(':text')
  if (contentCtx.msg.text) {
    conversation.external(() => {
      editPost(id, contentCtx.msg.text).then(() => {
        ctx.reply('Post edited successfully')
      })
    })
  }
}

async function createPostConversation(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply('Enter the post id: ')
  const id = await conversation.form.number()
  await ctx.reply('Enter the post title: ')
  const title = await conversation.form.text()
  await ctx.reply('Enter the post content: ')
  const content = await conversation.form.text()
  const brief = { title, content }
  if (id) {
    conversation.external(async () => {
      const res = await createNewPost(id, title, content)
      ctx.reply(`New Post: ${res}`)
    })
  }
}

const conversations = [greeting, editPostConversation, createPostConversation]

export default conversations

export function createAllConversations() {
  const { bot } = store
  if (!bot)
    return
  for (const conversation of conversations)
    bot.use(createConversation(conversation))
  Logger.logSuccess('All conversations initialized')
}
