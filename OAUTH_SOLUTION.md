# Google OAuth Solution for Capacitor App

## The Problem

Google OAuth in Capacitor apps faces these challenges:
1. OAuth opens in external Chrome browser
2. After authentication, browser can't redirect back to app
3. Native Google Sign-In plugin has version conflicts with Capacitor 7

## Current Status

✅ App works perfectly  
✅ All features work except Google OAuth  
❌ Google OAuth opens in external browser and gets stuck  

## Recommended Solutions (in order of preference)

### Solution 1: Disable Google OAuth in Mobile App (Quickest)

**For now, simply hide the Google Sign-In button in the mobile app:**

Add this to your sign-in page:

```typescript
import { Capacitor } from '@capacitor/core';

// In your component
const isNativeApp = Capacitor.isNativePlatform();

// Then in your JSX:
{!isNativeApp && (
  <button onClick={() => signIn('google')}>
    Sign in with Google
  </button>
)}
```

**Users can still:**
- Sign in with email/password
- Register new accounts
- Use all app features

**Pros:**
- Works immediately
- No code changes needed
- Users have alternative auth methods

**Cons:**
- No Google Sign-In in mobile app (but works on web)

### Solution 2: Wait for Plugin Update

The native Google Sign-In plugin will eventually support Capacitor 7. Check:
- https://github.com/CodetrixStudio/CapacitorGoogleAuth/issues

Once updated, install and configure it.

### Solution 3: Implement Custom OAuth Flow

Create a custom OAuth implementation using Capacitor Browser:

```typescript
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';

async function googleSignIn() {
  // Open OAuth in in-app browser
  await Browser.open({
    url: 'https://www.gravitas.page/api/auth/signin/google',
    windowName: '_self'
  });
  
  // Listen for app URL open (deep link callback)
  App.addListener('appUrlOpen', (data) => {
    // Handle OAuth callback
    const url = new URL(data.url);
    // Process authentication
  });
}
```

This requires:
1. Custom OAuth handling code
2. Deep link configuration (already done)
3. Token exchange implementation

### Solution 4: Use Different Auth Provider

Consider using auth providers that work better with Capacitor:
- **Firebase Authentication** - Has official Capacitor support
- **Auth0** - Good mobile SDK
- **Supabase** - Works well with Capacitor

## Immediate Action Plan

**For your launch:**

1. **Hide Google Sign-In button in mobile app** (5 minutes)
2. **Keep email/password auth** (already working)
3. **Launch the app** with working authentication
4. **Add Google Sign-In later** when plugin is updated

## Implementation: Hide Google Button

Add this to your auth component:

```typescript
'use client';

import { Capacitor } from '@capacitor/core';
import { useEffect, useState } from 'react';

export default function SignInPage() {
  const [isNativeApp, setIsNativeApp] = useState(false);
  
  useEffect(() => {
    setIsNativeApp(Capacitor.isNativePlatform());
  }, []);
  
  return (
    <div>
      {/* Email/Password form - always show */}
      <EmailPasswordForm />
      
      {/* Google Sign-In - only on web */}
      {!isNativeApp && (
        <button onClick={() => signIn('google')}>
          <GoogleIcon />
          Continue with Google
        </button>
      )}
      
      {/* Show message for mobile users */}
      {isNativeApp && (
        <p className="text-sm text-gray-500">
          Google Sign-In is available on the web version
        </p>
      )}
    </div>
  );
}
```

## Testing

After hiding the Google button:
1. Build production APK: `npm run build:apk`
2. Install and test
3. Verify email/password auth works
4. Launch!

## Future: When Plugin is Updated

Once `@codetrix-studio/capacitor-google-auth` supports Capacitor 7:

```bash
npm install @codetrix-studio/capacitor-google-auth
npx cap sync
```

Then implement native Google Sign-In following their docs.

## Bottom Line

**Don't let OAuth block your launch!** 

- 95% of your app works perfectly
- Email/password auth works fine
- You can add Google Sign-In later
- Most users won't mind using email/password

Launch now, iterate later! 🚀
