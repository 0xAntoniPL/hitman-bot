import Web3 from 'web3'
import {nodeConfig} from '../../config/index'

export const initializeWeb3 = (chain: any) => {
  return new Promise((resolve, reject) => {
    let primaryNode: any
    let secondaryNode: any

    const wsConfig = {
      clientConfig: {
        keepalive: true,
        // eslint-disable-next-line unicorn/numeric-separators-style
        keepaliveInterval: 30000,
      },
      reconnect: {
        auto: true,
        delay: 500,
        maxAttempts: 5,
        onTimeout: true,
      },
    }

    const rpcConfig = {
      keepAlive: true,
    }

    switch (chain) {
    case 1:
      primaryNode = buildWeb3Connection(nodeConfig.get('eth.websockets'), wsConfig, rpcConfig)
      secondaryNode = buildWeb3Connection(nodeConfig.get('eth.rpc'), wsConfig, rpcConfig)
      break

    case 4:
      primaryNode = buildWeb3Connection(nodeConfig.get('eth_rinkeby.websockets'), wsConfig, rpcConfig)
      secondaryNode = buildWeb3Connection(nodeConfig.get('eth_rinkeby.rpc'), wsConfig, rpcConfig)
      break

    case 56:
      primaryNode = buildWeb3Connection(nodeConfig.get('bsc.websockets'), wsConfig, rpcConfig)
      secondaryNode = buildWeb3Connection(nodeConfig.get('bsc.rpc'), wsConfig, rpcConfig)
      break

    case 137:
      primaryNode = buildWeb3Connection(nodeConfig.get('matic.websockets'), wsConfig, rpcConfig)
      secondaryNode = buildWeb3Connection(nodeConfig.get('matic.rpc'), wsConfig, rpcConfig)
      break

    case 250:
      primaryNode = buildWeb3Connection(nodeConfig.get('ftm.websockets'), wsConfig, rpcConfig)
      secondaryNode = buildWeb3Connection(nodeConfig.get('ftm.rpc'), wsConfig, rpcConfig)
      break

    case 321:
      primaryNode = buildWeb3Connection(nodeConfig.get('kcs.websockets'), wsConfig, rpcConfig)
      secondaryNode = buildWeb3Connection(nodeConfig.get('kcs.rpc'), wsConfig, rpcConfig)
      break

    // eslint-disable-next-line unicorn/numeric-separators-style
    case 43114:
      primaryNode = buildWeb3Connection(nodeConfig.get('avax.websockets'), wsConfig, rpcConfig)
      secondaryNode = buildWeb3Connection(nodeConfig.get('avax.rpc'), wsConfig, rpcConfig)
      break

    // eslint-disable-next-line unicorn/numeric-separators-style
    case 4663:
      primaryNode = buildWeb3Connection(nodeConfig.get('robinhood.websockets'), wsConfig, rpcConfig)
      secondaryNode = buildWeb3Connection(nodeConfig.get('robinhood.rpc'), wsConfig, rpcConfig)
      break

    // eslint-disable-next-line unicorn/numeric-separators-style
    case 46630:
      primaryNode = buildWeb3Connection(nodeConfig.get('robinhood_testnet.websockets'), wsConfig, rpcConfig)
      secondaryNode = buildWeb3Connection(nodeConfig.get('robinhood_testnet.rpc'), wsConfig, rpcConfig)
      break

    default:
      return reject('Unsupported EVM Chain')
    }

    if (!Object.prototype.hasOwnProperty.call(primaryNode, 'eth')) return reject(connectFailedString('primary'))
    if (!Object.prototype.hasOwnProperty.call(secondaryNode, 'eth')) return reject(connectFailedString('secondary'))
    primaryNode.eth.net.isListening().then(() => {
      secondaryNode.eth.net.isListening().then(() => {
        return resolve({
          primary: primaryNode,
          secondary: secondaryNode,
        })
      }).catch(() => {
        return reject(connectFailedString('secondary'))
      })
    }).catch(() => {
      return reject(connectFailedString('primary'))
    })
  })
}

const buildWeb3Connection = (evmNode: any, wsConfig: any, rpcConfig: any) => {
  const nodeUrl = String(evmNode)
  if (nodeUrl.toLowerCase().startsWith('http')) return new Web3(new Web3.providers.HttpProvider(nodeUrl, rpcConfig))
  if (nodeUrl.toLowerCase().startsWith('ws')) return new Web3(new Web3.providers.WebsocketProvider(nodeUrl, wsConfig))
  throw 'Invalid EVM node URL'
}

const connectFailedString = (G: any) => 'Failed to connect to ' + G.toUpperCase() + ' node.'