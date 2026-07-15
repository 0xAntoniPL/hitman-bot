# Hitman Bot Local Quickstart

This version is for users who want to run their own private Telegram bot locally.

The user downloads the project, double-clicks one file, follows the Telegram prompts, and then uses their own Telegram bot link.

## What You Need

1. A Windows computer.
2. Telegram installed or open in your browser.
3. Node.js LTS installed from `https://nodejs.org`.

## One-Click Start

Double-click:

```text
START-HITMAN-BOT.bat
```

The launcher will:

1. Check that Node.js and npm are installed.
2. Ask for your Telegram bot token if it is not already saved.
3. Save local settings in `.env`.
4. Install dependencies if needed.
5. Build the bot.
6. Start the bot.

Keep the launcher window open while using the bot.

## Telegram Setup

If you do not already have a bot token:

1. Open Telegram.
2. Message `@BotFather`.
3. Send `/newbot`.
4. Pick a bot name.
5. Pick a bot username ending in `bot`.
6. Copy the API token BotFather gives you.
7. Paste that token into the launcher window.

Your bot link will be:

```text
https://t.me/YOUR_BOT_USERNAME
```

Open that link in Telegram and press `Start`.

## What Users Actually Do

After setup, the flow is:

1. Double-click `START-HITMAN-BOT.bat`.
2. Keep the black terminal window open.
3. Open your Telegram bot link.
4. Press `Start`.
5. Use the Telegram buttons.

## Important Safety Notes

- Dry run is ON by default.
- Use a fresh wallet, not your main wallet.
- Never share your `.env` file.
- Never commit your real Telegram token, private keys, or SQLite database.
- If your bot token is leaked, revoke it in BotFather and run the launcher again with the new token.

## Stopping The Bot

Close the launcher window or press `Ctrl+C`.

The Telegram chat will still exist, but the bot only responds while the local program is running.
