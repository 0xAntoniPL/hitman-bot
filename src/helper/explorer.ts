import { ROBINHOOD_EXPLORER, ROBINHOOD_MAINNET_CHAIN_ID } from '../constants/robinhood';

export const getExplorerTxUrl = (chainId: number, txHash: string): string | null => {
  if (chainId === ROBINHOOD_MAINNET_CHAIN_ID) {
    return `${ROBINHOOD_EXPLORER}/tx/${txHash}`;
  }
  return null;
};

export const getExplorerAddressUrl = (chainId: number, address: string): string | null => {
  if (chainId === ROBINHOOD_MAINNET_CHAIN_ID) {
    return `${ROBINHOOD_EXPLORER}/address/${address}`;
  }
  return null;
};
