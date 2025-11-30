@echo off
chcp 65001 >nul
echo Starting development servers...
echo.

REM Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)

REM Check dependencies
if not exist "server\node_modules" (
    echo Installing backend dependencies...
    cd server
    call npm install
    cd ..
)

if not exist "client\node_modules" (
    echo Installing frontend dependencies...
    cd client
    call npm install
    cd ..
)

echo.
echo Starting services...
echo Backend service: http://localhost:3001
echo Frontend application: http://localhost:3000
echo.
echo Press Ctrl+C to stop services
echo.

REM Start services in new windows
echo.
echo Starting backend service...
start "Backend Service" cmd /k "cd /d %~dp0server && npm run dev"
timeout /t 3 /nobreak >nul

echo Starting frontend service...
start "Frontend Service" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo ========================================
echo Services started!
echo ========================================
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Please check the logs in the newly opened windows.
echo Wait a few seconds for services to start, then open:
echo   http://localhost:3000
echo.
pause

