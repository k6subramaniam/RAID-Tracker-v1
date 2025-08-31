# 📱 RAIDMASTER WebView APK Build Instructions

This document provides complete instructions for building an Android APK from the RAIDMASTER HTML application.

## 🎯 Overview

This React Native application wraps the RAIDMASTER HTML web app in a WebView component, allowing it to run as a native Android application with:
- Full offline support
- Native Android back button handling
- Persistent data storage using AsyncStorage
- Optimized mobile experience

## 📋 Prerequisites

Before building, ensure you have:
1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **Java JDK 17** (for Android builds)
4. **Android Studio** (optional, for local builds)

## 🚀 Quick Start - Build APK

### Option 1: Using EAS Build Service (Recommended)

```bash
# 1. Install EAS CLI globally
npm install -g eas-cli

# 2. Login to your Expo account
eas login

# 3. Install dependencies
npm install

# 4. Build APK using EAS
eas build --platform android --profile apk-unsigned

# 5. Download APK from the provided URL when build completes
```

### Option 2: Local Build

```bash
# 1. Run the local build script
./build-local-apk.sh

# 2. Follow the prompts
# 3. Find your APK at: RAIDMASTER-debug.apk
```

### Option 3: Manual Local Build

```bash
# 1. Install dependencies
npm install

# 2. Prepare HTML content
node -e "const fs = require('fs'); const html = fs.readFileSync('index.html', 'utf8'); fs.writeFileSync('htmlContent.js', 'const htmlContent = ' + JSON.stringify(html) + ';\\nexport default htmlContent;');"

# 3. Prebuild Android project
npx expo prebuild --platform android

# 4. Navigate to Android directory
cd android

# 5. Build debug APK
./gradlew assembleDebug

# 6. Find APK at: android/app/build/outputs/apk/debug/app-debug.apk
```

## 📦 Build Profiles

### Available Build Profiles (in eas.json):

1. **apk-unsigned** - Debug APK, unsigned, fastest build
2. **apk** - Release APK, signed, recommended for testing
3. **production** - AAB bundle for Google Play Store

## 🔧 Configuration

### Key Files:

- `App.tsx` - Main app entry point
- `WebViewAppEmbedded.tsx` - WebView wrapper component
- `htmlContent.js` - Generated file containing HTML as JavaScript string
- `index.html` - Your original HTML application
- `app.json` - Expo/React Native configuration
- `eas.json` - EAS Build configuration

### Android Configuration (app.json):

```json
{
  "android": {
    "package": "com.raidmaster.app",
    "versionCode": 1,
    "permissions": [
      "android.permission.INTERNET",
      "android.permission.ACCESS_NETWORK_STATE"
    ]
  }
}
```

## 📲 Installation on Android Device

### Enable Developer Options:
1. Go to **Settings** → **About Phone**
2. Tap **Build Number** 7 times
3. Enable **USB Debugging** in Developer Options

### Install APK:

#### Method 1: Direct Download
1. Transfer APK to device
2. Open file manager
3. Tap APK file
4. Allow installation from unknown sources
5. Install

#### Method 2: Using ADB
```bash
adb install RAIDMASTER-debug.apk
```

#### Method 3: Email/Cloud
1. Email APK to yourself or upload to cloud storage
2. Download on device
3. Open and install

## 🛠️ Troubleshooting

### Common Issues:

1. **Build fails with "gradlew not found"**
   - Run: `npx expo prebuild --platform android`

2. **HTML content not loading**
   - Ensure `htmlContent.js` is generated
   - Check that `index.html` exists in project root

3. **App crashes on launch**
   - Check logcat: `adb logcat | grep -i raidmaster`
   - Ensure all dependencies are installed

4. **Storage not persisting**
   - Check AsyncStorage permissions
   - Clear app data and reinstall

### Debug Commands:

```bash
# View Android logs
adb logcat

# Check connected devices
adb devices

# Uninstall previous version
adb uninstall com.raidmaster.app

# Clear app data
adb shell pm clear com.raidmaster.app
```

## 🎨 Customization

### Change App Name:
Edit `app.json`:
```json
"name": "Your App Name"
```

### Change Package Name:
Edit `app.json`:
```json
"android": {
  "package": "com.yourcompany.yourapp"
}
```

### Change App Icon:
Replace files in `assets/` directory:
- `icon.png` - Main app icon
- `adaptive-icon.png` - Android adaptive icon
- `splash.png` - Splash screen

## 📊 Build Output

After successful build:
- **Debug APK**: ~30-50 MB
- **Release APK**: ~25-40 MB (optimized)
- **AAB Bundle**: ~15-25 MB (for Play Store)

## 🔐 Signing APK for Production

For production release, you need to sign your APK:

```bash
# Generate keystore
keytool -genkey -v -keystore raidmaster.keystore -alias raidmaster -keyalg RSA -keysize 2048 -validity 10000

# Sign APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore raidmaster.keystore app-release-unsigned.apk raidmaster

# Optimize APK
zipalign -v 4 app-release-unsigned.apk RAIDMASTER-release.apk
```

## 📝 Notes

- The WebView implementation preserves all functionality from the original HTML app
- Data is stored locally using AsyncStorage
- The app works completely offline
- All external resources (CDNs) are loaded from the web when available

## 🆘 Support

For issues or questions:
1. Check the error logs: `adb logcat`
2. Review the build output for errors
3. Ensure all prerequisites are installed
4. Try clearing the cache: `npx expo start -c`

## ✅ Verification

After installation, verify:
1. App launches without crashes
2. All features work as expected
3. Data persists after app restart
4. Back button handling works correctly
5. No console errors in debug mode

---

**Build Version**: 1.0.0  
**Last Updated**: August 2024  
**Compatible With**: Android 5.0+ (API 21+)