export type AmountMode = 'USD' | 'ETH'
export type TradeAction = 'BUY' | 'SELL'
export type TradeStatus = 'DRY_RUN' | 'SUBMITTED' | 'FAILED'

export interface BotUserProfile {
  telegramId: number;
  username: string;
  firstName: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  amountMode: AmountMode;
  amount: string;
  slippage: string;
  iterations: number;
  gasPriceGwei: string;
  dryRun: boolean;
}

export interface StoredWallet {
  telegramId: number;
  address: string;
  encryptedPrivateKey: string;
  iv: string;
  authTag: string;
  createdAt: string;
  updatedAt: string;
}

export interface PendingAction {
  telegramId: number;
  action: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface TradeHistoryEntry {
  id: number;
  telegramId: number;
  action: TradeAction;
  tokenAddress: string;
  tokenSymbol: string;
  amountMode: AmountMode;
  amount: string;
  txHash: string;
  status: TradeStatus;
  error: string;
  createdAt: string;
}

export interface CreateTradeHistoryInput {
  telegramId: number;
  action: TradeAction;
  tokenAddress: string;
  tokenSymbol: string;
  amountMode: AmountMode;
  amount: string;
  txHash?: string;
  status: TradeStatus;
  error?: string;
}

export interface UserIdentityInput {
  telegramId: number;
  username?: string;
  firstName?: string;
}

export const defaultUserSettings = (): UserSettings => ({
  amountMode: 'USD',
  amount: '10',
  slippage: '100',
  iterations: 1,
  gasPriceGwei: '0',
  dryRun: true,
})
