import 'dotenv/config'
import {Context, Telegraf} from 'telegraf'
import http from 'node:http'
import {BotDatabase} from './storage/database'
import {registerBotHandlers} from './handlers/index'
import {RobinhoodTradingService} from '../services/robinhood-trading'

interface StartBotOptions {
  token?: string;
  masterKey?: string;
  adminIds?: string;
  rpcUrl?: string;
  dryStart?: boolean;
}

interface StartedHealthServer {
  close: () => void;
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

const configureBotProfile = async (bot: Telegraf<Context>) => {
  await bot.telegram.setMyCommands([
    {command: 'start', description: 'Open Hitman command center'},
    {command: 'menu', description: 'Show main trading menu'},
    {command: 'help', description: 'Show safety notes and commands'},
  ])

  const telegram = bot.telegram as any
  await telegram.callApi('setMyName', {name: 'HitmanBot'}).catch(() => undefined)
  await telegram.callApi('setMyShortDescription', {short_description: 'Hitman Robinhood Chain trading bot.'}).catch(() => undefined)
  await telegram.callApi('setMyDescription', {
    description: [
      'Private Robinhood Chain trading interface.',
      'Import an encrypted wallet, preview trades, and confirm buys or sells.',
      'Dry run is ON by default.',
    ].join('\n'),
  }).catch(() => undefined)
}

const startHealthServer = (): StartedHealthServer | undefined => {
  const rawPort = process.env.HITMAN_HEALTH_PORT || process.env.PORT
  if (!rawPort) return undefined

  const port = Number.parseInt(rawPort, 10)
  if (!Number.isFinite(port) || port <= 0) return undefined

  const server = http.createServer((request, response) => {
    if (request.url === '/health' || request.url === '/') {
      response.writeHead(200, {'content-type': 'application/json'})
      response.end(JSON.stringify({
        ok: true,
        service: 'hitman-bot',
        telegramLink: 'https://t.me/HitmanRobinhoodBot',
      }))
      return
    }

    response.writeHead(404, {'content-type': 'application/json'})
    response.end(JSON.stringify({ok: false}))
  })

  server.listen(port, () => {
    console.log(`Health server listening on port ${port}`)
  })

  return {
    close: () => server.close(),
  }
}

export const startBot = async (options: StartBotOptions = {}) => {
  const token = options.token || process.env.TELEGRAM_BOT_TOKEN
  const masterKey = options.masterKey || process.env.RH_BOT_MASTER_KEY || process.env.HITMAN_BOT_MASTER_KEY
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN is required')
  if (!masterKey || masterKey.length < 16) throw new Error('RH_BOT_MASTER_KEY or HITMAN_BOT_MASTER_KEY must be at least 16 characters')

  const db = new BotDatabase()
  const trading = new RobinhoodTradingService(options.rpcUrl || process.env.ROBINHOOD_RPC_URL)
  if (!options.dryStart) await trading.assertNetwork()

  const bot = new Telegraf<Context>(token)
  const healthServer = options.dryStart ? undefined : startHealthServer()
  bot.use(createRateLimiter())
  registerBotHandlers(bot, {
    db,
    trading,
    masterKey,
    adminIds: parseAdminIds(options.adminIds || process.env.RH_ADMIN_IDS || process.env.HITMAN_ADMIN_IDS),
  })

  bot.catch((error, ctx) => {
    console.error('Bot error:', error)
    ctx.reply('Something went wrong. Use /menu and try again.').catch(() => {})
  })

  process.once('SIGINT', () => {
    bot.stop('SIGINT')
    healthServer?.close()
    db.close()
  })
  process.once('SIGTERM', () => {
    bot.stop('SIGTERM')
    healthServer?.close()
    db.close()
  })

  if (options.dryStart) return {bot, db, healthServer}

  await configureBotProfile(bot)
  await bot.launch()
  return {bot, db, healthServer}
}
