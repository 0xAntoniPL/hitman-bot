import BN from 'bn.js'
import Web3 from 'web3'
import {AbiItem} from 'web3-utils'
import {UserSettings} from '../bot/types'

import uniswapRouterAbi = require('../exchange/abi/router.json');

export const ROBINHOOD_CHAIN_ID = 4663
export const ROBINHOOD_RPC_URL = process.env.ROBINHOOD_RPC_URL || 'https://rpc.mainnet.chain.robinhood.com'
export const ROBINHOOD_EXPLORER_URL = 'https://robinhoodchain.blockscout.com'
export const ROBINHOOD_ROUTER_ADDRESS = '0x89e5DB8B5aA49aA85AC63f691524311AEB649eba'
export const ROBINHOOD_WETH_ADDRESS = '0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73'
export const ROBINHOOD_USDG_ADDRESS = '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168'

const ERC20_ABI: AbiItem[] = [{
  constant: true,
  inputs: [{name: '', type: 'address'}],
  name: 'balanceOf',
  outputs: [{name: '', type: 'uint256'}],
  payable: false,
  stateMutability: 'view',
  type: 'function',
}, {
  constant: true,
  inputs: [],
  name: 'decimals',
  outputs: [{name: '', type: 'uint8'}],
  payable: false,
  stateMutability: 'view',
  type: 'function',
}, {
  constant: true,
  inputs: [],
  name: 'symbol',
  outputs: [{name: '', type: 'string'}],
  payable: false,
  stateMutability: 'view',
  type: 'function',
}, {
  constant: false,
  inputs: [{
    name: 'spender',
    type: 'address',
  }, {
    name: 'amount',
    type: 'uint256',
  }],
  name: 'approve',
  outputs: [{name: '', type: 'bool'}],
  payable: false,
  stateMutability: 'nonpayable',
  type: 'function',
}]

export interface TokenInfo {
  address: string;
  symbol: string;
  decimals: number;
}

export interface WalletStatus {
  address: string;
  ethBalance: string;
  usdValue: string;
}

export interface BuyQuote {
  token: TokenInfo;
  amountMode: UserSettings['amountMode'];
  spendAmount: string;
  spendWei: string;
  expectedTokens: string;
  minimumTokens: string;
  gasEstimate: number;
}

export interface SellQuote {
  token: TokenInfo;
  tokenBalance: string;
  sellPercent: number;
  sellAmount: string;
  sellUnits: string;
  expectedEth: string;
  gasEstimate: number;
}

export interface TradeExecutionResult {
  dryRun: boolean;
  txHashes: string[];
  quote: BuyQuote | SellQuote;
}

export class RobinhoodTradingService {
  private web3: Web3
  private router: any

  constructor(rpcUrl = ROBINHOOD_RPC_URL) {
    this.web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl, {keepAlive: true}))
    this.router = new this.web3.eth.Contract(uniswapRouterAbi as AbiItem[], ROBINHOOD_ROUTER_ADDRESS)
  }

  async assertNetwork() {
    const chainId = await this.web3.eth.getChainId()
    if (chainId !== ROBINHOOD_CHAIN_ID) throw new Error(`Expected Robinhood Chain ${ROBINHOOD_CHAIN_ID}, got ${chainId}`)
  }

  getAddress(privateKey: string) {
    return this.web3.eth.accounts.privateKeyToAccount(privateKey).address
  }

  async getWalletStatus(address: string): Promise<WalletStatus> {
    const balance = this.web3.utils.toBN(await this.web3.eth.getBalance(address))
    let usdValue = '0'
    try {
      const usdOut = await this.getAmountsOut(balance, [ROBINHOOD_WETH_ADDRESS, ROBINHOOD_USDG_ADDRESS])
      usdValue = formatUnits(usdOut, 6)
    } catch {
      usdValue = '0'
    }

    return {
      address,
      ethBalance: formatUnits(balance, 18),
      usdValue,
    }
  }

  async getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
    if (!this.web3.utils.isAddress(tokenAddress)) throw new Error('Invalid token address')
    const code = await this.web3.eth.getCode(tokenAddress)
    if (code === '0x') throw new Error('Token address is not a contract on Robinhood Chain')

    const token = new this.web3.eth.Contract(ERC20_ABI, tokenAddress)
    const [symbol, decimals] = await Promise.all([
      token.methods.symbol().call(),
      token.methods.decimals().call(),
    ])

    return {
      address: this.web3.utils.toChecksumAddress(tokenAddress),
      symbol,
      decimals: Number(decimals),
    }
  }

  async quoteBuy(userAddress: string, tokenAddress: string, settings: UserSettings): Promise<BuyQuote> {
    const token = await this.getTokenInfo(tokenAddress)
    const spendWei = await this.getNativeSpendWei(settings)
    const path = [ROBINHOOD_WETH_ADDRESS, token.address]
    const expectedOut = await this.getAmountsOut(spendWei, path)
    const minimumOut = applySlippage(expectedOut, settings.slippage)
    const data = this.router.methods.swapExactETHForTokens(
      minimumOut.toString(),
      path,
      userAddress,
      deadline(),
    ).encodeABI()
    const gasEstimate = await this.estimateGas({
      from: userAddress,
      to: ROBINHOOD_ROUTER_ADDRESS,
      value: this.web3.utils.toHex(spendWei),
      data,
    })

    return {
      token,
      amountMode: settings.amountMode,
      spendAmount: settings.amount,
      spendWei: spendWei.toString(),
      expectedTokens: formatUnits(expectedOut, token.decimals),
      minimumTokens: formatUnits(minimumOut, token.decimals),
      gasEstimate,
    }
  }

  async buyToken(privateKey: string, tokenAddress: string, settings: UserSettings): Promise<TradeExecutionResult> {
    const account = this.web3.eth.accounts.privateKeyToAccount(privateKey)
    const quote = await this.quoteBuy(account.address, tokenAddress, settings)
    if (settings.dryRun) return {dryRun: true, txHashes: [], quote}

    const txHashes: string[] = []
    for (let i = 0; i < settings.iterations; i++) {
      const spendWei = this.web3.utils.toBN(quote.spendWei)
      const data = this.router.methods.swapExactETHForTokens(
        parseUnits(quote.minimumTokens, quote.token.decimals).toString(),
        [ROBINHOOD_WETH_ADDRESS, quote.token.address],
        account.address,
        deadline(),
      ).encodeABI()

      txHashes.push(await this.signAndSend(privateKey, {
        from: account.address,
        to: ROBINHOOD_ROUTER_ADDRESS,
        value: this.web3.utils.toHex(spendWei),
        gas: quote.gasEstimate,
        gasPrice: await this.resolveGasPrice(settings),
        data,
        chainId: ROBINHOOD_CHAIN_ID,
      }))
    }

    return {dryRun: false, txHashes, quote}
  }

  async quoteSell(userAddress: string, tokenAddress: string, sellPercent: number): Promise<SellQuote> {
    const token = await this.getTokenInfo(tokenAddress)
    const tokenContract = new this.web3.eth.Contract(ERC20_ABI, token.address)
    const balance = this.web3.utils.toBN(await tokenContract.methods.balanceOf(userAddress).call())
    if (balance.isZero()) throw new Error(`No ${token.symbol} balance found`)
    const sellUnits = balance.mul(new BN(String(sellPercent))).div(new BN('100'))
    const expectedEth = await this.getAmountsOut(sellUnits, [token.address, ROBINHOOD_WETH_ADDRESS])
    const data = this.router.methods.swapExactTokensForETHSupportingFeeOnTransferTokens(
      sellUnits.toString(),
      '0',
      [token.address, ROBINHOOD_WETH_ADDRESS],
      userAddress,
      deadline(),
    ).encodeABI()
    const gasEstimate = await this.estimateGas({
      from: userAddress,
      to: ROBINHOOD_ROUTER_ADDRESS,
      value: '0x0',
      data,
    })

    return {
      token,
      tokenBalance: formatUnits(balance, token.decimals),
      sellPercent,
      sellAmount: formatUnits(sellUnits, token.decimals),
      sellUnits: sellUnits.toString(),
      expectedEth: formatUnits(expectedEth, 18),
      gasEstimate,
    }
  }

  async sellToken(privateKey: string, tokenAddress: string, sellPercent: number, settings: UserSettings): Promise<TradeExecutionResult> {
    const account = this.web3.eth.accounts.privateKeyToAccount(privateKey)
    const quote = await this.quoteSell(account.address, tokenAddress, sellPercent)
    if (settings.dryRun) return {dryRun: true, txHashes: [], quote}

    const tokenContract = new this.web3.eth.Contract(ERC20_ABI, quote.token.address)
    const gasPrice = await this.resolveGasPrice(settings)
    const approveData = tokenContract.methods.approve(ROBINHOOD_ROUTER_ADDRESS, quote.sellUnits).encodeABI()
    const approveGas = await this.estimateGas({
      from: account.address,
      to: quote.token.address,
      value: '0x0',
      data: approveData,
    })
    const approveHash = await this.signAndSend(privateKey, {
      from: account.address,
      to: quote.token.address,
      value: '0x0',
      gas: approveGas,
      gasPrice,
      data: approveData,
      chainId: ROBINHOOD_CHAIN_ID,
    })

    const sellData = this.router.methods.swapExactTokensForETHSupportingFeeOnTransferTokens(
      quote.sellUnits,
      '0',
      [quote.token.address, ROBINHOOD_WETH_ADDRESS],
      account.address,
      deadline(),
    ).encodeABI()
    const sellHash = await this.signAndSend(privateKey, {
      from: account.address,
      to: ROBINHOOD_ROUTER_ADDRESS,
      value: '0x0',
      gas: quote.gasEstimate,
      gasPrice,
      data: sellData,
      chainId: ROBINHOOD_CHAIN_ID,
    })

    return {dryRun: false, txHashes: [approveHash, sellHash], quote}
  }

  private async getNativeSpendWei(settings: UserSettings): Promise<BN> {
    if (settings.amountMode === 'ETH') return parseUnits(settings.amount, 18)
    const usdAmount = parseUnits(settings.amount, 6)
    return this.getAmountsOut(usdAmount, [ROBINHOOD_USDG_ADDRESS, ROBINHOOD_WETH_ADDRESS])
  }

  private async getAmountsOut(amountIn: BN, path: string[]): Promise<BN> {
    const result = await this.router.methods.getAmountsOut(amountIn.toString(), path).call()
    return this.web3.utils.toBN(result[result.length - 1])
  }

  private async estimateGas(tx: Record<string, unknown>) {
    const estimated = await this.web3.eth.estimateGas(tx)
    return Math.ceil(Number(estimated) * 1.25)
  }

  private async resolveGasPrice(settings: UserSettings) {
    if (settings.gasPriceGwei !== '0') return this.web3.utils.toHex(parseUnits(settings.gasPriceGwei, 9))
    const gasPrice = this.web3.utils.toBN(await this.web3.eth.getGasPrice())
    return this.web3.utils.toHex(gasPrice.mul(new BN('125')).div(new BN('100')))
  }

  private async signAndSend(privateKey: string, tx: Record<string, unknown>): Promise<string> {
    const signed = await this.web3.eth.accounts.signTransaction(tx, privateKey)
    if (!signed.rawTransaction) throw new Error('Failed to sign transaction')

    return new Promise((resolve, reject) => {
      this.web3.eth.sendSignedTransaction(signed.rawTransaction as string)
      .once('transactionHash', hash => resolve(hash))
      .once('error', error => reject(error))
    })
  }
}

export const blockscoutTxUrl = (txHash: string) => `${ROBINHOOD_EXPLORER_URL}/tx/${txHash}`

export const parseUnits = (value: string, decimals: number) => {
  const trimmed = value.trim()
  if (!/^\d+(\.\d+)?$/.test(trimmed)) throw new Error('Invalid numeric amount')
  const [whole, fraction = ''] = trimmed.split('.')
  if (fraction.length > decimals) throw new Error(`Amount supports up to ${decimals} decimals`)
  const paddedFraction = fraction.padEnd(decimals, '0')
  return new BN(`${whole}${paddedFraction}`.replace(/^0+(?=\d)/, '') || '0')
}

export const formatUnits = (value: BN, decimals: number) => {
  const raw = value.toString().padStart(decimals + 1, '0')
  const whole = raw.slice(0, -decimals) || '0'
  const fraction = decimals === 0 ? '' : raw.slice(-decimals).replace(/0+$/, '')
  return fraction ? `${whole}.${fraction}` : whole
}

const applySlippage = (amount: BN, slippage: string) => {
  const slippagePercent = new BN(slippage)
  return amount.sub(amount.mul(slippagePercent).div(new BN('100')))
}

const deadline = () => Math.round((Date.now() + 600000) / 1000)
