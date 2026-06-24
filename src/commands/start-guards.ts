import { nodeConfig } from '../config';
import { ROBINHOOD_MAINNET_CHAIN_ID } from '../constants/robinhood';
import { missingRobinhoodRpcMessage } from '../components/web3/errors';

export const assertChainAvailable = (chainId: number): void => {
  if (chainId !== ROBINHOOD_MAINNET_CHAIN_ID) return;
  const rpc = String(nodeConfig.get('robinhood.rpc') || '');
  if (!rpc) throw new Error(missingRobinhoodRpcMessage());
};
