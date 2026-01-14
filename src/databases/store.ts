import type { Timer as ITimer } from 'easytimer.js'
import type { Bot } from 'grammy'
import type { MyContext } from '#root/types/bot.js'
import type { MyEnv } from '#root/types/env.js'

interface SharedDB {
  timer: ITimer | null
  bot: Bot<MyContext> | null
  env: MyEnv | null
  menus: any
  dashboardFingerprint: string
}

const db: SharedDB = {
  timer: null,
  bot: null,
  env: null,
  menus: null,
  dashboardFingerprint: 'default',
}

export default db
