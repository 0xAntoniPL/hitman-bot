import {Context, Telegraf} from 'telegraf'
import {BotDatabase} from '../storage/database'
import {
  decryptSecret,
  encryptSecret,
  getAddressFromPrivateKey,
  maskAddress,
  normalizePrivateKey,
} from '../security'
import {
  confirmBuyMenu,
  confirmSellMenu,
  mainMenu,
  removeWalletMenu,
  sellPercentMenu,
  settingsMenu,
  walletMenu,
} from '../menus'
import {AmountMode, UserSettings} from '../types'
import {
  RobinhoodTradingService,
  blockscoutTxUrl,
} from '../../services/robinhood-trading'

interface HandlerDeps {
  db: BotDatabase;
  trading: RobinhoodTradingService;
  masterKey: string;
  adminIds: Set<number>;
}

const getTelegramId = (ctx: Context) => ctx.from?.id

const getMessageText = (ctx: Context) => {
  const message = ctx.message as any
  return typeof message?.text === 'string' ? message.text.trim() : ''
}

const ensureUser = (ctx: Context, db: BotDatabase) => {
  const telegramId = getTelegramId(ctx)
  if (!telegramId) throw new Error('Missing Telegram user')
  return db.upsertUser({
    telegramId,
    username: ctx.from?.username,
    firstName: ctx.from?.first_name,
  })
}

const answer = async (ctx: Context) => {
  if ('answerCbQuery' in ctx) await ctx.answerCbQuery().catch(() => {})
}

const requireWallet = (db: BotDatabase, telegramId: number) => {
  const wallet = db.getWallet(telegramId)
  if (!wallet) throw new Error('Import a wallet first.')
  return wallet
}

const decryptWalletKey = (db: BotDatabase, telegramId: number, masterKey: string) => {
  const wallet = requireWallet(db, telegramId)
  return decryptSecret({
    encryptedValue: wallet.encryptedPrivateKey,
    iv: wallet.iv,
    authTag: wallet.authTag,
  }, masterKey)
}

const homeText = () => [
  'Hitman Robinhood command center',
  '',
  'Private wallet vault. Robinhood Chain execution. Confirmation before every trade.',
  '',
  'Start in dry run mode, import a fresh wallet, then test quotes before sending live transactions.',
].join('\n')

const walletMenuText = () => [
  'Wallet vault',
  '',
  'Import one private key per Telegram user. The key is encrypted locally before it is stored.',
  '',
  'Use a fresh trading wallet, not your main wallet.',
].join('\n')

const settingsSummary = (settings: UserSettings) => [
  'Trade settings',
  '',
  `Amount mode: ${settings.amountMode}`,
  `Spend amount: ${settings.amount}`,
  `Slippage limit: ${settings.slippage}%`,
  `Buy loops: ${settings.iterations}`,
  `Gas price: ${settings.gasPriceGwei === '0' ? 'Auto' : `${settings.gasPriceGwei} gwei`}`,
  `Dry run: ${settings.dryRun ? 'ON' : 'OFF'}`,
  '',
  settings.dryRun ? 'Dry run is safe preview mode. No transaction is sent.' : 'Live mode is active. Confirmed trades can send mainnet transactions.',
].join('\n')

const txList = (txHashes: string[]) => txHashes.map(hash => `${hash}\n${blockscoutTxUrl(hash)}`).join('\n\n')

const validatePositiveAmount = (value: string) => {
  if (!/^\d+(\.\d+)?$/.test(value) || Number(value) <= 0) throw new Error('Enter a positive number.')
}

const validateWholeNumber = (value: string) => {
  if (!/^\d+$/.test(value) || Number.parseInt(value) < 1) throw new Error('Enter a whole number greater than 0.')
}

export const registerBotHandlers = (bot: Telegraf<Context>, deps: HandlerDeps) => {
  const {
    db,
    trading,
    masterKey,
    adminIds,
  } = deps

  bot.start(async ctx => {
    ensureUser(ctx, db)
    await ctx.reply(homeText(), mainMenu())
  })

  bot.command('menu', async ctx => {
    ensureUser(ctx, db)
    await ctx.reply(homeText(), mainMenu())
  })

  bot.command('help', async ctx => {
    ensureUser(ctx, db)
    await ctx.reply(helpText(), mainMenu())
  })

  bot.command('pause', async ctx => {
    const telegramId = getTelegramId(ctx)
    if (!telegramId || !adminIds.has(telegramId)) return ctx.reply('Admin only.')
    db.setBotState('paused', 'true')
    return ctx.reply('Bot paused. Users can still view menus, but trading actions are blocked.')
  })

  bot.command('resume', async ctx => {
    const telegramId = getTelegramId(ctx)
    if (!telegramId || !adminIds.has(telegramId)) return ctx.reply('Admin only.')
    db.setBotState('paused', 'false')
    return ctx.reply('Bot resumed.')
  })

  bot.action('main:menu', async ctx => {
    ensureUser(ctx, db)
    await answer(ctx)
    await ctx.reply(homeText(), mainMenu())
  })

  bot.action('main:wallet', async ctx => {
    ensureUser(ctx, db)
    await answer(ctx)
    await ctx.reply(walletMenuText(), walletMenu())
  })

  bot.action('wallet:import', async ctx => {
    const user = ensureUser(ctx, db)
    db.setPendingAction(user.telegramId, 'import_wallet')
    await answer(ctx)
    await ctx.reply('Send the private key for the Robinhood Chain wallet. I will delete that message after import when Telegram allows it.')
  })

  bot.action('wallet:show', async ctx => {
    const user = ensureUser(ctx, db)
    await answer(ctx)
    try {
      const wallet = requireWallet(db, user.telegramId)
      const status = await trading.getWalletStatus(wallet.address)
      await ctx.reply([
        'Wallet status',
        '',
        `Wallet: ${maskAddress(wallet.address)}`,
        `Native ETH: ${status.ethBalance}`,
        `Approx USDG value: ${status.usdValue}`,
      ].join('\n'), walletMenu())
    } catch (error: any) {
      await ctx.reply(error.message, walletMenu())
    }
  })

  bot.action('wallet:remove:confirm', async ctx => {
    ensureUser(ctx, db)
    await answer(ctx)
    await ctx.reply('Remove the encrypted private key for this Telegram user?', removeWalletMenu())
  })

  bot.action('wallet:remove', async ctx => {
    const user = ensureUser(ctx, db)
    db.deleteWallet(user.telegramId)
    await answer(ctx)
    await ctx.reply('Wallet removed.', walletMenu())
  })

  bot.action('main:settings', async ctx => {
    const user = ensureUser(ctx, db)
    await answer(ctx)
    await ctx.reply(settingsSummary(db.ensureSettings(user.telegramId)), settingsMenu(db.ensureSettings(user.telegramId)))
  })

  bot.action('settings:mode', async ctx => {
    const user = ensureUser(ctx, db)
    const settings = db.ensureSettings(user.telegramId)
    settings.amountMode = settings.amountMode === 'USD' ? 'ETH' : 'USD'
    db.saveSettings(user.telegramId, settings)
    await answer(ctx)
    await ctx.reply(settingsSummary(settings), settingsMenu(settings))
  })

  bot.action('settings:dryrun', async ctx => {
    const user = ensureUser(ctx, db)
    const settings = db.ensureSettings(user.telegramId)
    settings.dryRun = !settings.dryRun
    db.saveSettings(user.telegramId, settings)
    await answer(ctx)
    await ctx.reply(settingsSummary(settings), settingsMenu(settings))
  })

  for (const key of ['amount', 'slippage', 'iterations', 'gas'] as const) {
    bot.action(`settings:${key}`, async ctx => {
      const user = ensureUser(ctx, db)
      db.setPendingAction(user.telegramId, `set_${key}`)
      await answer(ctx)
      await ctx.reply(settingPrompt(key))
    })
  }

  bot.action('main:buy', async ctx => {
    const user = ensureUser(ctx, db)
    await answer(ctx)
    if (await guardTradingPaused(ctx, db, adminIds)) return
    try {
      requireWallet(db, user.telegramId)
      db.setPendingAction(user.telegramId, 'buy_token')
      await ctx.reply('Send the Robinhood Chain token contract address to snipe or buy.')
    } catch (error: any) {
      await ctx.reply(error.message, walletMenu())
    }
  })

  bot.action('main:sell', async ctx => {
    const user = ensureUser(ctx, db)
    await answer(ctx)
    if (await guardTradingPaused(ctx, db, adminIds)) return
    try {
      requireWallet(db, user.telegramId)
      db.setPendingAction(user.telegramId, 'sell_token')
      await ctx.reply('Send the Robinhood Chain token contract address to sell.')
    } catch (error: any) {
      await ctx.reply(error.message, walletMenu())
    }
  })

  bot.action(/^sellpct:(25|50|75|100):(0x[a-fA-F0-9]{40})$/, async ctx => {
    const user = ensureUser(ctx, db)
    await answer(ctx)
    const match = (ctx.match || []) as RegExpExecArray
    const percent = Number(match[1])
    const tokenAddress = match[2]
    try {
      const wallet = requireWallet(db, user.telegramId)
      const quote = await trading.quoteSell(wallet.address, tokenAddress, percent)
      db.setPendingAction(user.telegramId, 'confirm_sell', {tokenAddress, percent})
      await ctx.reply([
        `Sell preview: ${quote.token.symbol}`,
        '',
        `Percent: ${quote.sellPercent}%`,
        `Balance: ${quote.tokenBalance}`,
        `Sell amount: ${quote.sellAmount}`,
        `Expected ETH: ${quote.expectedEth}`,
        `Estimated gas: ${quote.gasEstimate}`,
        '',
        'Confirm before sending this transaction.',
      ].join('\n'), confirmSellMenu())
    } catch (error: any) {
      await ctx.reply(`Sell quote failed: ${error.message}`, mainMenu())
    }
  })

  bot.action('confirm:buy', async ctx => {
    const user = ensureUser(ctx, db)
    await answer(ctx)
    if (await guardTradingPaused(ctx, db, adminIds)) return
    const pending = db.getPendingAction(user.telegramId)
    if (pending?.action !== 'confirm_buy') return ctx.reply('No pending buy confirmation.')
    const tokenAddress = String(pending.payload.tokenAddress)
    const settings = db.ensureSettings(user.telegramId)
    try {
      const privateKey = decryptWalletKey(db, user.telegramId, masterKey)
      const result = await trading.buyToken(privateKey, tokenAddress, settings)
      db.addTradeHistory({
        telegramId: user.telegramId,
        action: 'BUY',
        tokenAddress,
        tokenSymbol: result.quote.token.symbol,
        amountMode: settings.amountMode,
        amount: settings.amount,
        txHash: result.txHashes[0],
        status: result.dryRun ? 'DRY_RUN' : 'SUBMITTED',
      })
      db.clearPendingAction(user.telegramId)
      await ctx.reply(result.dryRun ? 'Dry run complete. No transaction was sent.' : `Buy submitted:\n${txList(result.txHashes)}`, mainMenu())
    } catch (error: any) {
      db.addTradeHistory({
        telegramId: user.telegramId,
        action: 'BUY',
        tokenAddress,
        tokenSymbol: '',
        amountMode: settings.amountMode,
        amount: settings.amount,
        status: 'FAILED',
        error: error.message,
      })
      await ctx.reply(`Buy failed: ${error.message}`, mainMenu())
    }
  })

  bot.action('confirm:sell', async ctx => {
    const user = ensureUser(ctx, db)
    await answer(ctx)
    if (await guardTradingPaused(ctx, db, adminIds)) return
    const pending = db.getPendingAction(user.telegramId)
    if (pending?.action !== 'confirm_sell') return ctx.reply('No pending sell confirmation.')
    const tokenAddress = String(pending.payload.tokenAddress)
    const percent = Number(pending.payload.percent)
    const settings = db.ensureSettings(user.telegramId)
    try {
      const privateKey = decryptWalletKey(db, user.telegramId, masterKey)
      const result = await trading.sellToken(privateKey, tokenAddress, percent, settings)
      db.addTradeHistory({
        telegramId: user.telegramId,
        action: 'SELL',
        tokenAddress,
        tokenSymbol: result.quote.token.symbol,
        amountMode: settings.amountMode,
        amount: `${percent}%`,
        txHash: result.txHashes[result.txHashes.length - 1],
        status: result.dryRun ? 'DRY_RUN' : 'SUBMITTED',
      })
      db.clearPendingAction(user.telegramId)
      await ctx.reply(result.dryRun ? 'Dry run complete. No transaction was sent.' : `Sell submitted:\n${txList(result.txHashes)}`, mainMenu())
    } catch (error: any) {
      await ctx.reply(`Sell failed: ${error.message}`, mainMenu())
    }
  })

  bot.action('confirm:cancel', async ctx => {
    const user = ensureUser(ctx, db)
    db.clearPendingAction(user.telegramId)
    await answer(ctx)
    await ctx.reply('Cancelled.', mainMenu())
  })

  bot.action('main:history', async ctx => {
    const user = ensureUser(ctx, db)
    await answer(ctx)
    const history = db.listTradeHistory(user.telegramId)
    if (history.length === 0) return ctx.reply('No trade history yet.', mainMenu())
    return ctx.reply(['Trade history', '', history.map(entry => [
      `${entry.action} ${entry.tokenSymbol || entry.tokenAddress}`,
      `Status: ${entry.status}`,
      entry.txHash ? blockscoutTxUrl(entry.txHash) : entry.error,
    ].filter(Boolean).join('\n')).join('\n\n')].join('\n'), mainMenu())
  })

  bot.action('main:help', async ctx => {
    ensureUser(ctx, db)
    await answer(ctx)
    await ctx.reply(helpText(), mainMenu())
  })

  bot.on('text', async ctx => {
    const user = ensureUser(ctx, db)
    const pending = db.getPendingAction(user.telegramId)
    const text = getMessageText(ctx)
    if (!pending) return ctx.reply('Use /menu to choose an action.', mainMenu())

    try {
      if (pending.action === 'import_wallet') {
        await importWallet(ctx, db, masterKey, user.telegramId, text)
        return
      }

      if (pending.action.startsWith('set_')) {
        await updateSetting(ctx, db, user.telegramId, pending.action, text)
        return
      }

      if (pending.action === 'buy_token') {
        await previewBuy(ctx, db, trading, user.telegramId, text)
        return
      }

      if (pending.action === 'sell_token') {
        db.clearPendingAction(user.telegramId)
        await ctx.reply('Choose how much to sell.', sellPercentMenu(text))
        return
      }
    } catch (error: any) {
      await ctx.reply(error.message, mainMenu())
    }
  })
}

const importWallet = async (ctx: Context, db: BotDatabase, masterKey: string, telegramId: number, privateKey: string) => {
  const normalized = normalizePrivateKey(privateKey)
  const address = getAddressFromPrivateKey(normalized)
  const encrypted = encryptSecret(normalized, masterKey)

  db.saveWallet({
    telegramId,
    address,
    encryptedPrivateKey: encrypted.encryptedValue,
    iv: encrypted.iv,
    authTag: encrypted.authTag,
  })
  db.clearPendingAction(telegramId)

  await ctx.deleteMessage().catch(() => {})
  await ctx.reply(`Wallet imported and encrypted: ${maskAddress(address)}`, walletMenu())
}

const updateSetting = async (ctx: Context, db: BotDatabase, telegramId: number, action: string, value: string) => {
  const settings = db.ensureSettings(telegramId)

  if (action === 'set_amount') {
    validatePositiveAmount(value)
    settings.amount = value
  } else if (action === 'set_slippage') {
    validateWholeNumber(value)
    if (Number.parseInt(value) > 100) throw new Error('Slippage cannot exceed 100.')
    settings.slippage = value
  } else if (action === 'set_iterations') {
    validateWholeNumber(value)
    if (Number.parseInt(value) > 5) throw new Error('Public bot safety limit: max 5 iterations.')
    settings.iterations = Number.parseInt(value)
  } else if (action === 'set_gas') {
    if (value !== '0') validatePositiveAmount(value)
    settings.gasPriceGwei = value
  }

  db.saveSettings(telegramId, settings)
  db.clearPendingAction(telegramId)
  await ctx.reply(settingsSummary(settings), settingsMenu(settings))
}

const previewBuy = async (ctx: Context, db: BotDatabase, trading: RobinhoodTradingService, telegramId: number, tokenAddress: string) => {
  const wallet = requireWallet(db, telegramId)
  const settings = db.ensureSettings(telegramId)
  const quote = await trading.quoteBuy(wallet.address, tokenAddress, settings)
  db.setPendingAction(telegramId, 'confirm_buy', {tokenAddress: quote.token.address})

  await ctx.reply([
    `Buy preview: ${quote.token.symbol}`,
    '',
    `Token: ${quote.token.address}`,
    `Spend: ${quote.spendAmount} ${quote.amountMode}`,
    `Expected: ${quote.expectedTokens} ${quote.token.symbol}`,
    `Minimum: ${quote.minimumTokens} ${quote.token.symbol}`,
    `Estimated gas: ${quote.gasEstimate}`,
    `Dry run: ${settings.dryRun ? 'ON' : 'OFF'}`,
    '',
    'Confirm before sending this transaction.',
  ].join('\n'), confirmBuyMenu())
}

const guardTradingPaused = async (ctx: Context, db: BotDatabase, adminIds: Set<number>) => {
  const telegramId = getTelegramId(ctx)
  if (!db.isPaused() || (telegramId && adminIds.has(telegramId))) return false
  await ctx.reply('Trading is temporarily paused by admin.')
  return true
}

const settingPrompt = (key: string) => {
  if (key === 'amount') return 'Send the amount to spend. Example: 10'
  if (key === 'slippage') return 'Send slippage as a whole percent from 0 to 100. Example: 25'
  if (key === 'iterations') return 'Send iteration count. Public bot safety max is 5.'
  return 'Send gas price in gwei, or 0 for auto.'
}

const helpText = () => [
  'Hitman Robinhood bot',
  '',
  '/start - open the bot',
  '/menu - main menu',
  '/help - safety and command help',
  '/pause - admin pause',
  '/resume - admin resume',
  '',
  'Every buy and sell requires confirmation. Dry run is ON by default. This bot uses live Robinhood Chain mainnet when dry run is OFF.',
].join('\n')
