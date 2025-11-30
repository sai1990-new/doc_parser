@echo off
echo Checking backend service...
echo.

REM Check if port 3001 is in use
netstat -ano | findstr :3001 >nul
if %errorlevel% equ 0 (
    echo [OK] Port 3001 is in use
    netstat -ano | findstr :3001
) else (
    echo [ERROR] Port 3001 is not in use - Backend service is NOT running
    echo.
    echo Please start the backend service:
    echo   cd server
    echo   npm run dev
)

echo.
echo Testing backend health endpoint...
curl -s http://localhost:3001/api/health 2>nul
if %errorlevel% equ 0 (
    echo [OK] Backend is responding
) else (
    echo [ERROR] Cannot connect to backend
    echo Make sure backend is running on http://localhost:3001
)

pause

