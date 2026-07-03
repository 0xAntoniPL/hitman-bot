# Robinhood Chain research notes

## Mainnet
- Chain ID: 4663
- Native gas token: ETH
- Public RPC: https://rpc.mainnet.chain.robinhood.com
- Explorer: https://robinhoodchain.blockscout.com

## Testnet
- Chain ID: 46630
- Public RPC: https://rpc.testnet.chain.robinhood.com

## Contracts (mainnet, verify on explorer before use)
- WETH: 0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73
- USDG: 0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168 (6 decimals)
- UniswapV2Router02: 0x89e5DB8B5aA49aA85AC63f691524311AEB649eba

## Caveats
- Public HTTP RPCs may rate-limit; prefer a dedicated provider for production
- Public websocket feeds may not expose standard pending-tx JSON-RPC subscriptions

## Constant modules
- `src/constants/robinhood.ts` — network + token addresses
- `src/constants/chains.ts` — shared enum helpers
