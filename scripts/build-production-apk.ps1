# Build production APK for Gravitas
Write-Host "Building production APK for Gravitas..." -ForegroundColor Green

# Backup dev config
if (Test-Path "capacitor.config.ts") {
    Write-Host "Backing up dev config..." -ForegroundColor Yellow
    Copy-Item "capacitor.config.ts" "capacitor.config.dev.backup.ts" -Force
}

# Use production config
Write-Host "Switching to production config..." -ForegroundColor Yellow
Copy-Item "capacitor.config.prod.ts" "capacitor.config.ts" -Force

# Sync Capacitor
Write-Host "Syncing Capacitor..." -ForegroundColor Yellow
npx cap sync android

# Build release APK
Write-Host "Building release APK..." -ForegroundColor Yellow
Set-Location android
.\gradlew assembleRelease

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nBuild successful! 🎉" -ForegroundColor Green
    Write-Host "APK location: android\app\build\outputs\apk\release\app-release.apk" -ForegroundColor Cyan
} else {
    Write-Host "`nBuild failed!" -ForegroundColor Red
}

Set-Location ..

# Restore dev config
Write-Host "`nRestoring dev config..." -ForegroundColor Yellow
if (Test-Path "capacitor.config.dev.backup.ts") {
    Copy-Item "capacitor.config.dev.backup.ts" "capacitor.config.ts" -Force
    Remove-Item "capacitor.config.dev.backup.ts"
}

Write-Host "Done!" -ForegroundColor Green
