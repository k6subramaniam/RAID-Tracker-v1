# 🔧 PWABuilder Settings for Working APK

## Go Back to PWABuilder and Use These Exact Settings:

### 1. Package Options:
- **Package ID**: `com.raidmaster.pwa` (changed to avoid conflicts)
- **App Name**: `RAIDMASTER`
- **Version**: `1.0.1` (incremented)
- **Version Code**: `2` (incremented)

### 2. Signing Options:
- Select **"None - Testing Package"** (this creates a debug-signed APK)
- OR select **"Automatic - Let PWABuilder sign"**

### 3. Android Settings:
- **Minimum Android Version**: 5.0 (API 21)
- **Target Android Version**: 13 (API 33)
- **Display Mode**: Standalone
- **Orientation**: Any

### 4. Download Options:
When presented with download choices, select:
- **"Test Package"** (pre-signed for testing)
- NOT "Unsigned Package"

## Alternative: Manual APK Creation

If PWABuilder still gives issues, we can create the APK manually:

```bash
# 1. Create a simple WebView APK wrapper
cd /home/user/webapp

# 2. Use the Android project we created
cd apk-build

# 3. Build with Gradle (if available)
./gradlew assembleDebug

# 4. Find APK in:
app/build/outputs/apk/debug/app-debug.apk
```

## Common Installation Fixes:

### On Your Phone:
1. **Settings** → **Security**
2. Enable **"Unknown Sources"**
3. Disable **"Verify Apps"**
4. Try installing again

### Using Package Installer:
1. Don't use file manager to install
2. Use **"Package Installer"** app
3. Or use **Google Files** app
4. Or install via **Chrome** downloads

### Clear Package Installer Cache:
1. Settings → Apps
2. Show System Apps (three dots menu)
3. Find "Package Installer"
4. Clear Cache and Data
5. Try installing again

## Error-Specific Solutions:

### "Package appears to be invalid":
- APK is not signed properly
- Solution: Use Test Package from PWABuilder

### "App not installed":
- Package name conflict
- Solution: Uninstall old version first

### "Parse error":
- Corrupted APK or incompatible Android version
- Solution: Re-download or check Android version

## Quick Checklist:
- [ ] Using .apk file (not .aab)
- [ ] Unknown sources enabled
- [ ] Play Protect disabled
- [ ] No existing app with same package ID
- [ ] Android 5.0 or higher
- [ ] File completely downloaded (check size)
- [ ] Using signed/test package (not unsigned)