# Public Hitman Bot Setup

Use this when you want people to open one link and use the program without your laptop running:

```text
https://t.me/HitmanRobinhoodBot
```

## 1. BotFather Setup

Open `https://t.me/BotFather`.

Set the bot profile:

1. `/mybots`
2. Choose `HitmanRobinhoodBot`
3. `Edit Bot`
4. `Edit Name`: `HitmanBot`
5. `Edit Description`:

```text
Private Robinhood Chain trading interface. Import an encrypted wallet, preview trades, and confirm buys or sells.
```

6. `Edit About`:

```text
Hitman Robinhood Chain trading bot.
```

7. `Edit Botpic`: upload the Hitman logo image.

Telegram profile photos are controlled by BotFather, not by this codebase.

## 2. Host It Once

The Telegram link only works while the bot process is running. For public use, run it on an always-on host.

Recommended simplest path: Railway.

1. Push this project to a private GitHub repository.
2. Open Railway.
3. Create a new project from that GitHub repository.
4. Railway will use `railway.json`.
5. Add the environment variables below.
6. Deploy.
7. Send people `https://t.me/HitmanRobinhoodBot`.

Render is also supported through `render.yaml`. Use it as a background worker, not a static site.

## 3. Environment Variables

Set these on the host:

```shell
TELEGRAM_BOT_TOKEN=<new BotFather token>
RH_BOT_MASTER_KEY=<long random secret, keep it stable>
ROBINHOOD_RPC_URL=https://rpc.mainnet.chain.robinhood.com
RH_BOT_DB=./data/hitman-bot.sqlite
```

Optional health endpoint for platforms that expect an HTTP port:

```shell
HITMAN_HEALTH_PORT=3000
```

When enabled, the health URL is `/health`. Users still interact only through Telegram.

Optional:

```shell
RH_ADMIN_IDS=<your Telegram numeric ID>
```

Never commit the real `.env`, bot token, database, or private keys.

## 4. Start Command

Build command:

```shell
npm install && npm run build
```

Start command:

```shell
npm start
```

The single public link is:

```text
https://t.me/HitmanRobinhoodBot
```

## 5. Safety Before Sharing

Keep dry run ON by default. Test with a fresh wallet and tiny balances first.

If a token was pasted into chat or logs, revoke it in BotFather and create a new one before going public.

## 6. What Users Do

Users do not need this repo, terminal commands, or a wallet file.

They only need:

1. Open `https://t.me/HitmanRobinhoodBot`.
2. Press `Start`.
3. Import their own fresh trading wallet.
4. Keep dry run ON while testing.
5. Confirm buys or sells from the bot buttons.
