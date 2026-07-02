import Web3 from 'web3';

export const checkProviderHealth = async (rpcUrl: string): Promise<{ ok: boolean; blockNumber?: number; error?: string }> => {
  try {
    const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
    const blockNumber = await web3.eth.getBlockNumber();
    return { ok: true, blockNumber };
  } catch (error: any) {
    return { ok: false, error: String(error?.message || error) };
  }
};
