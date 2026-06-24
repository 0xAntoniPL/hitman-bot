const ROBINHOOD_KEYS = new Set([
  'robinhood.rpc',
  'robinhood.websockets',
  'robinhood_testnet.rpc',
  'robinhood_testnet.websockets',
]);

export const isRobinhoodNodeKey = (key: string): boolean => ROBINHOOD_KEYS.has(key);

export const assertRobinhoodUrl = (value: string): void => {
  const v = String(value || '').trim();
  if (!v) throw new Error('Robinhood node URL cannot be empty');
  if (!(v.startsWith('http://') || v.startsWith('https://') || v.startsWith('ws://') || v.startsWith('wss://'))) {
    throw new Error('Robinhood node URL must start with http(s) or ws(s)');
  }
};
