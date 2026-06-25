import {
  ROBINHOOD_MAINNET_CHAIN_ID,
  ROBINHOOD_TESTNET_CHAIN_ID,
} from './robinhood';

/** Supported EVM chain ids used by the CLI (scaffolding). */
export enum SupportedChain {
  Ethereum = 1,
  Rinkeby = 4,
  BSC = 56,
  Polygon = 137,
  Fantom = 250,
  KCC = 321,
  Avalanche = 43114,
  Robinhood = ROBINHOOD_MAINNET_CHAIN_ID,
  RobinhoodTestnet = ROBINHOOD_TESTNET_CHAIN_ID,
}

export const isRobinhoodChain = (chainId: number): boolean =>
  chainId === SupportedChain.Robinhood || chainId === SupportedChain.RobinhoodTestnet;
