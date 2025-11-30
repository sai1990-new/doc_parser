# PowerShell Startup Script
Write-Host "Starting development servers..." -ForegroundColor Green

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check dependencies
if (-not (Test-Path "server\node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    Set-Location server
    npm install
    Set-Location ..
}

if (-not (Test-Path "client\node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location client
    npm install
    Set-Location ..
}

# Start services
Write-Host "`nStarting services..." -ForegroundColor Green
Write-Host "Backend service: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Frontend application: http://localhost:3000" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C to stop services`n" -ForegroundColor Yellow

# Start services in new windows
$serverPath = Join-Path $PWD "server"
$clientPath = Join-Path $PWD "client"

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$serverPath'; npm run dev"
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$clientPath'; npm run dev"

Write-Host "Services started! Please check the logs in the newly opened windows." -ForegroundColor Green
