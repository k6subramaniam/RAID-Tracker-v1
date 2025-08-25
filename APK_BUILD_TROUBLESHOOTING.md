# APK Build Troubleshooting Guide

## 🐛 Common APK Build Issues and Solutions

### Issue 1: "Build failed during compilation"
**Symptoms**: Build fails with compilation errors, missing dependencies, or Android SDK issues.

**Solutions**:
```bash
# 1. Clear all caches
npx expo prebuild --clear
rm -rf node_modules && npm install

# 2. Update EAS CLI
npm install eas-cli@latest

# 3. Rebuild with clean state
./build-android-apk.sh
```

### Issue 2: "Android SDK version conflicts"
**Symptoms**: Errors related to SDK versions, build tools, or compilation targets.

**Solution**: The configuration has been updated in `app.json`:
```json
"android": {
  "compileSdkVersion": 34,
  "targetSdkVersion": 34,
  "minSdkVersion": 21
}
```

### Issue 3: "Gradle build failed"
**Symptoms**: Gradle-related errors during the build process.

**Solutions**:
```bash
# 1. Use specific build profiles
./build-android-apk.sh preview  # For testing APK
./build-android-apk.sh dev      # For development APK

# 2. Manual build with specific gradle command
npx eas build --platform android --profile apk
```

### Issue 4: "Keystore/Signing issues"
**Symptoms**: Errors related to app signing or keystore.

**Solution**: Use development profile for unsigned APKs:
```bash
./build-android-apk.sh dev
```

## 📋 Build Profiles Available

### 1. Development APK
- **Profile**: `development`
- **Use case**: Development and debugging
- **Signing**: Debug keystore (no credentials needed)
- **Command**: `./build-android-apk.sh dev`

### 2. Preview APK
- **Profile**: `preview`
- **Use case**: Testing and internal distribution
- **Signing**: Release signing
- **Command**: `./build-android-apk.sh preview`

### 3. Custom APK Profile
- **Profile**: `apk`
- **Use case**: Release APK for testing
- **Signing**: Release signing
- **Command**: `./build-android-apk.sh`

### 4. Production Bundle (Not APK)
- **Profile**: `production`
- **Use case**: Google Play Store submission
- **Output**: AAB (Android App Bundle)
- **Command**: `./build-android-production.sh`

## 🔧 Configuration Files

### eas.json
The EAS configuration now includes:

```json
{
  "build": {
    "development": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug",
        "withoutCredentials": true
      }
    },
    "preview": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      }
    },
    "apk": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      }
    }
  }
}
```

### app.json
Enhanced Android configuration:

```json
"android": {
  "package": "com.raidmaster.app",
  "versionCode": 1,
  "compileSdkVersion": 34,
  "targetSdkVersion": 34,
  "minSdkVersion": 21,
  "permissions": [
    "android.permission.INTERNET",
    "android.permission.ACCESS_NETWORK_STATE"
  ]
}
```

## 🚀 Quick Start Commands

### For Testing (Unsigned APK)
```bash
./build-android-apk.sh dev
```

### For Internal Distribution
```bash
./build-android-apk.sh preview
```

### For Play Store
```bash
./build-android-production.sh
```

## 🔍 Debugging Steps

### 1. Check EAS Status
```bash
npx eas whoami
npx eas --version
```

### 2. Validate Configuration
```bash
npx eas build:configure -p android
```

### 3. Clear All Caches
```bash
# Clear Expo caches
npx expo prebuild --clear

# Clear npm cache
npm cache clean --force

# Clear node_modules
rm -rf node_modules && npm install
```

### 4. Check Dependencies
```bash
npm list expo
npm list eas-cli
npm list expo-build-properties
```

## ⚠️ Important Notes

### APK vs AAB
- **APK**: For testing, sideloading, and internal distribution
- **AAB**: Required for Google Play Store (use production profile)

### Signing
- Development builds use debug keystore (no setup required)
- Release builds require proper signing configuration
- EAS handles signing automatically for release builds

### Build Times
- Development APK: ~5-10 minutes
- Release APK: ~10-15 minutes
- Production AAB: ~15-20 minutes

## 📞 Support Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Android Build Troubleshooting](https://docs.expo.dev/build/troubleshooting/)
- [Expo Forums](https://forums.expo.dev/)

## 🔄 Version Management

When build fails due to version conflicts:

1. **Increment version code** in `app.json`:
```json
"android": {
  "versionCode": 2  // Increment this number
}
```

2. **Update version** in `app.json`:
```json
"version": "1.0.1"  // Update version string
```

3. **Rebuild**:
```bash
./build-android-apk.sh
```