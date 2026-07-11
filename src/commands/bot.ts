import {Command} from '@oclif/core'
import {startBot} from '../bot/index'

export default class Bot extends Command {
  static description = 'run Telegram bot interface'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  public async run(): Promise<void> {
    this.log('Starting Robinhood Telegram bot...')
    await startBot()
    this.log('Robinhood Telegram bot is running.')
  }
}
