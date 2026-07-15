@echo off
setlocal
cd /d "%~dp0"

echo.
echo Starting Hitman Bot local setup...
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-hitman-bot.ps1"

echo.
echo Hitman Bot window closed.
pause
