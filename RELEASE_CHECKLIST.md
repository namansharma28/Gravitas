# Gravitas App Release Checklist

## ✅ Pre-Release Checklist

### 1. Deploy Web App to Production
- [ ] Push code to Git repository
- [ ] Deploy to hosting (Vercel/Netlify/etc.)
- [ ] Verify https://www.gravitas.page is live
- [ ] Test all features on production website
- [ ] Verify API endpoints work on production

### 2. Update Environment Variables on Hosting
Make sure these are set in your hosting provider dashboard:
- [ ] `NEXTAUTH_URL=https://www.gravitas.page`
- [ ] `NEXT_PUBLIC_API_URL=https://www.gravitas.page`
- [ ] `MONGODB_URI` (your MongoDB connection string)
- [ ] `NEXTAUTH_SECRET`
- [ ] `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- [ ] `CLOUDINARY_*` variables
- [ ] `SMTP_*` variables
- [ ] `ADMIN_JWT_SECRET`
- [ ] `YOUR_GOOGLE_MAPS_API_KEY`

### 3. Build Production APK

**Option A: Using the automated script**
```bash
npm run build:apk
```

**Option B: Manual build**
```bash
# Switch to production config
cp capacitor.config.prod.ts capacitor.config.ts

# Sync Capacitor
npm run cap:sync

# Build release APK
cd android
.\gradlew assembleRelease
```

APK location: `android/app/build/outputs/apk/release/app-release.apk`

### 4. Sign the APK (Required for Play Store)

**First time only - Generate keystore:**
```bash
keytool -genkey -v -keystore gravitas-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias gravitas
```

**Important:** Save the keystore file and passwords securely! You'll need them for all future updates.

**Configure signing in `android/app/build.gradle`:**
```gradle
android {
    signingConfigs {
        release {
            storeFile file("../../gravitas-release-key.jks")
            storePassword "YOUR_STORE_PASSWORD"
            keyAlias "gravitas"
            keyPassword "YOUR_KEY_PASSWORD"
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

Then rebuild:
```bash
cd android
.\gradlew assembleRelease
```

### 5. Test Production APK

- [ ] Install on test device: `adb install android/app/build/outputs/apk/release/app-release.apk`
- [ ] Verify app loads from https://www.gravitas.page
- [ ] Test login/authentication
- [ ] Test API calls (create event, join community, etc.)
- [ ] Test image uploads
- [ ] Test notifications
- [ ] Test QR code scanning
- [ ] Test forms
- [ ] Test on different Android versions if possible

### 6. Prepare Play Store Assets

Create these assets for Google Play Store:

**App Icon:**
- [ ] 512x512 PNG (already have in `resources/icon.png`)

**Screenshots (at least 2, up to 8):**
- [ ] Phone screenshots (1080x1920 or similar)
- [ ] Tablet screenshots (optional but recommended)

**Feature Graphic:**
- [ ] 1024x500 PNG banner image

**App Description:**
- [ ] Short description (80 characters max)
- [ ] Full description (4000 characters max)
- [ ] What's new in this version

**Store Listing:**
- [ ] App title: "Gravitas"
- [ ] Category: Social / Events
- [ ] Content rating questionnaire
- [ ] Privacy policy URL
- [ ] Contact email

### 7. Create Google Play Developer Account

- [ ] Go to https://play.google.com/console
- [ ] Pay one-time $25 registration fee
- [ ] Complete account setup
- [ ] Verify identity

### 8. Create App in Play Console

- [ ] Click "Create app"
- [ ] Enter app details
- [ ] Select "App" (not Game)
- [ ] Select "Free" (or Paid if applicable)
- [ ] Accept declarations

### 9. Upload APK

**Internal Testing (Recommended first):**
- [ ] Go to Testing → Internal testing
- [ ] Create new release
- [ ] Upload signed APK
- [ ] Add release notes
- [ ] Add test users (email addresses)
- [ ] Save and review
- [ ] Start rollout

**Production Release:**
- [ ] Complete all Play Console requirements:
  - [ ] Store listing
  - [ ] Content rating
  - [ ] Target audience
  - [ ] Privacy policy
  - [ ] App content
  - [ ] Data safety
- [ ] Go to Production
- [ ] Create new release
- [ ] Upload signed APK
- [ ] Add release notes
- [ ] Review and rollout

### 10. Version Management

Update version in `android/app/build.gradle` for each release:
```gradle
defaultConfig {
    versionCode 1  // Increment for each release (1, 2, 3...)
    versionName "1.0.0"  // User-facing version (1.0.0, 1.1.0, etc.)
}
```

## 📱 iOS Release (Optional)

### 1. Prepare iOS Build
```bash
npm run cap:ios
```

### 2. Configure in Xcode
- [ ] Open project in Xcode
- [ ] Set Team and Bundle Identifier
- [ ] Configure signing certificates
- [ ] Update version and build number

### 3. Build and Archive
- [ ] Product → Archive
- [ ] Distribute to App Store
- [ ] Upload to App Store Connect

### 4. App Store Submission
- [ ] Create app in App Store Connect
- [ ] Add screenshots and metadata
- [ ] Submit for review

## 🔄 Future Updates

When releasing updates:

1. Update version numbers in `android/app/build.gradle`
2. Build new signed APK
3. Test thoroughly
4. Upload to Play Console
5. Add release notes describing changes
6. Roll out to production

## ⚠️ Important Notes

- **Never commit** `.env.local` or keystore files to Git
- **Backup your keystore** - you can't update the app without it!
- **Test on real devices** before releasing
- **Monitor crash reports** in Play Console after release
- **Respond to user reviews** to maintain good ratings

## 📞 Support Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/studio/publish)
- [Play Console Help](https://support.google.com/googleplay/android-developer)
- [App Signing Best Practices](https://developer.android.com/studio/publish/app-signing)

## 🎉 Post-Release

- [ ] Monitor Play Console for crashes/ANRs
- [ ] Check user reviews and ratings
- [ ] Track download statistics
- [ ] Plan next update based on feedback
- [ ] Celebrate! 🎊
