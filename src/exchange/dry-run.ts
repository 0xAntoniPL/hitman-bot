export type DryRunResult = {
  dryRun: boolean;
  wouldSubmit: boolean;
  notes: string[];
};

export const buildRobinhoodDryRun = (enabled: boolean): DryRunResult => {
  if (!enabled) {
    return { dryRun: false, wouldSubmit: true, notes: ['Dry run disabled — live submission path'] };
  }
  return {
    dryRun: true,
    wouldSubmit: false,
    notes: [
      'Dry run enabled for Robinhood Chain',
      'Quotes and gas estimates may still hit RPC',
      'No signed transaction will be broadcast',
    ],
  };
};
