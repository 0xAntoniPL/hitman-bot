import Database from 'better-sqlite3'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  BotUserProfile,
  CreateTradeHistoryInput,
  PendingAction,
  StoredWallet,
  TradeAction,
  TradeHistoryEntry,
  TradeStatus,
  UserIdentityInput,
  UserSettings,
  defaultUserSettings,
} from '../types'

const defaultDataDir = () => path.join(os.homedir(), 'Documents', 'robinhood-defi-bot')

const nowIso = () => new Date().toISOString()

const toBoolean = (value: number) => value === 1
const fromBoolean = (value: boolean) => value ? 1 : 0

export class BotDatabase {
  private db: Database.Database

  constructor(databasePath = process.env.RH_BOT_DB || path.join(defaultDataDir(), 'bot.sqlite')) {
    fs.mkdirSync(path.dirname(databasePath), {recursive: true})
    this.db = new Database(databasePath)
    this.db.pragma('journal_mode = WAL')
    this.migrate()
  }

  close() {
    this.db.close()
  }

  private migrate() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        telegram_id INTEGER PRIMARY KEY,
        username TEXT NOT NULL DEFAULT '',
        first_name TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS wallets (
        telegram_id INTEGER PRIMARY KEY,
        address TEXT NOT NULL,
        encrypted_private_key TEXT NOT NULL,
        iv TEXT NOT NULL,
        auth_tag TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (telegram_id) REFERENCES users(telegram_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS settings (
        telegram_id INTEGER PRIMARY KEY,
        amount_mode TEXT NOT NULL,
        amount TEXT NOT NULL,
        slippage TEXT NOT NULL,
        iterations INTEGER NOT NULL,
        gas_price_gwei TEXT NOT NULL,
        dry_run INTEGER NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (telegram_id) REFERENCES users(telegram_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS pending_actions (
        telegram_id INTEGER PRIMARY KEY,
        action TEXT NOT NULL,
        payload TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (telegram_id) REFERENCES users(telegram_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS trade_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telegram_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        token_address TEXT NOT NULL,
        token_symbol TEXT NOT NULL,
        amount_mode TEXT NOT NULL,
        amount TEXT NOT NULL,
        tx_hash TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL,
        error TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        FOREIGN KEY (telegram_id) REFERENCES users(telegram_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS bot_state (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `)
  }

  upsertUser(input: UserIdentityInput): BotUserProfile {
    const timestamp = nowIso()
    this.db.prepare(`
      INSERT INTO users (telegram_id, username, first_name, created_at, updated_at)
      VALUES (@telegramId, @username, @firstName, @createdAt, @updatedAt)
      ON CONFLICT(telegram_id) DO UPDATE SET
        username = excluded.username,
        first_name = excluded.first_name,
        updated_at = excluded.updated_at
    `).run({
      telegramId: input.telegramId,
      username: input.username || '',
      firstName: input.firstName || '',
      createdAt: timestamp,
      updatedAt: timestamp,
    })

    this.ensureSettings(input.telegramId)
    return this.getUser(input.telegramId) as BotUserProfile
  }

  getUser(telegramId: number): BotUserProfile | undefined {
    const row = this.db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(telegramId) as any
    if (!row) return undefined
    return {
      telegramId: row.telegram_id,
      username: row.username,
      firstName: row.first_name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  saveWallet(wallet: Omit<StoredWallet, 'createdAt' | 'updatedAt'>) {
    const timestamp = nowIso()
    this.db.prepare(`
      INSERT INTO wallets (telegram_id, address, encrypted_private_key, iv, auth_tag, created_at, updated_at)
      VALUES (@telegramId, @address, @encryptedPrivateKey, @iv, @authTag, @createdAt, @updatedAt)
      ON CONFLICT(telegram_id) DO UPDATE SET
        address = excluded.address,
        encrypted_private_key = excluded.encrypted_private_key,
        iv = excluded.iv,
        auth_tag = excluded.auth_tag,
        updated_at = excluded.updated_at
    `).run({
      ...wallet,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
  }

  getWallet(telegramId: number): StoredWallet | undefined {
    const row = this.db.prepare('SELECT * FROM wallets WHERE telegram_id = ?').get(telegramId) as any
    if (!row) return undefined
    return {
      telegramId: row.telegram_id,
      address: row.address,
      encryptedPrivateKey: row.encrypted_private_key,
      iv: row.iv,
      authTag: row.auth_tag,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  deleteWallet(telegramId: number) {
    this.db.prepare('DELETE FROM wallets WHERE telegram_id = ?').run(telegramId)
  }

  ensureSettings(telegramId: number): UserSettings {
    const existing = this.getSettings(telegramId)
    if (existing) return existing
    this.saveSettings(telegramId, defaultUserSettings())
    return defaultUserSettings()
  }

  getSettings(telegramId: number): UserSettings | undefined {
    const row = this.db.prepare('SELECT * FROM settings WHERE telegram_id = ?').get(telegramId) as any
    if (!row) return undefined
    return {
      amountMode: row.amount_mode,
      amount: row.amount,
      slippage: row.slippage,
      iterations: row.iterations,
      gasPriceGwei: row.gas_price_gwei,
      dryRun: toBoolean(row.dry_run),
    }
  }

  saveSettings(telegramId: number, settings: UserSettings) {
    this.db.prepare(`
      INSERT INTO settings (telegram_id, amount_mode, amount, slippage, iterations, gas_price_gwei, dry_run, updated_at)
      VALUES (@telegramId, @amountMode, @amount, @slippage, @iterations, @gasPriceGwei, @dryRun, @updatedAt)
      ON CONFLICT(telegram_id) DO UPDATE SET
        amount_mode = excluded.amount_mode,
        amount = excluded.amount,
        slippage = excluded.slippage,
        iterations = excluded.iterations,
        gas_price_gwei = excluded.gas_price_gwei,
        dry_run = excluded.dry_run,
        updated_at = excluded.updated_at
    `).run({
      telegramId,
      amountMode: settings.amountMode,
      amount: settings.amount,
      slippage: settings.slippage,
      iterations: settings.iterations,
      gasPriceGwei: settings.gasPriceGwei,
      dryRun: fromBoolean(settings.dryRun),
      updatedAt: nowIso(),
    })
  }

  setPendingAction(telegramId: number, action: string, payload: Record<string, unknown> = {}) {
    this.db.prepare(`
      INSERT INTO pending_actions (telegram_id, action, payload, created_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(telegram_id) DO UPDATE SET
        action = excluded.action,
        payload = excluded.payload,
        created_at = excluded.created_at
    `).run(telegramId, action, JSON.stringify(payload), nowIso())
  }

  getPendingAction(telegramId: number): PendingAction | undefined {
    const row = this.db.prepare('SELECT * FROM pending_actions WHERE telegram_id = ?').get(telegramId) as any
    if (!row) return undefined
    return {
      telegramId: row.telegram_id,
      action: row.action,
      payload: JSON.parse(row.payload),
      createdAt: row.created_at,
    }
  }

  clearPendingAction(telegramId: number) {
    this.db.prepare('DELETE FROM pending_actions WHERE telegram_id = ?').run(telegramId)
  }

  addTradeHistory(input: CreateTradeHistoryInput) {
    this.db.prepare(`
      INSERT INTO trade_history
        (telegram_id, action, token_address, token_symbol, amount_mode, amount, tx_hash, status, error, created_at)
      VALUES
        (@telegramId, @action, @tokenAddress, @tokenSymbol, @amountMode, @amount, @txHash, @status, @error, @createdAt)
    `).run({
      ...input,
      txHash: input.txHash || '',
      error: input.error || '',
      createdAt: nowIso(),
    })
  }

  listTradeHistory(telegramId: number, limit = 5): TradeHistoryEntry[] {
    const rows = this.db.prepare(`
      SELECT * FROM trade_history
      WHERE telegram_id = ?
      ORDER BY id DESC
      LIMIT ?
    `).all(telegramId, limit) as any[]

    return rows.map(row => ({
      id: row.id,
      telegramId: row.telegram_id,
      action: row.action as TradeAction,
      tokenAddress: row.token_address,
      tokenSymbol: row.token_symbol,
      amountMode: row.amount_mode,
      amount: row.amount,
      txHash: row.tx_hash,
      status: row.status as TradeStatus,
      error: row.error,
      createdAt: row.created_at,
    }))
  }

  getBotState(key: string): string | undefined {
    const row = this.db.prepare('SELECT value FROM bot_state WHERE key = ?').get(key) as any
    return row?.value
  }

  setBotState(key: string, value: string) {
    this.db.prepare(`
      INSERT INTO bot_state (key, value, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = excluded.updated_at
    `).run(key, value, nowIso())
  }

  isPaused() {
    return this.getBotState('paused') === 'true'
  }
}
