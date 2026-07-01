/* eslint-disable camelcase */
/* eslint-disable complexity */
/* eslint-disable no-negated-condition */
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'abi-... Remove this comment to see the full error message
import abiDecoder from 'abi-decoder'
import BN from 'bn.js'
import web3utils from 'web3-utils'
import chalk from 'chalk'
import readline from 'node:readline'
import {
  sleep,
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module '@mtp... Remove this comment to see the full error message
} from '@mtproto/core/src/utils/common/index.js'
import ora from 'ora'
import {
  fetchBinancePrice,
} from '../components/fetch/index'
import {
  fileLogger,
} from '../components/winston/index'
import {
  printErrorHeading,
  printSubHeading,
} from '../console/index'
import {
  getPrimary,
  getSecondary,
} from '../ethereum/index'
import {
  formatEther,
  formatWei,
  getDeadline,
  getPrimaryGas,
  getSecondaryBlock,
  maxUint256,
  numberWithCommas,
  signThenSendPrimaryTxn,
} from '../helper/index'
import {
  abiDecoder_abis,
  getAmountsOut_abi,
  predictionCg_abis,
  predictionPcs_abis,
  predictionPcsLatestRoundData_abi,
  swapExactAVAXForTokens_abi,
  // swapExactETHForTokens_abi,
  swapExactKCSForTokens_abi,
  swapExactTokensForAVAXSupportingFeeOnTransferTokens_abi,
  // swapExactTokensForETHSupportingFeeOnTransferTokens_abi,
  swapExactTokensForKCSSupportingFeeOnTransferTokens_abi,
} from './abi-item'

import uniswapRouterAbi = require('./abi/router.json');

import {
  ContractContext,
} from './abi/types/router'

let web3: any
let secondary: any
let contract: any
let symbol: any
let native: any
let usd: any

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const initializeExchange = (chain: any, exchange: any) => {
  return new Promise(resolve => {
    web3 = getPrimary()
    secondary = getSecondary()

    switch (chain) {
    case 1:
      symbol = 'ETH'
      native = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
      usd = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
      if (exchange === 'LAUNCH') exchange = 'UNI'
      break

    case 4:
      symbol = 'ETH'
      native = '0xc778417E063141139Fce010982780140Aa0cD5Ab'
      usd = '0xA6Cc591f2Fd8784DD789De34Ae7307d223Ca3dDc'
      break

    case 56:
      symbol = 'BNB'
      native = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
      usd = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56'
      if (exchange === 'LAUNCH' || exchange === 'CANDLE') exchange = 'PANCAKE'
      break

    case 137:
      symbol = 'MATIC'
      native = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'
      usd = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
      if (exchange === 'LAUNCH') exchange = 'QUICK'
      break

    case 250:
      symbol = 'FTM'
      native = '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83'
      usd = '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75'
      if (exchange === 'LAUNCH') exchange = 'SPOOKY'
      break

    case 321:
      symbol = 'KCS'
      native = '0x4446fc4eb47f2f6586f9faab68b3498f86c07521'
      usd = '0x0039f574ee5cc39bdd162e9a88e3eb1f111baf48'
      if (exchange === 'LAUNCH') exchange = 'KOFFEE'
      break

    case 43114:
      symbol = 'AVAX'
      native = '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7'
      usd = '0xc7198437980c041c805A1EDcbA50c1Ce5db95118'
      if (exchange === 'LAUNCH') exchange = 'TRADER'
      break

    // eslint-disable-next-line unicorn/numeric-separators-style
    case 4663:
      symbol = 'ETH'
      native = '0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73'
      usd = '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168'
      break

    default:
      break
    }

    switch (exchange) {
    case 'UNI':
      contract = {
        router: new web3.eth.Contract(uniswapRouterAbi, '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D') as unknown as ContractContext,
      }
      break

    case 'SUSHI':
      contract = {
        router: new web3.eth.Contract(uniswapRouterAbi, '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F'),
      }
      break

    case 'PANCAKE':
      contract = {
        router: new web3.eth.Contract(uniswapRouterAbi, '0x10ED43C718714eb63d5aA57B78B54704E256024E'),
        predictionPcsBNB: new web3.eth.Contract(predictionPcs_abis, '0x18B2A687610328590Bc8F2e5fEdDe3b582A49cdA'),
        predictionPcsBNB_oracle: new web3.eth.Contract([predictionPcsLatestRoundData_abi], '0xD276fCF34D54A926773c399eBAa772C12ec394aC'),
        predictionCgBTC: new web3.eth.Contract(predictionCg_abis, '0x995294CdBfBf7784060BD3Bec05CE38a5F94A0C5'),
        predictionCgBNB: new web3.eth.Contract(predictionCg_abis, '0x4d85b145344f15B4419B8afa1CbB2A9d00B17935'),
        predictionCgETH: new web3.eth.Contract(predictionCg_abis, '0x65669Dcd4813341ACACF51b261F560c92d40A632'),
      }
      break

    case 'APE':
      contract = {
        router: new web3.eth.Contract(uniswapRouterAbi, '0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7'),
      }
      break

    case 'QUICK':
      contract = {
        router: new web3.eth.Contract(uniswapRouterAbi, '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff'),
      }
      break

    case 'SPOOKY':
      contract = {
        router: new web3.eth.Contract(uniswapRouterAbi, '0xF491e7B69E4244ad4002BC14e878a34207E38c29'),
      }
      break

    case 'SPIRIT':
      contract = {
        router: new web3.eth.Contract(uniswapRouterAbi, '0x16327E3FbDaCA3bcF7E38F5Af2599D2DDc33aE52'),
      }
      break

    case 'KOFFEE':
      contract = {
        router: new web3.eth.Contract([getAmountsOut_abi, swapExactKCSForTokens_abi, swapExactTokensForKCSSupportingFeeOnTransferTokens_abi], '0xc0ffee0000c824d24e0f280f1e4d21152625742b'),
      }
      break

    case 'KU':
      contract = {
        router: new web3.eth.Contract(uniswapRouterAbi, '0xa58350d6dee8441aa42754346860e3545cc83cda'),
      }
      break

    case 'TRADER':
      contract = {
        router: new web3.eth.Contract([getAmountsOut_abi, swapExactAVAXForTokens_abi, swapExactTokensForAVAXSupportingFeeOnTransferTokens_abi], '0x60aE616a2155Ee3d9A68541Ba4544862310933d4'),
      }
      break

    default:
      break
    }

    if (abiDecoder.getABIs() !== []) abiDecoder.removeABI(abiDecoder_abis)
    abiDecoder.addABI(abiDecoder_abis)
    // @ts-expect-error ts-migrate(2794) FIXME: Expected 1 arguments, but got 0. Did you forget to... Remove this comment to see the full error message
    return resolve()
  })
}

export const getSymbol = () => symbol
export const getNative = () => native
export const getUsd = () => usd
export const getBalance = async (G: any) => {
  return web3utils.toBN(await web3.eth.getBalance(G))
}

export const getAmountsOut = async (amount: any, D = native, J = usd): Promise<BN> => {
  const zero = web3utils.toBN(0)
  if (amount.lte(zero)) return zero
  const result = (await contract.router.methods.getAmountsOut(amount.toString(), [D, J]).call()) || [amount.toString(), '0']
  return web3utils.toBN(result[1])
}

export const contributeToPresale = (userAddress: any, privateKey: any, presaleAddress: any, startTime: any, menuOption: any, configs: any, chain: any, amount: any) => {
  return new Promise(async (x, p) => {
    const spinner = ora({text: ('Pending'), spinner: 'aesthetic'}).start()
    const txConfig = chain !== 1 && chain !== 4 ? {
      from: userAddress,
      to: presaleAddress,
      value: web3.utils.toHex(amount),
      gasLimit: undefined,
      gasPrice: web3.utils.toHex(configs.gas_price === '0' ? (await getPrimaryGas()).mul(web3utils.toBN('2')) : formatWei(configs.gas_price, 'gwei')),
      data: undefined,
      nonce: undefined,
      chainId: chain,
    } : {
      from: userAddress,
      to: presaleAddress,
      value: web3.utils.toHex(amount),
      gasLimit: undefined,
      maxFeePerGas: web3.utils.toHex(configs.gas_price === '0' ? (await getPrimaryGas()).mul(web3utils.toBN('2')) : formatWei(configs.gas_price, 'gwei')),
      maxPriorityFeePerGas: web3.utils.toHex(formatWei(configs.priority_gas, 'gwei')),
      type: web3.utils.toHex('2'),
      data: undefined,
      nonce: undefined,
      chainId: chain,
    }

    await executeSwap()

    async function executeSwap() {
      const A = Math.floor(Date.now() / 1000)
      if (A <= Number(startTime)) return spinner.start('Pending / Time Now: ' + new Date().toUTCString())
      await sleep(1000)
      await executeSwap()
      web3.eth.getTransactionCount(userAddress, 'pending').then((nonce: any) => {
        if (menuOption === 60) web3.eth.estimateGas(txConfig, async (err: any, estimatedGas: any) => {
          if (!err) {
            txConfig.gasLimit = web3.utils.toHex(Math.round(estimatedGas * 2.5))
            txConfig.nonce = nonce
            signThenSendPrimaryTxn(txConfig, privateKey).then(g => {
              spinner.succeed('Contribute Tx: ' + g)
              spinner.stop()
              // @ts-expect-error ts-migrate(2794) FIXME: Expected 1 arguments, but got 0. Did you forget to... Remove this comment to see the full error message
              return x()
            }).catch(error => {
              spinner.stop()
              fileLogger.error('LAUNCHPAD: contributeToPresale().signThenSendPrimaryTxn(): ' + error)
              return p('Something went wrong... Check logs...')
            })
          } else {
            fileLogger.error('LAUNCHPAD: contributeToPresale().estimateGas(): ' + err)
            sleep(500)
            return await executeSwap()
          }
        })
        else if (menuOption === 70) {
          const w = new web3.eth.Contract([{
            inputs: [],
            name: 'contribute',
            outputs: [],
            payable: true,
            stateMutability: 'payable',
            type: 'function',
          }], presaleAddress)
          w.methods.contribute().estimateGas(txConfig, async (err: any, estimatedGas: any) => {
            if (!err) {
              txConfig.gasLimit = web3.utils.toHex(Math.round(Number.parseInt(estimatedGas) * 2.5))
              txConfig.data = w.methods.contribute().encodeABI()
              txConfig.nonce = nonce
              signThenSendPrimaryTxn(txConfig, privateKey).then(b => {
                spinner.succeed('Contribute Tx: ' + b)
                spinner.stop()
                // @ts-expect-error ts-migrate(2794) FIXME: Expected 1 arguments, but got 0. Did you forget to... Remove this comment to see the full error message
                return x()
              }).catch(error => {
                spinner.stop()
                fileLogger.error('LAUNCHPAD: contributeToPresale().signThenSendPrimaryTxn(): ' + error)
                return p('Something went wrong... Check logs...')
              })
            } else {
              fileLogger.error('LAUNCHPAD: contributeToPresale().estimateGas(): ' + err)
              sleep(500)
              return await executeSwap()
            }
          })
        } else return p('Launchpad EOFError')
      })
    }
  })
}

export const swapExactETHForTokens = (userAddress: any, privateKey: any, contractAddress: any, configs: any, chain: any, exchange: any) => {
  return new Promise(async (resolve, reject) => {
    const spinner = ora({text: ('Pending'), spinner: 'aesthetic'}).start()
    let iteration: any
    let U: any
    let amountsOut: any
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    if (configs.amt_mode.toLowerCase() === 'usd') amountsOut = await getAmountsOut(chain !== 56 && chain !== 321 ? formatWei(configs.amount, 'mwei') : formatWei(configs.amount), usd, native)
    else {
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
      // eslint-disable-next-line no-lonely-if
      if (configs.amt_mode.toLowerCase() === 'eth') amountsOut = web3utils.toBN(formatWei(configs.amount))
      else {
        fileLogger.error('CORE: swapExactETHForTokens(): Native Error')
        throw 'Native Error'
      }
    }

    const txConfig = chain !== 1 && chain !== 4 ? {
      to: contract.router._address,
      value: web3.utils.toHex(amountsOut),
      gasLimit: undefined,
      gasPrice: web3.utils.toHex(configs.gas_price === '0' ? (await (getPrimaryGas())).mul(web3utils.toBN(3)) : formatWei(configs.gas_price, 'gwei')),
      data: undefined,
      nonce: undefined,
      chainId: chain,
    } : {
      to: contract.router._address,
      value: web3.utils.toHex(amountsOut),
      gasLimit: undefined,
      maxFeePerGas: web3.utils.toHex(configs.gas_price === '0' ? (await (getPrimaryGas())).mul(web3utils.toBN(3)) : formatWei(configs.gas_price, 'gwei')),
      maxPriorityFeePerGas: web3.utils.toHex(formatWei(configs.priority_gas, 'gwei')),
      type: web3.utils.toHex('2'),
      data: undefined,
      nonce: undefined,
      chainId: chain,
    }
    iteration = 0
    return executeSwap()

    function executeSwap() {
      web3.eth.getTransactionCount(userAddress, 'pending').then((nonce: any) => {
        contract.router.methods.getAmountsOut(amountsOut.toString(), [native, contractAddress]).call({}, async (err: any, amountsOutMin: any) => {
          if (!err) {
            let amountsOut = web3utils.toBN(amountsOutMin[1])
            amountsOut = amountsOut.sub(amountsOut.mul(web3utils.toBN(configs.slippage)).div(web3utils.toBN(100)))
            const swapExactForTokens = exchange === 'KOFFEE' ? contract.router.methods.swapExactKCSForTokens : (exchange === 'TRADER' ? contract.router.methods.swapExactAVAXForTokens : contract.router.methods.swapExactETHForTokens)
            swapExactForTokens(amountsOut.toString(), [native, contractAddress], userAddress, getDeadline()).estimateGas({
              from: userAddress,
              // eslint-disable-next-line unicorn/numeric-separators-style
              gas: 100000000,
              value: txConfig.value,
            }, async (err: any, estimatedGas: any) => {
              if (!err) {
                txConfig.gasLimit = web3.utils.toHex(Math.round(Number.parseInt(estimatedGas) * 3))
                txConfig.data = swapExactForTokens(amountsOut.toString(), [native, contractAddress], userAddress, getDeadline()).encodeABI()
                if (iteration === 0) await sleep(Number.parseFloat(configs.delay_execution) * 1000)
                approveToken(nonce).then(i => {
                  i && (spinner.succeed('Approve() Tx: ' + i), U = process.hrtime(), ++nonce)
                  spinner.stop()
                  console.log('\nExecuting swapExactETHForTokens() # ' + iteration)
                  txConfig.nonce = nonce

                  // eslint-disable-next-line max-nested-callbacks
                  signThenSendPrimaryTxn(txConfig, privateKey).then(async M => {
                    spinner.succeed('Swap Tx: ' + M)
                    ++iteration
                    if (iteration !== Number.parseInt(configs.iteration)) return spinner.start(), await sleep(Number.parseFloat(configs.delay_iteration) * 1000), executeSwap()
                    spinner.stop()
                    const N = process.hrtime(U)
                    // eslint-disable-next-line unicorn/numeric-separators-style
                    console.log('\nSubmitted at: ' + (await getSecondaryBlock()) + ' / Took: ' + (Number((N[0] * 1000000000 + N[1]) / 1000000) / 1000).toFixed(4) + ' seconds')
                    // @ts-expect-error ts-migrate(2794) FIXME: Expected 1 arguments, but got 0. Did you forget to... Remove this comment to see the full error message
                    return resolve()
                  // eslint-disable-next-line max-nested-callbacks
                  }).catch(error => {
                    spinner.stop()
                    fileLogger.error('SWAP: swapExactETHForTokens().signThenSendPrimaryTxn(): ' + error)
                    // eslint-disable-next-line prefer-promise-reject-errors
                    return reject('Something went wrong... Check logs...')
                  })
                }).catch(error => {
                  spinner.stop()
                  fileLogger.error('SWAP: swapExactETHForTokens().approve(): ' + error)
                  // eslint-disable-next-line prefer-promise-reject-errors
                  return reject('Failed to approve the token. This is very likely a honeypot.')
                })
              } else return fileLogger.error('SWAP: swapExactETHForTokens().estimateGas(): ' + err), await sleep(500), executeSwap()
            })
          } else return fileLogger.error('SWAP: getAmountsOut(): ' + err), await sleep(500), executeSwap()
        })
      })
    }

    function approveToken(nonce: any) {
      return new Promise((resolve, reject) => {
        // @ts-expect-error ts-migrate(2794) FIXME: Expected 1 arguments, but got 0. Did you forget to... Remove this comment to see the full error message
        if (iteration !== 0) return resolve()
        const g = new web3.eth.Contract([{
          inputs: [{
            internalType: 'address',
            name: 'spender',
            type: 'address',
          }, {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          }],
          name: 'approve',
          outputs: [{
            internalType: 'bool',
            name: '',
            type: 'bool',
          }],
          stateMutability: 'nonpayable',
          type: 'function',
        }], contractAddress)
        g.methods.approve(contract.router._address, maxUint256()).estimateGas({
          from: userAddress,
          // eslint-disable-next-line unicorn/numeric-separators-style
          gas: 100000000,
          value: 0,
        }, async (err: any, estimatedGas: any) => {
          if (!err) signThenSendPrimaryTxn(chain !== 1 && chain !== 4 ? {
            to: contractAddress,
            value: web3.utils.toHex('0'),
            gasLimit: web3.utils.toHex(Math.round(Number.parseInt(estimatedGas) * 2.5)),
            gasPrice: web3.utils.toHex(configs.gas_price === '0' ? (await getPrimaryGas()).mul(web3utils.toBN(2)) : formatWei(configs.gas_price, 'gwei')),
            data: g.methods.approve(contract.router._address, maxUint256()).encodeABI(),
            nonce: nonce,
            chainId: chain,
          } : {
            to: contractAddress,
            value: web3.utils.toHex('0'),
            gasLimit: web3.utils.toHex(Math.round(Number.parseInt(estimatedGas) * 2.5)),
            maxFeePerGas: web3.utils.toHex(configs.gas_price === '0' ? (await getPrimaryGas()).mul(web3utils.toBN(2)) : formatWei(configs.gas_price, 'gwei')),
            maxPriorityFeePerGas: web3.utils.toHex(formatWei(configs.priority_gas, 'gwei')),
            type: web3.utils.toHex('2'),
            data: g.methods.approve(contract.router._address, maxUint256()).encodeABI(),
            nonce: nonce,
            chainId: chain,
          }, privateKey).then(y => resolve(y)).catch(error => reject(error))
          else return reject(err)
        })
      })
    }
  })
}

export const afterSwapMonitor = (userAddress: any, privateKey: any, contractAddress: any, configs: any, chain: any, exchange: any, menuSelection: any) => {
  return new Promise(async (resolve, reject) => {
    let balance: any
    let decimals: any
    let symbol: any
    const spinner = ora({text: ('Indexing'), spinner: 'aesthetic'}).start()

    const z = process.hrtime()

    const web3Secondary = new secondary.eth.Contract([{
      constant: true,
      inputs: [{
        name: '',
        type: 'address',
      }],
      name: 'balanceOf',
      outputs: [{
        name: '',
        type: 'uint256',
      }],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    }, {
      inputs: [],
      name: 'decimals',
      outputs: [{
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      }],
      stateMutability: 'view',
      type: 'function',
    }, {
      constant: true,
      inputs: [],
      name: 'symbol',
      outputs: [{
        name: '',
        type: 'string',
      }],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    }], contractAddress)

    return await A()

    async function A() {
      balance = web3utils.toBN(await web3Secondary.methods.balanceOf(userAddress).call())
      decimals = await web3Secondary.methods.decimals().call()
      symbol = await web3Secondary.methods.symbol().call()
      return await e()
    }

    // @ts-expect-error ts-migrate(7023) FIXME: 'e' implicitly has return type 'any' because it do... Remove this comment to see the full error message
    async function e() {
      const w = web3utils.toBN('0')
      const C = web3utils.toBN(await web3Secondary.methods.balanceOf(userAddress).call())
      if (C.lte(balance)) return await e()
      let H = false
      let g: any
      let b = false
      let R: any
      let y: any
      let i = w
      let c = true
      let M = false
      const N = process.hrtime(z)
      // eslint-disable-next-line unicorn/numeric-separators-style
      spinner.succeed('Indexed at: ' + (await getSecondaryBlock()) + ' / Took: ' + (Number((N[0] * 1000000000 + N[1]) / 1000000) / 1000).toFixed(4) + ' seconds')

      if (configs.rug_pull_check.toLowerCase() === 'true' && menuSelection !== 341 && menuSelection !== 342) {
        H = true
        printSubHeading('Liquidity Rug Pull Checker')
        const d = 'Listening for `removeLiquidity` transaction in the background.'
        configs.sell_management.toLowerCase() === 'true' ? spinner.info(d) : spinner.start(d)

        g = web3.eth.subscribe('pendingTransactions', async (a: any, K: any) => {
          const S = await web3.eth.getTransaction(K)

          if (S != null && S.to === contract.router._address && S.input !== '0x') {
            const q = abiDecoder.decodeMethod(S.input)
            const F = ['removeLiquidity', 'removeLiquidityETH', 'removeLiquidityKCS', 'removeLiquidityAVAX', 'removeLiquidityETHSupportingFeeOnTransferTokens', 'removeLiquidityKCSSupportingFeeOnTransferTokens', 'removeLiquidityAVAXSupportingFeeOnTransferTokens', 'removeLiquidityETHWithPermit', 'removeLiquidityKCSWithPermit', 'removeLiquidityAVAXWithPermit', 'removeLiquidityETHWithPermitSupportingFeeOnTransferTokens', 'removeLiquidityKCSWithPermitSupportingFeeOnTransferTokens', 'removeLiquidityAVAXWithPermitSupportingFeeOnTransferTokens', 'removeLiquidityWithPermit']
            q && F.includes(q.name) && (q.params[0].value && q.params[0].value.toLowerCase() === contractAddress.toLowerCase() || q.params[1].value && q.params[1].value.toLowerCase() === contractAddress.toLowerCase()) && (configs.sell_management.toLowerCase() === 'true' && (clearInterval(R), spinner.fail('Closed Value: ' + y)), spinner.warn('Detected `removeLiquidity` Tx: ' + S.hash), r('100', web3utils.toBN(S.gasPrice).mul(web3utils.toBN('125')).div(web3utils.toBN('100'))).then(Y => {
              spinner.succeed('Swap Tx: ' + Y + '\n')
              // @ts-expect-error ts-migrate(2794) FIXME: Expected 1 arguments, but got 0. Did you forget to... Remove this comment to see the full error message
              T().then(() => resolve())
            }).catch(error => {
              spinner.stop()
              fileLogger.error('SWAP: swapExactTokensForETHSupportingFeeOnTransferTokens().signThenSendPrimaryTxn(): ' + error)
              T().then(() => reject('Something went wrong... Check logs...'))
            }))
          }
        })
      }

      configs.sell_management.toLowerCase() === 'true' && menuSelection !== 341 && menuSelection !== 342 && (b = true, printSubHeading('Sell Management'), console.log('Press the <Q> key to sell 25% of your bag.'), console.log('Press the <W> key to sell 50% of your bag.'), console.log('Press the <E> key to sell 75% of your bag.'), console.log('Press the <R> key to sell 100% of your bag.\n'), spinner.start('Loading'), R = B())

      function B() {
        return setInterval(async () => {
          let a = web3utils.toBN(await web3Secondary.methods.balanceOf(userAddress).call())

          if (a.gt(w)) {
            i.gt(w) && a.lt(i) && (i = w, c = true)
            const K = await getAmountsOut(a, contractAddress, native)
            let S = await getAmountsOut(K)
            if (chain !== 56 && chain !== 321) S = formatWei(S.toString(), 'szabo')
            switch (decimals) {
            case 18: {
              a = formatEther(a)
              break
            }

            case 15: {
              a = formatEther(a, 'kwei')
              break
            }

            case 12: {
              a = formatEther(a, 'mwei')
              break
            }

            default: {
              if (decimals === 9) a = formatEther(a, 'gwei')
              else if (decimals === 6) a = formatEther(a, 'szabo')
              // @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'BN'.
              else decimals === 3 ? a = formatEther(a, 'finney') : a = a.div(web3utils.toBN('10').pow(web3utils.toBN(decimals))).toString()
            }
            }

            let q = configs.amt_mode.toLowerCase() === 'eth' ? K : S
            // @ts-expect-error ts-migrate(2322) FIXME: Type 'number' is not assignable to type 'BN'.
            q = Number(formatEther(q)) / (Number.parseFloat(configs.amount) * Number.parseInt(configs.iteration))
            // @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'BN'.
            q = q > 1 ? chalk.bgGreen.bold(' ' + Number(q).toFixed(2) + ' ') : (q < 1 ? chalk.bgRed.bold(' ' + Number(q).toFixed(2) + ' ') : Number(q).toFixed(4))
            y = numberWithCommas(Number(a).toFixed(4)) + ' ' + symbol.toUpperCase() + ' (' + numberWithCommas(Number(formatEther(K)).toFixed(4)) + ' ' + symbol + ' / ' + numberWithCommas(Number(formatEther(S)).toFixed(2)) + ' USD) @ ' + q + ' x Multiplier'
            spinner.start('Live Value: ' + y)
          } else {
            c = false
            spinner.start('Loading - ' + numberWithCommas(Number(a).toFixed(4)) + ' ' + symbol.toUpperCase())
          }
        }, 1500)
      }

      (H || b) && (readline.emitKeypressEvents(process.stdin), process.stdin.setRawMode(true), process.stdin.resume(), process.stdin.on('keypress', L))

      async function L(a: any, K: any) {
        if (c && b && K && (K.name === 'q' || K.name === 'w' || K.name === 'e' || K.name === 'r')) {
          const S = K.name === 'q' ? '25' : (K.name === 'w' ? '50' : K.name === 'e' ? '75' : '100')
          clearInterval(R)
          spinner.fail('Closed Value: ' + y)
          console.log('Executing swapExactTokensForETHSupportingFeeOnTransferTokens() with ' + S + '%')
          spinner.start('Pending')
          c = false

          r(S, await getPrimaryGas()).then(q => {
            spinner.succeed('Swap Tx: ' + q + '\n')
            // @ts-expect-error ts-migrate(2794) FIXME: Expected 1 arguments, but got 0. Did you forget to... Remove this comment to see the full error message
            K.name === 'r' ? T().then(() => resolve()) : (spinner.start('Loading'), R = B())
          }).catch(error => {
            spinner.stop()
            fileLogger.error('SWAP: swapExactTokensForETHSupportingFeeOnTransferTokens().signThenSendPrimaryTxn(): ' + error)
            T().then(() => reject('Something went wrong... Check logs...'))
          })
        } else K?.ctrl && K.name === 'c' && T().then(() => {
          if (M) return process.exit()
          // @ts-expect-error ts-migrate(2794) FIXME: Expected 1 arguments, but got 0. Did you forget to... Remove this comment to see the full error message
          return resolve()
        })
      }

      function r(a: any, K: any) {
        return new Promise((S, q) => {
          web3.eth.getTransactionCount(userAddress, 'pending').then(async (nonce: any) => {
            const swapExactForTokens = exchange === 'KOFFEE' ? contract.router.methods.swapExactTokensForKCSSupportingFeeOnTransferTokens : (exchange === 'TRADER' ? contract.router.methods.swapExactTokensForAVAXSupportingFeeOnTransferTokens : contract.router.methods.swapExactTokensForETHSupportingFeeOnTransferTokens)
            i = web3utils.toBN(await web3Secondary.methods.balanceOf(userAddress).call())
            const P = i.mul(web3utils.toBN(a)).div(web3utils.toBN('100')).toString()
            swapExactForTokens(P, '0', [contractAddress, native], userAddress, getDeadline()).estimateGas({
              from: userAddress,
              // eslint-disable-next-line unicorn/numeric-separators-style
              gas: 100000000,
              value: 0,
            }, async (err: any, estimatedGas: any) => {
              if (!err) signThenSendPrimaryTxn(chain !== 1 && chain !== 4 ? {
                to: contract.router._address,
                value: web3.utils.toHex('0'),
                gasLimit: web3.utils.toHex(Math.round(Number.parseInt(estimatedGas) * 2.5)),
                gasPrice: web3.utils.toHex(K),
                data: swapExactForTokens(P, '0', [contractAddress, native], userAddress, getDeadline()).encodeABI(),
                nonce: nonce,
                chainId: chain,
              } : {
                to: contract.router._address,
                value: web3.utils.toHex('0'),
                gasLimit: web3.utils.toHex(Math.round(Number.parseInt(estimatedGas) * 2.5)),
                maxFeePerGas: web3.utils.toHex(K),
                maxPriorityFeePerGas: web3.utils.toHex(formatWei(configs.priority_gas, 'gwei')),
                type: web3.utils.toHex('2'),
                data: swapExactForTokens(P, '0', [contractAddress, native], userAddress, getDeadline()).encodeABI(),
                nonce: nonce,
                chainId: chain,
              }, privateKey).then(o => {
                M = false
                return S(o)
              }).catch(error => q(error))
              else return M = true, fileLogger.error('SWAP: swapExactTokensForETHSupportingFeeOnTransferTokens().estimateGas(): ' + err), await sleep(500), r(a, K)
            })
          })
        })
      }

      function T() {
        return new Promise(a => {
          if (b) clearInterval(R)
          spinner.stop()
          printErrorHeading('Closing Sniper Events')
          H && (g.unsubscribe(), spinner.fail('Unsubscribed to `removeLiquidity` transaction.'))
          b && spinner.fail('Unsubscribed to the sniped token price feed.')
          process.stdin.setRawMode(false)
          process.stdin.removeListener('keypress', L)
          spinner.clear()
          // @ts-expect-error ts-migrate(2794) FIXME: Expected 1 arguments, but got 0. Did you forget to... Remove this comment to see the full error message
          return a()
        })
      }

      // @ts-expect-error ts-migrate(2794) FIXME: Expected 1 arguments, but got 0. Did you forget to... Remove this comment to see the full error message
      if (configs.rug_pull_check.toLowerCase() !== 'true' && configs.sell_management.toLowerCase() !== 'true' || menuSelection === 341 || menuSelection === 342) return resolve()
    }
  })
}

export const predictionBotMethodology = (userAddress: any, privateKey: any, configs: any, menuOption: any, menuSelection: any) => {
  return new Promise(async (s, j) => {
    const contractAddress = menuOption === 50 ? contract.predictionPcsBNB._address : (menuOption === 90 ? contract.predictionCgBTC._address : menuOption === 91 ? contract.predictionCgBNB._address : menuOption === 92 ? contract.predictionCgETH._address : null)
    const rounds = menuOption === 50 ? contract.predictionPcsBNB.methods.rounds : (menuOption === 90 ? contract.predictionCgBTC.methods.Rounds : menuOption === 91 ? contract.predictionCgBNB.methods.Rounds : menuOption === 92 ? contract.predictionCgETH.methods.Rounds : null)
    const betBear = menuOption === 50 ? contract.predictionPcsBNB.methods.betBear : (menuOption === 90 ? contract.predictionCgBTC.methods.user_BetBear : menuOption === 91 ? contract.predictionCgBNB.methods.user_BetBear : menuOption === 92 ? contract.predictionCgETH.methods.user_BetBear : null)
    const betBull = menuOption === 50 ? contract.predictionPcsBNB.methods.betBull : (menuOption === 90 ? contract.predictionCgBTC.methods.user_BetBull : menuOption === 91 ? contract.predictionCgBNB.methods.user_BetBull : menuOption === 92 ? contract.predictionCgETH.methods.user_BetBull : null)
    const claimable = menuOption === 50 ? contract.predictionPcsBNB.methods.claimable : (menuOption === 90 ? contract.predictionCgBTC.methods.claimable : menuOption === 91 ? contract.predictionCgBNB.methods.claimable : menuOption === 92 ? contract.predictionCgETH.methods.claimable : null)
    const refundable = menuOption === 50 ? contract.predictionPcsBNB.methods.refundable : (menuOption === 90 ? contract.predictionCgBTC.methods.refundable : menuOption === 91 ? contract.predictionCgBNB.methods.refundable : menuOption === 92 ? contract.predictionCgETH.methods.refundable : null)
    const ledger = menuOption === 50 ? contract.predictionPcsBNB.methods.ledger : (menuOption === 90 ? contract.predictionCgBTC.methods.Bets : menuOption === 91 ? contract.predictionCgBNB.methods.Bets : menuOption === 92 ? contract.predictionCgETH.methods.Bets : null)
    const claim = menuOption === 50 ? contract.predictionPcsBNB.methods.claim : (menuOption === 90 ? contract.predictionCgBTC.methods.user_Claim : menuOption === 91 ? contract.predictionCgBNB.methods.user_Claim : menuOption === 92 ? contract.predictionCgETH.methods.user_Claim : null)
    if (rounds === null || betBear === null || betBull === null || claimable === null || refundable === null || ledger === null || claim === null) return j('Prediction EOFError')
    const spinner = ora({text: ('Pending Round'), spinner: 'aesthetic'}).start()
    let C: any
    let H: any
    let g: any
    let b: any
    let R: any

    async function y() {
      H = menuOption === 50 ? await contract.predictionPcsBNB.methods.currentEpoch().call() : (menuOption === 90 ? await contract.predictionCgBTC.methods.currentEpoch().call() : menuOption === 91 ? await contract.predictionCgBNB.methods.currentEpoch().call() : menuOption === 92 ? await contract.predictionCgETH.methods.currentEpoch().call() : 0)
      g = Number(H) - 1
      b = await rounds(H).call()
    }

    const i = {
      lastBet: null,
      lastAmt: null,
    }

    function c(T: any, d: any, a = false) {
      (!i.lastBet && !i.lastAmt || a) && (i.lastBet = T, i.lastAmt = d)
    }

    return await M()

    // @ts-expect-error ts-migrate(7023) FIXME: 'M' implicitly has return type 'any' because it do... Remove this comment to see the full error message
    async function M() {
      if (menuOption === 50 ? await contract.predictionPcsBNB.methods.paused().call() : (menuOption === 90 ? await contract.predictionCgBTC.methods.paused().call() : menuOption === 91 ? await contract.predictionCgBNB.methods.paused().call() : menuOption === 92 ? await contract.predictionCgETH.methods.paused().call() : true)) {
        spinner.stop()
        return j('Market Paused')
      }

      await y()
      if (C === H) return await M()
      C = H
      R = N()
    }

    function N() {
      return setInterval(async () => {
        const T = Math.floor(Date.now() / 1000)
        const d = T - Number(b.startTimestamp)
        const a = Number(b.lockTimestamp) - T

        if (d === 288 && a === 12) {
          clearInterval(R)
          let K = true
          let S = false
          let q: any
          // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
          if (configs.amt_mode.toLowerCase() === 'usd') q = await getAmountsOut(formatWei(configs.amount), usd, native)
          else {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
            if (configs.amt_mode.toLowerCase() === 'eth') q = web3utils.toBN(formatWei(configs.amount))
            else {
              fileLogger.error('CORE: predictionBotMethodology(): Native Error')
              throw 'Native Error'
            }
          }

          const txConfig = {
            to: contractAddress,
            value: web3.utils.toHex(q),
            gasLimit: undefined,
            gasPrice: web3.utils.toHex(configs.gas_price === '0' ? (await getPrimaryGas()).mul(web3utils.toBN('2')) : formatWei(configs.gas_price, 'gwei')),
            data: undefined,
            nonce: undefined,
          }
          let Y = await rounds(H).call()
          const P = web3utils.toBN(Y.bullAmount)
          const f = web3utils.toBN(Y.bearAmount)
          const V = P.gt(web3utils.toBN('0')) && f.gt(web3utils.toBN('0')) && P.gt(f) && P.div(f).lt(web3utils.toBN('5')) || P.lt(f) && f.div(P).gt(web3utils.toBN('5'))
          let o = 0
          let Z = 0
          const n: any = []

          for (let I = 1; I <= 2; I++) {
            Y = await rounds(Number(H) - I).call()
            let v = web3utils.toBN(Y.closePrice)
            const W = web3utils.toBN(Y.lockPrice)
            const t = await B()
            if (Number(H) - I === Number(H) - 1) v = t
            if (v.gt(W)) {
              o++
              n.push(' ' + (Number(H) - I) + ' BULL')
            } else
              v.lt(W) && (Z++, n.push(' ' + (Number(H) - I) + ' BEAR'))
          }

          const k = o === 2 ? betBull : (Z === 2 ? betBear : false)
          !k && menuSelection === 591 && (spinner.fail('Skipping Round ' + H + ' / Past Results: {' + n + ' }'), K = false, S = true)

          if (i.lastBet && i.lastAmt) {
            Y = await rounds(Number(H) - 1).call()
            const m = web3utils.toBN(Y.lockPrice)
            const G0 = await B()
            if (i.lastBet === 'BULL' && G0.gt(m) || i.lastBet === 'BEAR' && G0.lt(m)) {
              txConfig.value = web3.utils.toHex(q)
              c(null, null, true)
              spinner.stop()
              console.log(chalk.yellow('Won') + ' Previous Round ' + (Number(H) - 1))
            } else if (G0.eq(m)) {
              spinner.stop()
              console.log(chalk.red('Refunded') + ' Previous Round ' + (Number(H) - 1))
            } else if (menuSelection === 593) {
              // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
              const G1 = i.lastAmt.mul(web3utils.toBN('2'))
              txConfig.value = web3.utils.toHex(G1)
              i.lastAmt = G1
              spinner.stop()
              console.log(chalk.yellow('Martingale Betting') + ' for Round ' + H + ' / Doubling to: ' + numberWithCommas(Number(formatEther(G1)).toFixed(4)) + ' ' + symbol)
            }
          }

          if (K) {
            if (k) await L(H, k, txConfig).then(G2 => {
              spinner.stop()
              console.log(chalk.yellow('Streak') + ' Betting ' + chalk.bold(o === 2 ? 'BULL' : 'BEAR') + ' for Round ' + H + ' / Past Results: {' + n + ' }')
              // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
              spinner.succeed('BSC Credit Tx: ' + G2.credit)
              // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
              spinner.succeed('Betting Tx: ' + G2.prediction)
              c(o === 2 ? 'BULL' : 'BEAR', q)
              // @ts-expect-error ts-migrate(2322) FIXME: Type '"BULL" | "BEAR"' is not assignable to type '... Remove this comment to see the full error message
              i.lastBet = o === 2 ? 'BULL' : 'BEAR'
              S = true
            }).catch(error => {
              spinner.stop()
              return j(error)
            })
            else (menuSelection === 592 || menuSelection === 593) && (V ? await L(H, betBear, txConfig).then(G2 => {
              spinner.stop()
              console.log('Betting ' + chalk.bold('BEAR') + ' for Round ' + H)
              // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
              spinner.succeed('BSC Credit Tx: ' + G2.credit)
              // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
              spinner.succeed('Betting Tx: ' + G2.prediction)
              c('BEAR', q)
              // @ts-expect-error ts-migrate(2322) FIXME: Type '"BEAR"' is not assignable to type 'null'.
              i.lastBet = 'BEAR'
              S = true
            }).catch(error => {
              spinner.stop()
              return j(error)
            }) : await L(H, betBull, txConfig).then(G2 => {
              spinner.stop()
              console.log('Betting ' + chalk.bold('BULL') + ' for Round ' + H)
              // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
              spinner.succeed('BSC Credit Tx: ' + G2.credit)
              // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
              spinner.succeed('Betting Tx: ' + G2.prediction)
              c('BULL', q)
              // @ts-expect-error ts-migrate(2322) FIXME: Type '"BULL"' is not assignable to type 'null'.
              i.lastBet = 'BULL'
              S = true
            }).catch(error => {
              spinner.stop()
              return j(error)
            }))
          }

          const h: any = []

          for (let G2 = 1; G2 <= 10; G2++) {
            const G3 = Number(H) - G2

            const [G4, G5, {
              claimed: G6,
              amount: G7,
            }] = await Promise.all([claimable(G3, userAddress).call(), refundable(G3, userAddress).call(), ledger(G3, userAddress).call()])

            if (G7 > 0 && (G4 || G5) && !G6) h.push(G3)
          }

          h.length > 0 ? web3.eth.getTransactionCount(userAddress, 'pending').then((G8: any) => {
            claim(h).estimateGas({
              from: userAddress,
              // eslint-disable-next-line unicorn/numeric-separators-style
              gas: 100000000,
              value: 0,
            }, (G9: any, GG: any) => {
              !G9 ? (txConfig.value = web3.utils.toHex('0'), txConfig.gasLimit = web3.utils.toHex(Math.round(Number.parseInt(GG) * 2.5)), txConfig.data = claim(h).encodeABI(), txConfig.nonce = G8, signThenSendPrimaryTxn(txConfig, privateKey).then(GD => {
                spinner.succeed('Claim Tx: ' + GD + '\n')
              }).catch(error => {
                fileLogger.error('PREDICTION: Claim().signThenSendPrimaryTxn(): ' + error)
                spinner.stop()
                console.log()
              })) : (fileLogger.error('PREDICTION: Claim().estimateGas(): ' + G9), spinner.stop(), console.log())
            })
          }) : (spinner.stop(), console.log())
          if (S) R = r()
        } else spinner.start('Waiting Round: ' + g + ' / Betting Round: ' + H + ' (Left: ' + (Number(a) - 12) + ')')
      }, 1000)
    }

    async function B() {
      if (menuOption === 50) {
        const {
          answer: T,
        } = await contract.predictionPcsBNB_oracle.methods.latestRoundData().call()
        return web3utils.toBN(T)
      }

      // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
      if (menuOption === 90) return formatWei(await fetchBinancePrice('BTCUSDT')).div(web3utils.toBN('10').pow(web3utils.toBN('10')))
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
      if (menuOption === 91) return formatWei(await fetchBinancePrice('BNBUSDT')).div(web3utils.toBN('10').pow(web3utils.toBN('10')))
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
      if (menuOption === 92) return formatWei(await fetchBinancePrice('ETHUSDT')).div(web3utils.toBN('10').pow(web3utils.toBN('10')))
      return web3utils.toBN('0')
    }

    function L(T: any, d: any, txData: any) {
      return new Promise((K, S) => {
        web3.eth.getTransactionCount(userAddress, 'pending').then((nonce: any) => {
          d(T).estimateGas({
            from: userAddress,
            // eslint-disable-next-line unicorn/numeric-separators-style
            gas: 100000000,
            value: txData.value,
          }, (err: any, estimatedGas: any) => {
            if (!err) {
              txData.gasLimit = web3.utils.toHex(Math.round(Number.parseInt(estimatedGas) * 2.5))
              txData.data = d(T).encodeABI()
              const f = {
                prediction: '',
              }

              txData.nonce = nonce

              signThenSendPrimaryTxn(txData, privateKey).then(V => {
                // @ts-expect-error ts-migrate(2322) FIXME: Type 'unknown' is not assignable to type 'string'.
                f.prediction = V
                return K(f)
              }).catch(error => {
                fileLogger.error('PREDICTION: betMethod().signThenSendPrimaryTxn(): ' + error)
                return S('Something went wrong... Check logs...')
              })
            } else {
              fileLogger.error('PREDICTION: betMethod().estimateGas(): ' + err)
              return S(err)
            }
          })
        })
      })
    }

    function r() {
      return setInterval(async () => {
        if (Number(b.lockTimestamp) - Math.floor(Date.now() / 1000) < -8) {
          clearInterval(R)
          return await M()
        }

        spinner.start('Pending Next Round')
      }, 1000)
    }
  })
}
