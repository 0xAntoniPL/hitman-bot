import { ROBINHOOD_UNI_V2_ROUTER } from '../constants/robinhood';
import { assertRouterConfigured } from './router-guard';

export const lookupRouterAddress = (chainId: number, exchange: string): string | null => {
  if (chainId === 4663 && exchange === 'RH_UNI') {
    return assertRouterConfigured(ROBINHOOD_UNI_V2_ROUTER);
  }
  return null;
};
