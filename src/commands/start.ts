import {Command} from '@oclif/core'
import start from '../app'

export default class Start extends Command {
  static description = 'run bot'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  public async run(): Promise<void> {
    start()
  }
}
