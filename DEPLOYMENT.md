# Gravitas Production Deployment Guide

## Configuration Summary

**Production Domain:** https://www.gravitas.page  
**App ID:** page.gravitas.app  
**App Name:** Gravitas

## Files Configured for Production

✅ `capacitor.config.prod.ts` - Points to https://www.gravitas.page  
✅ `public/capacitor-fetch.js` - API interceptor configured  
✅ `lib/api-config.ts` - API URL helper configured  
✅ `.env.production` - Production environment variables  
✅ `.env.local` - Updated with production URL

## Deployment Steps

### 1. Deploy Web App to Production

Push your code to your hosting provider (Vercel/Netlify/etc.):

```bash
git add .
git commit -m "Add Capacitor support for native apps"
git push origin main
```

Make sure these environment variables are set in your hosting provider:
- `NEXTAUTH_URL=https://www.gravitas.page`
- `NEXT_PUBLIC_API_URL=https://www.gravitas.page`
- All other env vars from `.env.local`

### 2. Build Production APK

**Option A: Using the script (recommended)**
```bash
npm run build:apk
```

**Option B: Manual steps**
```bash
# Switch to production config
cp capacitor.config.prod.ts capacitor.config.ts

# Sync Capacitor
npm run cap:sync

# Build APK
cd android
.\gradlew assembleRelease

# APK will be at: android/app/build/outputs/apk/release/app-release.apk
```

### 3. Sign the APK (Required for Play Store)

Generate a keystore (first time only):
```bash
keytool -genkey -v -keystore gravitas-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias gravitas
```

Add to `android/app/build.gradle`:
```gradle
android {
    signingConfigs {
        release {
            storeFile file("../../gravitas-release-key.jks")
            storePassword "your-password"
            keyAlias "gravitas"
            keyPassword "your-password"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 4. Test the Production APK

1. Install on a test device:
   ```bash
   adb install android/app/build/outputs/apk/release/app-release.apk
   ```

2. Verify:
   - App loads from https://www.gravitas.page
   - API calls work correctly
   - Authentication works
   - All features function properly

### 5. Publish to Google Play Store

1. Go to [Google Play Console](https://play.google.com/console)
2. Create a new app
3. Upload the signed APK
4. Fill in app details, screenshots, etc.
5. Submit for review

## iOS Deployment

1. Open Xcode:
   ```bash
   npm run cap:ios
   ```

2. Configure signing in Xcode
3. Product → Archive
4. Distribute to App Store

## Switching Between Dev and Production

**For Development:**
```bash
# Use dev config (points to local IP)
cp capacitor.config.dev.ts capacitor.config.ts
npm run cap:sync
```

**For Production:**
```bash
# Use production config (points to gravitas.page)
cp capacitor.config.prod.ts capacitor.config.ts
npm run cap:sync
```

## Troubleshooting

### APIs not working in production app
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check browser console in the app for errors
- Ensure production server is accessible

### App won't install
- Make sure APK is signed
- Check Android version compatibility (minSdk: 23)

### White screen on launch
- Check if production URL is accessible
- Verify SSL certificate is valid
- Check browser console for errors

## Important Notes

- ⚠️ Never commit `.env.local` or keystore files to git
- ⚠️ Keep your keystore file safe - you can't update the app without it
- ⚠️ Test thoroughly before publishing to Play Store
- ⚠️ Update version numbers in `android/app/build.gradle` for each release

## Version Management

Update version in `android/app/build.gradle`:
```gradle
defaultConfig {
    versionCode 2  // Increment for each release
    versionName "1.1"  // User-facing version
}
```

## Support

For issues, check:
- [Capacitor Docs](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/studio/publish)
- Project README and CAPACITOR_SETUP.md
