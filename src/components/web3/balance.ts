import Web3 from 'web3';

export const readNativeBalance = async (rpcUrl: string, address: string): Promise<string> => {
  const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
  if (!web3.utils.isAddress(address)) throw new Error('Invalid wallet address for balance read');
  const wei = await web3.eth.getBalance(address);
  return wei;
};
