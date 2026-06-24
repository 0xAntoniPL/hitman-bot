// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'node... Remove this comment to see the full error message
import fetch from 'node-fetch'
import {
  fileLogger,
} from '../winston/index'

export const fetchTrustWalletTokens = (G: any) => {
  return new Promise(resolve => {
    let J

    switch (G) {
    case 1:
      J = 'https://raw.githubusercontent.com/trustwallet/assets/7becc3825c0ba4ea209d921f6ab6081a1ecbd023/blockchains/ethereum/allowlist.json'
      break

    case 56:
      J = 'https://raw.githubusercontent.com/trustwallet/assets/7becc3825c0ba4ea209d921f6ab6081a1ecbd023/blockchains/smartchain/allowlist.json'
      break

    case 137:
      J = 'https://raw.githubusercontent.com/trustwallet/assets/7becc3825c0ba4ea209d921f6ab6081a1ecbd023/blockchains/polygon/allowlist.json'
      break

    default:
      J = ''
      break
    }

    const l: any = []
    if (J) fetch(J).then((X: any) => {
      if (X.ok) X.json().then((u: any) => {
        for (const E of u) {
          l.push(E)
        }

        return resolve(l)
      })
      else {
        fileLogger.error('CORE: fetchTrustWalletTokens(): ' + X.statusText)
        return resolve(l)
      }
    })
    else return resolve(l)
  })
}

export const checkForHoneypot = (G: any, D: any, J: any) => {
  return new Promise((resolve, reject) => {
    let u

    switch (J) {
    case 1:
      u = 'eth'
      break

    case 56:
      u = 'bsc'
      break

    case 137:
      u = 'poly'
      break

    case 250:
      u = 'ftm'
      break

    // eslint-disable-next-line unicorn/numeric-separators-style
    case 43114:
      u = 'avax'
      break

    default:
      u = ''
      break
    }

    if (u) fetch('https://honeypot.api.rugdoc.io/api/honeypotStatus.js?address=' + G + '&chain=' + u).then((E: any) => {
      if (E.ok) E.json().then((s: any) => {
        if (s.status === 'UNKNOWN') return resolve('The status of this token is unknown.')
        else {
          if (s.status === 'NO_PAIRS') return resolve('Could not find any trading pair for this token.')
          else {
            if (s.status === 'OK') return resolve('Honeypot tests passed.')
            else {
              if (s.status === 'MEDIUM_FEE') return resolve('A trading fee of over 10% but less then 20% was detected when trading.')
              else {
                if (s.status === 'HIGH_FEE') return resolve('A high trading fee (Between 20% and 50%) was detected when trading.')
                else {
                  if (s.status === 'SEVERE_FEE') {
                    if (D === 'true') return reject('A severely high trading fee (over 50%) was detected when trading.')
                    return resolve('A severely high trading fee (over 50%) was detected when trading.')
                  } else {
                    if (s.status === 'APPROVE_FAILED') return reject('Failed to approve the token. This is very likely a honeypot.')
                    else {
                      if (s.status === 'SWAP_FAILED') return reject('Failed to sell the token. This is very likely a honeypot.')
                    }
                  }
                }
              }
            }
          }
        }
      })
      else {
        fileLogger.error('CORE: checkForHoneypot(): ' + E.statusText)
        return resolve('Skipping for now... RugDoc is down...')
      }
    })
    else return resolve('Skipping for now... Unsupported EVM Chain')
  })
}

export const fetchBinancePrice = (G: any) => {
  return new Promise(resolve => {
    fetch('https://api.binance.com/api/v3/ticker/price?symbol=' + G).then((J: any) => {
      if (J.ok) J.json().then((l: any) => {
        return resolve(l.price)
      })
      else {
        fileLogger.error('CORE: fetchBinancePrice(): ' + J.statusText)
        return resolve('0')
      }
    })
  })
}
