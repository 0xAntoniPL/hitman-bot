const Web3 = require('web3')

const RPC_URL = process.env.ROBINHOOD_RPC_URL || 'https://rpc.mainnet.chain.robinhood.com'
const EXPECTED_CHAIN_ID = 4663

const ERC20_ABI = [
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{name: '', type: 'string'}],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{name: '', type: 'uint8'}],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
]

const TOKENS = {
  WETH: '0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73',
  USDG: '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168',
}

async function main() {
  const web3 = new Web3(new Web3.providers.HttpProvider(RPC_URL, {keepAlive: true}))
  const chainId = await web3.eth.getChainId()
  if (chainId !== EXPECTED_CHAIN_ID) throw new Error(`Expected chain ${EXPECTED_CHAIN_ID}, received ${chainId}`)

  const blockNumber = await web3.eth.getBlockNumber()
  console.log(`Robinhood Chain ID: ${chainId}`)
  console.log(`Latest block: ${blockNumber}`)

  for (const [name, address] of Object.entries(TOKENS)) {
    const token = new web3.eth.Contract(ERC20_ABI, address)
    const [symbol, decimals] = await Promise.all([
      token.methods.symbol().call(),
      token.methods.decimals().call(),
    ])
    console.log(`${name}: ${symbol} (${decimals} decimals)`)
  }
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
