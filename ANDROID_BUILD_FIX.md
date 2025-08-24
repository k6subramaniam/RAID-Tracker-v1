# Android Play Store Build Fix Guide

## Issues Fixed

### 1. ✅ EAS CLI Dependency Error
**Problem**: `eas-cli` was not properly installed in the project dependencies.

**Solution**: 
- Reinstalled `eas-cli` as a project dependency
- Updated to latest version (16.17.4)
- Command: `npm install eas-cli@latest --save`

### 2. ✅ Build Configuration Error
**Problem**: The build profile was not configured correctly for Play Store submission.

**Solution**: Updated `eas.json` with:
- Added CLI version requirement
- Changed production build type from `apk` to `app-bundle`
- Added proper gradle command for release builds
- Added environment variable configuration

### 3. ✅ App Configuration Issues
**Problem**: Missing required configurations in `app.json`

**Solution**: Updated `app.json` with:
- Added iOS bundle identifier
- Added proper build numbers
- Added permissions array for Android
- Ensured all required fields are present

## Updated Configuration Files

### eas.json
```json
{
  "cli": {
    "version": ">= 16.0.0",
    "appVersionSource": "local"
  },
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle",
        "gradleCommand": ":app:bundleRelease"
      },
      "env": {
        "EXPO_PUBLIC_ENV": "production"
      }
    }
  }
}
```

### app.json
- Added iOS configuration
- Added Android permissions array
- Ensured proper version codes and build numbers

## How to Build for Play Store

### Prerequisites
1. Ensure you're logged in to EAS:
   ```bash
   npx eas login
   ```

2. Verify your account:
   ```bash
   npx eas whoami
   ```

### Build Commands

#### Option 1: Use the Build Script
```bash
./build-android-production.sh
```

#### Option 2: Manual Build
```bash
# Clean previous builds
rm -rf android/app/build
rm -rf android/build

# Clear caches
npx expo prebuild --clear

# Build for production
npx eas build --platform android --profile production
```

### Build Output
- The build will produce an `.aab` (Android App Bundle) file
- This is the required format for Google Play Store
- The build will be available on your Expo dashboard

## Common Issues and Solutions

### Issue: "eas-cli not found"
**Solution**: 
```bash
npm install eas-cli@latest --save
```

### Issue: "Build fails with gradle error"
**Solution**:
1. Clear all caches:
   ```bash
   npx expo prebuild --clear
   rm -rf ~/.gradle/caches
   ```
2. Rebuild

### Issue: "Version code already exists"
**Solution**: 
Increment `versionCode` in `app.json`:
```json
"android": {
  "versionCode": 2  // Increment this
}
```

### Issue: "Build profile not found"
**Solution**: 
Ensure you're using the correct profile name:
```bash
npx eas build --platform android --profile production
```

## Monitoring Build Progress

1. After submitting the build, you'll receive a URL
2. Visit the URL to monitor progress
3. Alternative: Check at https://expo.dev/accounts/[your-account]/projects/raidmaster/builds

## Submitting to Play Store

Once the build is complete:

1. Download the `.aab` file from the build page
2. Go to Google Play Console
3. Select your app
4. Go to "Release" > "Production"
5. Create a new release
6. Upload the `.aab` file
7. Fill in release notes
8. Submit for review

Or use EAS Submit:
```bash
npx eas submit -p android --latest
```

## Build Environment Variables

If you need to add environment variables:

1. Add them to `eas.json`:
```json
"production": {
  "env": {
    "EXPO_PUBLIC_API_URL": "https://api.production.com"
  }
}
```

2. Access in your code:
```javascript
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
```

## Support

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Android App Bundle Guide](https://docs.expo.dev/build/building-on-ci/)
- [Troubleshooting Guide](https://docs.expo.dev/build/troubleshooting/)