# 📱 PWABuilder Android Package Configuration

## Settings to Use When Packaging Your APK:

### Basic Information
- **Package ID**: `com.raidmaster.app`
- **App Name**: `RAIDMASTER`
- **App Version**: `1.0.0`
- **App Version Code**: `1`

### Display Settings
- **Display Mode**: `Standalone` (fullscreen app experience)
- **Orientation**: `Portrait` (or `Any` if you want both)
- **Status Bar Color**: `#5D5CDE` (your theme color)
- **Navigation Bar Color**: `#5D5CDE`
- **Splash Screen Color**: `#5D5CDE`
- **Background Color**: `#ffffff`

### Android Specific Options
- **Signing Key**: 
  - For testing: Select "None - Unsigned APK"
  - For production: Select "Use mine" and upload your keystore

### Package Type Options

You'll see these options:

1. **Google Play Store Package** (AAB)
   - Creates an Android App Bundle (.aab)
   - Required for Google Play Store
   - Smaller download size
   - Select if publishing to Play Store

2. **Sideload Package** (APK)
   - Creates a standard APK file
   - Can be directly installed on devices
   - **✅ SELECT THIS FOR TESTING**

3. **Unsigned Package** (APK)
   - Creates unsigned APK for testing
   - **✅ BEST OPTION FOR IMMEDIATE TESTING**
   - No signing required
   - Can install directly on device

## 🚀 Quick Steps to Get Your APK:

1. On PWABuilder page, click **"Package For Stores"**
2. Select **"Android"**
3. Choose **"Sideload Package"** or **"Unsigned Package"**
4. Fill in these details:
   ```
   Package ID: com.raidmaster.app
   App Name: RAIDMASTER
   Version: 1.0.0
   ```
5. Click **"Download"**
6. You'll get a ZIP file containing:
   - Your APK file
   - Installation instructions
   - Source code (optional)

## 📥 After Downloading:

1. **Extract the ZIP file**
2. **Find the APK** (usually named like `RAIDMASTER.apk` or `app-release-unsigned.apk`)
3. **Install on Android**:
   ```bash
   # Using ADB
   adb install RAIDMASTER.apk
   
   # Or transfer to device and tap to install
   ```

## ⚙️ Advanced Options (Optional):

### Trusted Web Activity (TWA) Settings
- **Fallback Behavior**: `Custom Tabs` (opens in Chrome if TWA fails)
- **Include Source Code**: Yes (if you want to modify later)
- **Enable Notifications**: Yes
- **Enable Location**: No (unless needed)

### Optimization Settings
- **Minimum Android Version**: `5.0 (API 21)`
- **Target Android Version**: `13.0 (API 33)`
- **Enable Chrome OS**: Yes (works on Chromebooks)

## 🎨 Customization Tips:

1. **Custom Splash Screen**:
   - PWABuilder will generate one from your icon
   - Or upload a custom 512x512 PNG

2. **App Shortcuts**:
   - Already configured in your manifest.json
   - Will appear on long-press of app icon

3. **Maskable Icon**:
   - Your icon works for this
   - PWABuilder will handle adaptive icons

## ✅ Verification Checklist:

Before downloading, verify:
- [ ] Package ID is unique (com.raidmaster.app)
- [ ] Version number is correct (1.0.0)
- [ ] Selected "Unsigned" or "Sideload" for testing
- [ ] App name is correct (RAIDMASTER)

## 🔍 What Each Download Option Gives You:

### "Download Test Package"
- Unsigned APK
- Ready for immediate testing
- Can't publish to stores
- **Best for quick testing**

### "Download Production Package"
- Signed APK/AAB
- Ready for store submission
- Requires signing key
- **For final release**

## 📝 Final Steps:

1. Click **"Generate"** or **"Download"**
2. Wait for package generation (usually 30-60 seconds)
3. Download the ZIP file
4. Extract and install APK
5. Test on your Android device!

## 🆘 Troubleshooting:

If service worker warning appears:
- It's likely due to sandbox environment
- Won't affect APK functionality
- APK will work offline once installed

If package generation fails:
- Try "Unsigned Package" option
- Check all fields are filled correctly
- Refresh page and try again

---

**Your PWA URL**: https://8080-ivcx9zjucd9de81v9bys2-6532622b.e2b.dev  
**Ready for packaging**: ✅ YES  
**Next Step**: Click "Package For Stores" → Select "Android" → Download!