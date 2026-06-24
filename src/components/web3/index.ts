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
      primaryNode = new Web3(new Web3.providers.WebsocketProvider(nodeConfig.get('eth.websockets'), wsConfig))
      secondaryNode = new Web3(new Web3.providers.HttpProvider(nodeConfig.get('eth.rpc'), rpcConfig))
      break

    case 4:
      primaryNode = new Web3(new Web3.providers.WebsocketProvider(nodeConfig.get('eth_rinkeby.websockets'), wsConfig))
      secondaryNode = new Web3(new Web3.providers.HttpProvider(nodeConfig.get('eth_rinkeby.rpc'), rpcConfig))
      break

    case 56:
      primaryNode = new Web3(new Web3.providers.WebsocketProvider(nodeConfig.get('bsc.websockets'), wsConfig))
      secondaryNode = new Web3(new Web3.providers.HttpProvider(nodeConfig.get('bsc.rpc'), rpcConfig))
      break

    case 137:
      primaryNode = new Web3(new Web3.providers.WebsocketProvider(nodeConfig.get('matic.websockets'), wsConfig))
      secondaryNode = new Web3(new Web3.providers.HttpProvider(nodeConfig.get('matic.rpc'), rpcConfig))
      break

    case 250:
      primaryNode = new Web3(new Web3.providers.WebsocketProvider(nodeConfig.get('ftm.websockets'), wsConfig))
      secondaryNode = new Web3(new Web3.providers.HttpProvider(nodeConfig.get('ftm.rpc'), rpcConfig))
      break

    case 321:
      primaryNode = new Web3(new Web3.providers.WebsocketProvider(nodeConfig.get('kcs.websockets'), wsConfig))
      secondaryNode = new Web3(new Web3.providers.HttpProvider(nodeConfig.get('kcs.rpc'), rpcConfig))
      break

    // eslint-disable-next-line unicorn/numeric-separators-style
    case 43114:
      primaryNode = new Web3(new Web3.providers.WebsocketProvider(nodeConfig.get('avax.websockets'), wsConfig))
      secondaryNode = new Web3(new Web3.providers.HttpProvider(nodeConfig.get('avax.rpc'), rpcConfig))
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

// const buildWeb3Connection = (evmNode: any, wsConfig: any, rpcConfig: any) => {
//     if (evmNode.toLowerCase().startsWith('https')) return new Web3(new Web3.providers.HttpProvider(evmNode, rpcConfig));
//     else {
//         if (evmNode.toLowerCase().startsWith('wss')) return new Web3(new Web3.providers.WebsocketProvider(evmNode, wsConfig));
//         else throw 'EOFError';
//     }
// };

const connectFailedString = (G: any) => 'Failed to connect to ' + G.toUpperCase() + ' node.'
