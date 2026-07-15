import {Markup} from 'telegraf'
import {UserSettings} from './types'

export const mainMenu = () => Markup.inlineKeyboard([
  [Markup.button.callback('Wallet Vault', 'main:wallet'), Markup.button.callback('Snipe / Buy', 'main:buy')],
  [Markup.button.callback('Sell Position', 'main:sell'), Markup.button.callback('Trade Settings', 'main:settings')],
  [Markup.button.callback('Trade History', 'main:history'), Markup.button.callback('Help / Safety', 'main:help')],
])

export const walletMenu = () => Markup.inlineKeyboard([
  [Markup.button.callback('Import Encrypted Key', 'wallet:import')],
  [Markup.button.callback('Wallet Status', 'wallet:show'), Markup.button.callback('Remove Wallet', 'wallet:remove:confirm')],
  [Markup.button.callback('Back to Command Center', 'main:menu')],
])

export const settingsMenu = (settings: UserSettings) => Markup.inlineKeyboard([
  [
    Markup.button.callback(`Mode ${settings.amountMode}`, 'settings:mode'),
    Markup.button.callback(`Amount ${settings.amount}`, 'settings:amount'),
  ],
  [
    Markup.button.callback(`Slippage ${settings.slippage}%`, 'settings:slippage'),
    Markup.button.callback(`Loops ${settings.iterations}`, 'settings:iterations'),
  ],
  [
    Markup.button.callback(`Gas ${settings.gasPriceGwei === '0' ? 'Auto' : `${settings.gasPriceGwei} gwei`}`, 'settings:gas'),
    Markup.button.callback(`Dry Run ${settings.dryRun ? 'ON' : 'OFF'}`, 'settings:dryrun'),
  ],
  [Markup.button.callback('Back to Command Center', 'main:menu')],
])

export const confirmBuyMenu = () => Markup.inlineKeyboard([
  [Markup.button.callback('Confirm Buy', 'confirm:buy')],
  [Markup.button.callback('Cancel', 'confirm:cancel')],
])

export const sellPercentMenu = (tokenAddress: string) => Markup.inlineKeyboard([
  [
    Markup.button.callback('25%', `sellpct:25:${tokenAddress}`),
    Markup.button.callback('50%', `sellpct:50:${tokenAddress}`),
  ],
  [
    Markup.button.callback('75%', `sellpct:75:${tokenAddress}`),
    Markup.button.callback('100%', `sellpct:100:${tokenAddress}`),
  ],
  [Markup.button.callback('Cancel', 'confirm:cancel')],
])

export const confirmSellMenu = () => Markup.inlineKeyboard([
  [Markup.button.callback('Confirm Sell', 'confirm:sell')],
  [Markup.button.callback('Cancel', 'confirm:cancel')],
])

export const removeWalletMenu = () => Markup.inlineKeyboard([
  [Markup.button.callback('Remove Wallet', 'wallet:remove')],
  [Markup.button.callback('Cancel', 'main:wallet')],
])
