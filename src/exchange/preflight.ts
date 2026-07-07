export type PreflightInput = {
  userAddress?: string;
  amount?: string | number;
  contractAddress?: string;
  chainId?: number;
};

export const validateSwapPreflight = (input: PreflightInput): string[] => {
  const errors: string[] = [];
  if (!input.userAddress) errors.push('Missing wallet address');
  if (input.amount === undefined || input.amount === null || input.amount === '') errors.push('Missing amount');
  if (!input.contractAddress) errors.push('Missing token contract address');
  if (input.chainId === 4663 && !input.contractAddress?.startsWith('0x')) {
    errors.push('Token address must be a 0x-prefixed hex string on Robinhood Chain');
  }
  return errors;
};
