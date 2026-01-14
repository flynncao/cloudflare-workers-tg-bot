import type { Context, SessionFlavor } from 'grammy'
import type {
  Conversation,
  ConversationFlavor,
} from '@grammyjs/conversations'

export interface SessionData {
  message?: string
  count?: number
}

export type MyContext = Context & SessionFlavor<SessionData> & ConversationFlavor

export type MyConversation = Conversation<MyContext>
