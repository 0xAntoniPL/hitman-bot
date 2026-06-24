import {Command, flags} from '@oclif/command'
import * as os from 'os';
import {walletConfig} from '../config/index'

export default class Config extends Command {
  static description = 'add or remove wallet'

  static flags = {
    help: flags.help({char: 'h'}),
    delete: flags.boolean({char: 'd', description: 'delete?'}),
  }

  static args = [
    {
      name: 'key',
      options: [
        'private_key',
        'additional_private_keys',
      ],
    },
    {name: 'value', description: 'value'},
  ]

  async run() {
    const {args, flags} = this.parse(Config)

    const key = args.key
    let value = args.value

    if (key) {
      if (flags.delete) {
        walletConfig.delete(key)
      } else if (value) {
        walletConfig.set(key, value)
      } else {
        value = walletConfig.get(key)
        if (value !== null && value !== undefined) {
          const last = value.substring(value.length - 4);
          this.print(last)
        }
      }
    } else {
      for (let c of walletConfig) {
        this.print(c[0] + os.EOL)
      }
    }
  }

  private print(value: any) {
    if (typeof value === 'object') {
      value = JSON.stringify(value)
    }
    process.stdout.write(value)
  }
}