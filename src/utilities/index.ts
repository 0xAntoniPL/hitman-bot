import fs from 'fs'
import {
  homedir,
} from 'os'
import path from 'path'
import {
  fileLogger,
  somethingWentWrong,
} from '../components/winston/index'
import {
  formatGWei,
  getPrimaryGas,
} from '../helper/index'

export const getCoreLocation = (G: any) => {
  if (G) return path.join(homedir(), 'Documents', 'defi-cli-configs', G)
  return path.join(homedir(), 'Documents', 'defi-cli-configs')
}

export const readFile = (G: any) => {
  return new Promise((D, J) => {
    fs.readFile(getCoreLocation(G + '.json'), (l, X) => {
      if (!l) return D(JSON.parse(X.toString()))
      return J()
    })
  })
}

export const writeFile = (G: any, D: any) => {
  return new Promise(J => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
    if (!fs.existsSync(getCoreLocation())) fs.mkdirSync(getCoreLocation())
    fs.writeFile(getCoreLocation(G + '.json'), JSON.stringify(D, null, '\t'), l => {
      // @ts-expect-error ts-migrate(2794) FIXME: Expected 1 arguments, but got 0. Did you forget to... Remove this comment to see the full error message
      if (!l) return J()
      fileLogger.error('CORE: writeFile(): ' + l)
      return somethingWentWrong()
    })
  })
}

export const validateSettings = (G: any) => {
  return new Promise((D, J) => {
    //const l = G.EVM_NODE.toUpperCase();
    //if (!['GA', 'SG'].includes(l) && !l.startsWith('HTTPS') && !l.startsWith('WSS')) return J('Unsupported EVM Endpoint');
    if (G.private_key.length !== 64) return J('Invalid Private Key')
    // @ts-expect-error ts-migrate(2794) FIXME: Expected 1 arguments, but got 0. Did you forget to... Remove this comment to see the full error message
    return D()
  })
}

export const validateConfigs = async (G: any, J: any) => {
  const l = await getPrimaryGas()
  return new Promise((X, u) => {
    if (G.amt_mode.toLowerCase() !== 'usd' && G.amt_mode.toLowerCase() !== 'eth') return u('The `amt_mode` option must be `USD` or `ETH` only.')
    if (!parseFloat(G.amount) || parseFloat(G.amount) < 0) return u('The `amount` option must be a positive number.')
    if (!parseInt(G.slippage) || parseInt(G.slippage) < 1 || parseInt(G.slippage) > 100) return u('The `slippage` option must be between 1 and 100.')
    if (!parseInt(G.iteration) || parseInt(G.iteration) < 1) return u('The `iteration` option must be a positive number.')
    if (!parseFloat(G.gas_price) && G.gas_price !== '0' || parseFloat(G.gas_price) < parseFloat(formatGWei(l)) && G.gas_price !== '0') return u('The `gas_price` option must be greater than ' + formatGWei(l) + '.')
    if (!parseFloat(G.priority_gas) || parseFloat(G.priority_gas) < 1 || parseFloat(G.priority_gas) > parseFloat(formatGWei(l))) return u('The `priority_gas` option must be greater than 1 and lesser than ' + formatGWei(l) + '.')
    if (G.honeypot_check.toLowerCase() !== 'true' && G.honeypot_check.toLowerCase() !== 'false') return u('The `honeypot_check` option must be `true` or `false` only.')
    if (G.block_severe_fee.toLowerCase() !== 'true' && G.block_severe_fee.toLowerCase() !== 'false') return u('The `block_severe_fee` option must be `true` or `false` only.')
    if (G.block_severe_fee.toLowerCase() === 'true' && G.honeypot_check.toLowerCase() === 'false') return u('The `honeypot_check` must be `true` for `block_severe_fee` to work.')
    if (!parseFloat(G.delay_execution) && G.delay_execution !== '0' || parseFloat(G.delay_execution) < 0) return u('The `delay_execution` option must be a number.')
    if (!parseFloat(G.delay_iteration) && G.delay_iteration !== '0' || parseFloat(G.delay_iteration) < 0) return u('The `delay_iteration` option must be a number.')
    if (G.rug_pull_check.toLowerCase() !== 'true' && G.rug_pull_check.toLowerCase() !== 'false') return u('The `rug_pull_check` option must be `true` or `false` only.')
    if (G.sell_management.toLowerCase() !== 'true' && G.sell_management.toLowerCase() !== 'false') return u('The `sell_management` option must be `true` or `false` only.')
    if (G.rug_pull_check.toLowerCase() === 'true' && (J === 56 || J === 43114 )) return u('The `rug_pull_check` option is not supported on this endpoint.')
    if (G.sell_management.toLowerCase() === 'true' && J === 43114 ) return u('The `sell_management` option is not supported on this endpoint.')
    // @ts-expect-error ts-migrate(2794) FIXME: Expected 1 arguments, but got 0. Did you forget to... Remove this comment to see the full error message
    return X()
  })
}

export const validateTelegram = (G: any) => {
  return new Promise((D, J) => {
    if (G.API_ID === '') return J('The `API_ID` is missing.')
    if (G.API_HASH === '') return J('The `API_HASH` is missing.')
    // @ts-expect-error ts-migrate(2794) FIXME: Expected 1 arguments, but got 0. Did you forget to... Remove this comment to see the full error message
    return D()
  })
}
