import 'dotenv/config'
import {Context, Telegraf} from 'telegraf'
import {BotDatabase} from './storage/database'
import {registerBotHandlers} from './handlers/index'
import {RobinhoodTradingService} from '../services/robinhood-trading'

interface StartBotOptions {
  token?: string;
  masterKey?: string;
  adminIds?: string;
  rpcUrl?: string;
}

const parseAdminIds = (value = '') => new Set(
  value
  .split(',')
  .map(id => Number.parseInt(id.trim()))
  .filter(id => Number.isFinite(id)),
)

const createRateLimiter = (windowMs = 1000) => {
  const lastSeen = new Map<number, number>()

  return async (ctx: Context, next: () => Promise<void>) => {
    const userId = ctx.from?.id
    if (!userId) return next()

    const now = Date.now()
    const last = lastSeen.get(userId) || 0
    if (now - last < windowMs) {
      await ctx.reply('Slow down for a moment.')
      return
    }

    lastSeen.set(userId, now)
    return next()
  }
}

export const startBot = async (options: StartBotOptions = {}) => {
  const token = options.token || process.env.TELEGRAM_BOT_TOKEN
  const masterKey = options.masterKey || process.env.RH_BOT_MASTER_KEY
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN is required')
  if (!masterKey) throw new Error('RH_BOT_MASTER_KEY is required')

  const db = new BotDatabase()
  const trading = new RobinhoodTradingService(options.rpcUrl || process.env.ROBINHOOD_RPC_URL)
  await trading.assertNetwork()

  const bot = new Telegraf<Context>(token)
  bot.use(createRateLimiter())
  registerBotHandlers(bot, {
    db,
    trading,
    masterKey,
    adminIds: parseAdminIds(options.adminIds || process.env.RH_ADMIN_IDS),
  })

  bot.catch((error, ctx) => {
    console.error('Bot error:', error)
    ctx.reply('Something went wrong. Use /menu and try again.').catch(() => {})
  })

  process.once('SIGINT', () => {
    bot.stop('SIGINT')
    db.close()
  })
  process.once('SIGTERM', () => {
    bot.stop('SIGTERM')
    db.close()
  })

  await bot.launch()
  return bot
}
