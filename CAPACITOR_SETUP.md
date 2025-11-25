# Capacitor Setup Guide

## What's Configured

Your Next.js app is now set up with Capacitor to create native iOS and Android apps!

## Development Setup

The app is configured to load from `http://localhost:3000` during development.

### Steps to Test:

1. **Start your Next.js dev server:**
   ```bash
   npm run dev
   ```

2. **Open Android Studio (for Android):**
   ```bash
   npm run cap:android
   ```
   - Click the "Run" button in Android Studio
   - The app will load your local dev server

3. **Open Xcode (for iOS - Mac only):**
   ```bash
   npm run cap:ios
   ```
   - Select a simulator and click "Run"

## Production Build

When you're ready to deploy to app stores:

1. **Switch to production config:**
   ```bash
   # Backup dev config
   mv capacitor.config.ts capacitor.config.dev.ts
   
   # Use production config
   cp capacitor.config.prod.ts capacitor.config.ts
   ```

2. **Sync changes:**
   ```bash
   npm run cap:sync
   ```

3. **Build Production APK:**
   ```bash
   cd android
   .\gradlew assembleRelease
   ```
   APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

4. **Build for iOS:**
   - Open Xcode → Product → Archive

5. **Switch back to dev config when done:**
   ```bash
   mv capacitor.config.dev.ts capacitor.config.ts
   ```

## Adding Native Features

Install Capacitor plugins as needed:

```bash
# Camera access
npm install @capacitor/camera

# Push notifications
npm install @capacitor/push-notifications

# Geolocation
npm install @capacitor/geolocation

# And many more...
```

Then use them in your code:

```typescript
import { Camera } from '@capacitor/camera';

const photo = await Camera.getPhoto({
  quality: 90,
  allowEditing: true,
  resultType: 'uri'
});
```

## App Icons & Splash Screens

Place your assets in:
- `android/app/src/main/res/` (Android)
- `ios/App/App/Assets.xcassets/` (iOS)

Or use the Capacitor asset generator:
```bash
npm install @capacitor/assets --save-dev
npx capacitor-assets generate
```

## Troubleshooting

- **App shows blank screen:** Make sure your dev server is running on `localhost:3000`
- **Can't connect to localhost:** Use your computer's IP address instead in `capacitor.config.ts`
- **Build errors:** Run `npm run cap:sync` after any config changes

## Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Capacitor Plugins](https://capacitorjs.com/docs/plugins)
- [Publishing to App Stores](https://capacitorjs.com/docs/guides/deploying-updates)
