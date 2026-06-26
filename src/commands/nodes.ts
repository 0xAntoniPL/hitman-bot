import {Command, flags} from '@oclif/command'
import * as os from 'os'
import {nodeConfig} from '../config/index'

export default class NodeConfig extends Command {
  static description = 'manage EVM node configuration'

  static flags = {
    help: flags.help({char: 'h'}),
    delete: flags.boolean({char: 'd', description: 'delete?'}),
  }

  static args = [
    {
      name: 'key',
      options: [
        'eth.websockets',
        'eth.rpc',
        'eth_rinkeby.websockets',
        'eth_rinkeby.rpc',
        'bsc.websockets',
        'bsc.rpc',
        'matic.websockets',
        'matic.rpc',
        'ftm.websockets',
        'ftm.rpc',
        'kcs.websockets',
        'kcs.rpc',
        'avax.websockets',
        'avax.rpc',
        'robinhood.websockets',
        'robinhood.rpc',
        'robinhood_testnet.websockets',
        'robinhood_testnet.rpc',
      ],
    },
    {name: 'value', description: 'value'},
  ]

  async run() {
    const {args, flags} = this.parse(NodeConfig)

    const key = args.key
    let value = args.value

    if (key) {
      if (flags.delete) {
        nodeConfig.delete(key)
      } else if (value) {
        nodeConfig.set(key, value)
      } else {
        value = nodeConfig.get(key)
        if (value !== null && value !== undefined) {
          this.print(value)
        }
      }
    } else {
      for (let c of nodeConfig) {
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
