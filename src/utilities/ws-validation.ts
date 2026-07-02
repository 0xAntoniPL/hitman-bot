export const assertWebsocketEndpoint = (url: string): void => {
  const v = String(url || '').trim().toLowerCase();
  if (!(v.startsWith('ws://') || v.startsWith('wss://') || v.startsWith('http://') || v.startsWith('https://'))) {
    throw new Error('Endpoint must be ws(s) or http(s)');
  }
};

export const isJsonRpcWebsocket = (url: string): boolean => {
  const v = String(url || '').trim().toLowerCase();
  return v.startsWith('ws://') || v.startsWith('wss://');
};
