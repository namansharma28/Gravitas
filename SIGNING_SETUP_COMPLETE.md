# ✅ App Signing Setup Complete!

## What We Did:

1. ✅ Created keystore: `gravitas-release-key.jks`
2. ✅ Created properties file: `android/keystore.properties`
3. ✅ Configured `android/app/build.gradle` for signing

## ⚠️ IMPORTANT: Update Your Passwords

Edit `android/keystore.properties` and replace the placeholders with your actual passwords:

```properties
storePassword=YOUR_ACTUAL_PASSWORD_HERE
keyPassword=YOUR_ACTUAL_PASSWORD_HERE
keyAlias=gravitas
storeFile=../gravitas-release-key.jks
```

**Use the passwords you entered when creating the keystore!**

## 🔒 Security Checklist

- [x] Keystore file created: `gravitas-release-key.jks`
- [ ] **Update passwords in `android/keystore.properties`**
- [ ] **Backup keystore file to secure location**
- [ ] **Save passwords in password manager**
- [x] Added to `.gitignore` (won't be committed)

## ⚠️ CRITICAL: Backup Your Keystore!

**If you lose the keystore or passwords, you can NEVER update your app!**

Backup these files to multiple secure locations:
- `gravitas-release-key.jks`
- Your keystore passwords

Recommended backup locations:
- Encrypted cloud storage (Google Drive, Dropbox)
- Password manager (1Password, LastPass, Bitwarden)
- Offline secure storage (USB drive in safe place)

## 🚀 Next Steps

1. **Update passwords** in `android/keystore.properties`
2. **Test the signing** by building a release APK:
   ```bash
   cd android
   .\gradlew assembleRelease
   ```
3. **Verify the APK** is signed:
   ```bash
   jarsigner -verify -verbose -certs android/app/build/outputs/apk/release/app-release.apk
   ```

## 📝 Keystore Details

- **File:** `gravitas-release-key.jks`
- **Alias:** `gravitas`
- **Algorithm:** RSA 2048-bit
- **Validity:** 10,000 days (~27 years)
- **Owner:** CN=Naman Sharma, OU=Grafene, O=Grafene, L=Bhopal, ST=Madhya Pradesh, C=IN

## 🔧 Build Commands

**Build signed release APK:**
```bash
cd android
.\gradlew assembleRelease
```

**Or use the automated script:**
```bash
npm run build:apk
```

APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

## ✅ You're Ready!

Once you update the passwords, you can build signed APKs for the Play Store!
