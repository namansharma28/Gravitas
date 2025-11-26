# PWA Setup Script for Gravitas
# This script automates the PWA setup process

Write-Host "🚀 Gravitas PWA Setup Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
Write-Host ""

# Check if npm is installed
Write-Host "Checking npm installation..." -ForegroundColor Yellow
$npmVersion = npm --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm is not installed. Please install npm first." -ForegroundColor Red
    exit 1
}
Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
Write-Host ""

# Summary
Write-Host "================================" -ForegroundColor Cyan
Write-Host "📋 Setup Summary" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

Write-Host "📚 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Build and test: npm run build && npm start" -ForegroundColor White
Write-Host ""

Write-Host "📖 Documentation:" -ForegroundColor Cyan
Write-Host "- Setup Guide: docs/PWA_SETUP_GUIDE.md" -ForegroundColor White
Write-Host "- Integration Checklist: docs/PWA_INTEGRATION_CHECKLIST.md" -ForegroundColor White
Write-Host "- Quick Reference: docs/PWA_QUICK_REFERENCE.md" -ForegroundColor White
Write-Host "- Implementation Summary: docs/PWA_IMPLEMENTATION_SUMMARY.md" -ForegroundColor White
Write-Host ""

Write-Host "✨ PWA setup script completed!" -ForegroundColor Green
