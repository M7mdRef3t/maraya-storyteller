@echo off
setlocal

set "ROOT=%~dp0"
set "SERVER_DIR=%ROOT%server"
set "CLIENT_DIR=%ROOT%client"

if not exist "%SERVER_DIR%\index.js" (
  echo [maraya] Server entry not found: "%SERVER_DIR%\index.js"
  exit /b 1
)

if not exist "%CLIENT_DIR%\package.json" (
  echo [maraya] Client package not found: "%CLIENT_DIR%\package.json"
  exit /b 1
)

echo [maraya] Starting backend on http://127.0.0.1:3111
start "Maraya Backend" cmd /k "cd /d \"%SERVER_DIR%\" && set PORT=3111 && node index.js"

echo [maraya] Starting frontend on http://127.0.0.1:5180
start "Maraya Frontend" cmd /k "cd /d \"%CLIENT_DIR%\" && npm run dev -- --host 127.0.0.1 --port 5180"

echo.
echo [maraya] Windows launched:
echo   - Backend:  http://127.0.0.1:3111/health
echo   - Frontend: http://127.0.0.1:5180
echo.
echo [maraya] If needed, run server test from a third window:
echo   cd /d "%SERVER_DIR%" ^&^& node test_paef.js

endlocal
