import { RH_UNI_ROUTER_PLACEHOLDER } from '../constants/robinhood';

export const assertRouterConfigured = (routerAddress?: string): string => {
  const addr = String(routerAddress || RH_UNI_ROUTER_PLACEHOLDER || '').trim();
  if (!addr || addr === '0x0000000000000000000000000000000000000000') {
    throw new Error('Swap aborted: Robinhood router address is not configured');
  }
  return addr;
};
