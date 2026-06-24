import {Command, flags} from '@oclif/command'
import * as os from 'os'
import {config} from '../config/index'

export default class Config extends Command {
  static description = 'manage configuration'

  static flags = {
    help: flags.help({char: 'h'}),
    delete: flags.boolean({char: 'd', description: 'delete?'})
  }

  static args = [
    {
      name: 'key',
      options: [
        'amt_mode',
        'amount',
        'slippage',
        'iteration',
        'gas_price',
        'priority_gas',
        'honeypot_check',
        'block_severe_fee',
        'delay_execution',
        'delay_iteration',
        'rug_pull_check',
        'sell_management',
        'telegram.api_id',
        'telegram.api_hash',
      ],
    },
    {name: 'value', description: 'value'}
  ]

  async run() {
    const {args, flags} = this.parse(Config)

    const key = args.key
    let value = args.value

    if (key) {
      if (flags.delete) {
        config.delete(key)
      } else if (value) {
        config.set(key, value)
      } else {
        value = config.get(key)
        if (value !== null && value !== undefined) {
          this.print(value)
        }
      }
    } else {
      for (let c of config) {
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
