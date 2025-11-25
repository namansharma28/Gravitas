# Android App Signing Setup

## Generate Keystore (First Time Only)

Run this command in your project root:

```bash
keytool -genkey -v -keystore gravitas-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias gravitas
```

You'll be asked for:
1. **Keystore password** - Choose a strong password and SAVE IT!
2. **Key password** - Can be same as keystore password
3. **Name, Organization, etc.** - Fill in your details

**⚠️ CRITICAL:** Save these passwords securely! You'll need them for every app update.

## Configure Gradle for Signing

Add this to `android/app/build.gradle`:

```gradle
android {
    // ... existing config ...
    
    signingConfigs {
        release {
            storeFile file("../../gravitas-release-key.jks")
            storePassword "YOUR_KEYSTORE_PASSWORD"
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

## Better: Use Environment Variables (Recommended)

Instead of hardcoding passwords, use environment variables:

1. Create `android/keystore.properties`:
```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=gravitas
storeFile=../../gravitas-release-key.jks
```

2. Update `android/app/build.gradle`:
```gradle
// Load keystore properties
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    // ... existing config ...
    
    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            }
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

3. Add to `.gitignore`:
```
gravitas-release-key.jks
android/keystore.properties
```

## Build Signed APK

After setup, build with:

```bash
cd android
.\gradlew assembleRelease
```

Signed APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

## Verify Signing

Check if APK is signed:

```bash
jarsigner -verify -verbose -certs android/app/build/outputs/apk/release/app-release.apk
```

Should show "jar verified."

## Backup Your Keystore!

**CRITICAL:** Backup `gravitas-release-key.jks` and passwords to:
- Secure password manager
- Encrypted cloud storage
- Offline secure location

**If you lose the keystore, you can NEVER update your app!** You'd have to publish a completely new app.

## Troubleshooting

**Error: "keystore not found"**
- Check the path in `storeFile` is correct
- Make sure keystore file exists

**Error: "incorrect password"**
- Double-check your passwords
- Passwords are case-sensitive

**Error: "alias not found"**
- Make sure `keyAlias` matches what you used when creating keystore
- Default is "gravitas" if you followed the command above
