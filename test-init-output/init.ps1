# PowerShell script to initialize the agent harness project

Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm install

Write-Host "Building project..." -ForegroundColor Cyan
npm run build

Write-Host "Running tests..." -ForegroundColor Cyan
npm test

Write-Host "Setup complete!" -ForegroundColor Green
