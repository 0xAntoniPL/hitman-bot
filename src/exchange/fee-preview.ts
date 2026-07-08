export type FeePreview = {
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  estimatedCostEth?: string;
};

/** Normalize L2 fee fields for transaction preview output. */
export const normalizeL2FeeFields = (raw: FeePreview): FeePreview => {
  return {
    gasPrice: raw.gasPrice || '0',
    maxFeePerGas: raw.maxFeePerGas || raw.gasPrice || '0',
    maxPriorityFeePerGas: raw.maxPriorityFeePerGas || '0',
    estimatedCostEth: raw.estimatedCostEth || 'unknown',
  };
};
