# Hitman Bot

Robinhood Chain-focused fork of `xRose1/defi-cli` by **0xAntoniPL**.

This version narrows the original multi-chain DeFi toolkit to a first working Robinhood Chain program (**Hitman Bot**). It supports manual contract-address swaps through Uniswap V2 on Robinhood Chain, with optional Telegram bot control.

Repository: https://github.com/0xAntoniPL/hitman-bot

![Hitman Bot](assets/hitman-logo.png)

## Network

- Network: Robinhood Chain
- Chain ID: `4663`
- Gas token: `ETH`
- RPC: `https://rpc.mainnet.chain.robinhood.com`
- Explorer: `https://robinhoodchain.blockscout.com`
- WETH: `0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73`
- USDG: `0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168` (`6` decimals)
- UniswapV2Router02: `0x89e5DB8B5aA49aA85AC63f691524311AEB649eba`

Robinhood testnet RPC settings are included for connection work, but the interactive swap flow targets mainnet because the verified Uniswap V2 router above is a mainnet deployment.

## Setup

```shell
npm install
npm run build
```

Configure a wallet:

```shell
./bin/run wallet private_key <PRIVATE_KEY>
```

Start the CLI:

```shell
./bin/run start
```

Then select:

1. `Robinhood Chain`
2. `Uniswap on Robinhood Chain`
3. `Manual Address Swap`
4. `Manual Input Address`

The app stores local config files under `~/Documents/defi-cli-configs`.

## Telegram Bot

The Telegram interface is a separate Bot API process started from the same project.

Create a bot token with BotFather:

1. Open Telegram and message `@BotFather`.
2. Run `/newbot`.
3. Choose a bot name and username.
4. Copy the bot token into `TELEGRAM_BOT_TOKEN`.

Required environment variables:

```shell
TELEGRAM_BOT_TOKEN=123456:telegram-token
RH_BOT_MASTER_KEY=change-this-long-random-secret
```

Optional environment variables:

```shell
RH_ADMIN_IDS=123456789,987654321
ROBINHOOD_RPC_URL=https://rpc.mainnet.chain.robinhood.com
RH_BOT_DB=C:\Users\Alexander Rozenberg\Documents\robinhood-defi-bot\bot.sqlite
```

Start the bot:

```shell
npm run bot
```

The bot stores encrypted per-user private keys in SQLite. The master key is required to decrypt them, so losing `RH_BOT_MASTER_KEY` means losing access to stored bot wallets. Never commit the bot token, master key, database, private keys, or screenshots containing secrets.

Bot menu:

- `Wallet`: import a private key, show wallet status, or remove wallet.
- `Snipe / Buy`: send a token address, preview the quote, and confirm.
- `Sell`: send a token address, choose 25/50/75/100 percent, and confirm.
- `Settings`: amount mode, amount, slippage, iterations, gas, and dry run.
- `History`: recent submitted or dry-run trades.
- `Help`: safety notes and commands.

Dry run is ON by default. In dry-run mode the bot validates, quotes, and estimates gas but does not send a transaction. Turn dry run OFF only after testing with a fresh wallet and tiny balances.

Admin commands:

- `/pause`: pause trading actions for non-admin users.
- `/resume`: resume trading actions.

## Configuration

Use `./bin/run config <key> <value>` for trading settings.

- `amt_mode`: `USD` or `ETH`. Robinhood `USD` mode routes through USDG.
- `amount`: amount to spend per iteration.
- `slippage`: burn/fee tolerance inherited from the upstream CLI.
- `iteration`: number of repeated buys.
- `gas_price`: use `0` for automatic gas price.
- `sell_management`: set `true` to monitor the bought token and enable keyboard-driven sells.

Use `./bin/run nodes <key> <value>` for RPC settings.

- `robinhood.rpc`
- `robinhood.websockets`
- `robinhood_testnet.rpc`
- `robinhood_testnet.websockets`

The default `robinhood.websockets` value is the public HTTP RPC because Robinhood's public websocket feed is a sequencer feed, not a standard Web3 JSON-RPC websocket. Use an Alchemy, QuickNode, or other provider websocket URL if you need pending transaction subscriptions.

## Current Scope

Working now:

- Robinhood Chain network selection
- Robinhood RPC config
- Wallet balance display
- USDG/WETH quote path
- Manual-address ETH-to-token swaps through Uniswap V2
- Optional post-buy sell management
- Public multi-user Telegram bot with encrypted per-user wallets
- Telegram buy/sell confirmations, settings, dry run, history, and admin pause

Deferred:

- Telegram scanner
- CMC/CoinGecko snipers
- Prediction bots
- DxSale/PinkSale presale flows
- Universal Router / Uniswap V3 / Uniswap V4 routing

## Safety

This program sends live mainnet transactions. Start with a fresh wallet and tiny amounts. Never commit private keys, seed phrases, config files, or Telegram credentials.

Router and token addresses were verified from Robinhood and Uniswap ecosystem references during the fork, but Robinhood Chain is new. Reconfirm contract addresses on Blockscout before using real funds.

## Warnings

- Public RPCs may throttle or omit pending-tx subscriptions — use a private provider for production.
- Full DEX routing (V3/V4/Universal Router) is unsupported; only Uniswap V2 `RH_UNI` manual swaps are wired.
