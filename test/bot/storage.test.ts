import {expect} from 'chai'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {BotDatabase} from '../../src/bot/storage/database'
import {defaultUserSettings} from '../../src/bot/types'

describe('bot storage', () => {
  let db: BotDatabase
  let tempDir: string

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hitman-bot-test-'))
    db = new BotDatabase(path.join(tempDir, 'bot.sqlite'))
  })

  afterEach(() => {
    db.close()
    fs.rmSync(tempDir, {recursive: true, force: true})
  })

  it('creates users with default settings', () => {
    const user = db.upsertUser({telegramId: 123, username: 'tester', firstName: 'Test'})
    expect(user.telegramId).to.equal(123)
    expect(db.ensureSettings(123)).to.deep.equal(defaultUserSettings())
  })

  it('stores wallets, pending actions, and trade history', () => {
    db.upsertUser({telegramId: 123})
    db.saveWallet({
      telegramId: 123,
      address: '0x1234567890123456789012345678901234567890',
      encryptedPrivateKey: 'encrypted',
      iv: 'iv',
      authTag: 'tag',
    })
    db.setPendingAction(123, 'confirm_buy', {tokenAddress: '0xabc'})
    db.addTradeHistory({
      telegramId: 123,
      action: 'BUY',
      tokenAddress: '0xabc',
      tokenSymbol: 'ABC',
      amountMode: 'USD',
      amount: '10',
      status: 'DRY_RUN',
    })

    expect(db.getWallet(123)?.address).to.equal('0x1234567890123456789012345678901234567890')
    expect(db.getPendingAction(123)?.payload.tokenAddress).to.equal('0xabc')
    expect(db.listTradeHistory(123)).to.have.length(1)
  })

  it('stores bot pause state', () => {
    expect(db.isPaused()).to.equal(false)
    db.setBotState('paused', 'true')
    expect(db.isPaused()).to.equal(true)
  })
})
