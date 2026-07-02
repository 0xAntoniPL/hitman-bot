import { nodeConfig } from '../../config';
import { checkProviderHealth } from './health';

/** Prefer configured provider; fall back to alternate robinhood RPC key when public endpoint fails. */
export const resolveRobinhoodHttpProvider = async (): Promise<string> => {
  const primary = String(nodeConfig.get('robinhood.rpc') || '');
  const secondary = String(nodeConfig.get('robinhood.websockets') || '');
  const health = await checkProviderHealth(primary);
  if (health.ok) return primary;
  if (secondary && secondary !== primary) {
    const alt = await checkProviderHealth(secondary);
    if (alt.ok) return secondary;
  }
  throw new Error('Configured Robinhood providers are unavailable');
};
