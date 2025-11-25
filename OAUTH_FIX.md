# Fixing Google OAuth in Capacitor App

## The Problem

When users click "Sign in with Google" in the Capacitor app:
1. OAuth opens in external browser
2. After authentication, browser redirects to your website
3. App doesn't receive the callback

## Solution Options

### Option 1: Configure Google Cloud Console (Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services → Credentials**
4. Click on your OAuth 2.0 Client ID
5. Add these to **Authorized redirect URIs**:
   ```
   https://www.gravitas.page/api/auth/callback/google
   gravitas://callback
   ```
6. Add to **Authorized JavaScript origins**:
   ```
   https://www.gravitas.page
   capacitor://localhost
   ```

### Option 2: Use Capacitor Browser Plugin (Current Setup)

We've installed `@capacitor/browser` which helps with OAuth flows.

The app is now configured to:
- Handle deep links from `https://www.gravitas.page`
- Handle custom scheme `gravitas://`

### Option 3: Keep OAuth in WebView

Update your Capacitor config to prevent external browser opening:

In `capacitor.config.ts`, add:
```typescript
plugins: {
  CapacitorHttp: {
    enabled: true,
  },
}
```

## Testing

After making changes:

1. **Rebuild the app:**
   ```bash
   npm run build:apk
   ```

2. **Install and test:**
   ```bash
   adb install android/app/build/outputs/apk/release/app-release.apk
   ```

3. **Try Google Sign In** - it should now redirect back to the app

## Alternative: Use In-App Browser

If the above doesn't work, you can modify your auth flow to use Capacitor's in-app browser:

```typescript
import { Browser } from '@capacitor/browser';

// Open OAuth in in-app browser
await Browser.open({ 
  url: 'https://www.gravitas.page/api/auth/signin/google',
  windowName: '_self'
});
```

## Verification

To verify deep linking works:

```bash
# Test deep link
adb shell am start -W -a android.intent.action.VIEW -d "https://www.gravitas.page" page.gravitas.app
```

If the app opens, deep linking is configured correctly!

## Common Issues

**Issue:** OAuth still opens in external browser
**Fix:** Make sure `android:launchMode="singleTask"` is set in AndroidManifest.xml (already done)

**Issue:** App doesn't receive callback
**Fix:** Verify Google Cloud Console has correct redirect URIs

**Issue:** "Redirect URI mismatch" error
**Fix:** Add all redirect URIs to Google Cloud Console

## Next Steps

1. Update Google Cloud Console with redirect URIs
2. Rebuild app with `npm run build:apk`
3. Test OAuth flow
4. If issues persist, consider implementing custom OAuth flow with Capacitor Browser plugin
