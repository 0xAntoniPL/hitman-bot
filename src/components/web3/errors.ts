export const unsupportedChainMessage = (chain: unknown): string =>
  `Unsupported chain ${String(chain)}. Configure a supported network (including Robinhood Chain 4663) or update node endpoints.`;

export const missingRobinhoodRpcMessage = (): string =>
  'Robinhood Chain RPC is not configured. Set robinhood.rpc via the nodes command.';
