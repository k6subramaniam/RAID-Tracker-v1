# 📱 RAIDMASTER PWA to Android APK Guide

This guide shows you how to convert the RAIDMASTER Progressive Web App (PWA) to an Android APK using PWABuilder.

## 🌐 Your PWA is Live!

Your RAIDMASTER PWA is currently running at:
**https://8080-ivcx9zjucd9de81v9bys2-6532622b.e2b.dev**

## 🚀 Method 1: Using PWABuilder Website (Recommended)

This is the easiest method - no coding required!

### Step-by-Step Instructions:

1. **Visit PWABuilder**
   - Go to https://www.pwabuilder.com/

2. **Enter Your PWA URL**
   - In the URL field, enter: `https://8080-ivcx9zjucd9de81v9bys2-6532622b.e2b.dev`
   - Click "Start"

3. **Review Your PWA Score**
   - PWABuilder will analyze your app
   - You should see scores for:
     - ✅ Manifest
     - ✅ Service Worker
     - ✅ Security
     - ✅ Performance

4. **Package for Android**
   - Click on "Package for stores"
   - Select "Android"
   - Choose your options:
     - **Package ID**: `com.raidmaster.app`
     - **App name**: `RAIDMASTER`
     - **Version**: `1.0.0`

5. **Download Options**
   - **Option A: Unsigned APK** (Quick testing)
     - Select "Test Package"
     - Download the APK
     - Install on your device
   
   - **Option B: Signed APK** (For distribution)
     - Select "Production Package"
     - Follow signing instructions
     - Download signed APK

6. **Install on Android Device**
   - Transfer APK to your device
   - Enable "Install from Unknown Sources"
   - Install and run!

## 🛠️ Method 2: Using Local Android Project

We've already generated an Android project for you!

### Build the APK locally:

```bash
# Navigate to the Android project
cd apk-build

# Download Gradle wrapper (if not present)
curl -o gradle-wrapper.jar https://services.gradle.org/distributions/gradle-7.4.2-bin.zip
unzip gradle-wrapper.jar -d gradle/wrapper/

# Make gradlew executable
chmod +x gradlew

# Build debug APK
./gradlew assembleDebug

# Find your APK at:
# apk-build/app/build/outputs/apk/debug/app-debug.apk
```

## 📋 Method 3: Manual PWABuilder CLI

If you want to use PWABuilder CLI locally:

```bash
# Install PWABuilder CLI
npm install -g @pwabuilder/cli

# Package your PWA
pwabuilder package https://8080-ivcx9zjucd9de81v9bys2-6532622b.e2b.dev -p android

# Follow the prompts to generate APK
```

## ✨ Features of Your PWA/APK

Your RAIDMASTER app includes:
- ✅ **Offline Support** - Works without internet via Service Worker
- ✅ **App Icon** - Custom RAIDMASTER icon
- ✅ **Splash Screen** - Branded loading screen
- ✅ **Full Screen Mode** - No browser UI
- ✅ **Home Screen Install** - Add to home screen capability
- ✅ **Push Notifications Ready** - Can be enabled
- ✅ **Native App Experience** - Feels like a native Android app

## 🔧 Customization Options

### In manifest.json:
- **App Name**: Change `"name"` and `"short_name"`
- **Theme Color**: Modify `"theme_color"`
- **Background**: Change `"background_color"`
- **Orientation**: Set to `"landscape"` or `"any"`

### In Android Project:
- **Package Name**: Update in `AndroidManifest.xml`
- **Version**: Modify in `build.gradle`
- **Permissions**: Add in `AndroidManifest.xml`

## 📱 Testing Your APK

1. **On Real Device**:
   ```bash
   adb install RAIDMASTER.apk
   ```

2. **On Emulator**:
   - Open Android Studio
   - Start an emulator
   - Drag and drop APK onto emulator

3. **Debug Mode**:
   ```bash
   adb logcat | grep -i raidmaster
   ```

## 🚨 Troubleshooting

### Common Issues:

1. **"App not installed" error**
   - Enable Unknown Sources
   - Uninstall previous version
   - Check minimum Android version (5.0+)

2. **White screen on launch**
   - Check internet connection
   - Verify PWA URL is accessible
   - Clear app cache

3. **Service Worker not working**
   - Ensure HTTPS is used
   - Check console for errors
   - Verify sw.js is in root directory

## 📊 PWA Checklist

Your app meets all PWA requirements:
- ✅ HTTPS (via sandbox URL)
- ✅ Valid manifest.json
- ✅ Service Worker registered
- ✅ Responsive design
- ✅ App icons (192px, 512px)
- ✅ Offline functionality
- ✅ Install prompt ready

## 🎯 Quick Start Commands

```bash
# Test your PWA locally
python3 -m http.server 8080

# Get public URL
# Visit: https://8080-ivcx9zjucd9de81v9bys2-6532622b.e2b.dev

# Generate APK via PWABuilder.com
# 1. Go to https://www.pwabuilder.com
# 2. Enter the URL above
# 3. Click "Package for stores" > "Android"
# 4. Download APK
```

## 📦 Files Created

- `manifest.json` - PWA manifest
- `sw.js` - Service Worker
- `icon-192.png` - App icon (192x192)
- `icon-512.png` - App icon (512x512)
- `apk-build/` - Android project folder
- `index.html` - Updated with PWA support

## 🔗 Useful Links

- [PWABuilder](https://www.pwabuilder.com)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Android Developer Docs](https://developer.android.com/studio/build/building-cmdline)
- [Service Worker Guide](https://developers.google.com/web/fundamentals/primers/service-workers)

## ✅ Next Steps

1. **Visit PWABuilder.com**
2. **Enter your PWA URL**
3. **Generate APK**
4. **Install on Android**
5. **Enjoy your app!**

---

**Your PWA URL**: https://8080-ivcx9zjucd9de81v9bys2-6532622b.e2b.dev  
**Package Name**: com.raidmaster.app  
**App Name**: RAIDMASTER  
**Version**: 1.0.0