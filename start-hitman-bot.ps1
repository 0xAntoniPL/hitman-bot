$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

function Read-EnvFile {
  param([string]$Path)

  $values = @{}
  if (-not (Test-Path $Path)) {
    return $values
  }

  Get-Content $Path | ForEach-Object {
    $line = $_.Trim()
    if ($line.Length -eq 0 -or $line.StartsWith("#") -or -not $line.Contains("=")) {
      return
    }

    $parts = $line.Split("=", 2)
    $values[$parts[0].Trim()] = $parts[1].Trim()
  }

  return $values
}

function Save-EnvFile {
  param(
    [string]$Path,
    [hashtable]$Values
  )

  $lines = @(
    "# Local Hitman Bot config. Do not share this file.",
    "TELEGRAM_BOT_TOKEN=$($Values.TELEGRAM_BOT_TOKEN)",
    "RH_BOT_MASTER_KEY=$($Values.RH_BOT_MASTER_KEY)",
    "ROBINHOOD_RPC_URL=$($Values.ROBINHOOD_RPC_URL)",
    "RH_BOT_DB=$($Values.RH_BOT_DB)"
  )

  if (-not [string]::IsNullOrWhiteSpace($Values.RH_ADMIN_IDS)) {
    $lines += "RH_ADMIN_IDS=$($Values.RH_ADMIN_IDS)"
  }

  Set-Content -Path $Path -Value $lines -Encoding UTF8
}

function New-MasterKey {
  $bytes = New-Object byte[] 32
  [System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
  return [Convert]::ToBase64String($bytes)
}

Write-Host ""
Write-Host "========================================"
Write-Host " Hitman Bot - Local Telegram Setup"
Write-Host "========================================"
Write-Host ""
Write-Host "This runs your own Telegram bot locally."
Write-Host "Users open your bot link, and this window keeps the bot online."
Write-Host ""

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js is required."
  Write-Host "Install Node.js LTS from https://nodejs.org, then run START-HITMAN-BOT.bat again."
  Read-Host "Press Enter to exit"
  exit 1
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Host "npm is required and should install with Node.js LTS."
  Read-Host "Press Enter to exit"
  exit 1
}

$envPath = Join-Path $PSScriptRoot ".env"
$values = Read-EnvFile $envPath

if ([string]::IsNullOrWhiteSpace($values.TELEGRAM_BOT_TOKEN)) {
  Write-Host "Telegram setup:"
  Write-Host "1. Open Telegram."
  Write-Host "2. Message @BotFather."
  Write-Host "3. Send /newbot."
  Write-Host "4. Pick a bot name and a username ending in bot."
  Write-Host "5. Copy the API token BotFather gives you."
  Write-Host ""
  Write-Host "Your bot link will be: https://t.me/YOUR_BOT_USERNAME"
  Write-Host ""

  $token = Read-Host "Paste the BotFather API token"
  if ([string]::IsNullOrWhiteSpace($token)) {
    throw "Telegram bot token is required."
  }

  $values.TELEGRAM_BOT_TOKEN = $token.Trim()
}

if ([string]::IsNullOrWhiteSpace($values.RH_BOT_MASTER_KEY)) {
  $values.RH_BOT_MASTER_KEY = New-MasterKey
}

if ([string]::IsNullOrWhiteSpace($values.ROBINHOOD_RPC_URL)) {
  $values.ROBINHOOD_RPC_URL = "https://rpc.mainnet.chain.robinhood.com"
}

if ([string]::IsNullOrWhiteSpace($values.RH_BOT_DB)) {
  $values.RH_BOT_DB = ".\data\hitman-bot.sqlite"
}

Save-EnvFile $envPath $values

$env:TELEGRAM_BOT_TOKEN = $values.TELEGRAM_BOT_TOKEN
$env:RH_BOT_MASTER_KEY = $values.RH_BOT_MASTER_KEY
$env:ROBINHOOD_RPC_URL = $values.ROBINHOOD_RPC_URL
$env:RH_BOT_DB = $values.RH_BOT_DB
if (-not [string]::IsNullOrWhiteSpace($values.RH_ADMIN_IDS)) {
  $env:RH_ADMIN_IDS = $values.RH_ADMIN_IDS
}

Write-Host ""
Write-Host "Installing dependencies if needed..."
if (-not (Test-Path (Join-Path $PSScriptRoot "node_modules"))) {
  npm install
}

Write-Host ""
Write-Host "Building Hitman bot..."
npm run build

Write-Host ""
Write-Host "Starting Hitman bot. Keep this window open."
Write-Host "Open your Telegram bot link and press Start."
Write-Host ""
npm run bot
