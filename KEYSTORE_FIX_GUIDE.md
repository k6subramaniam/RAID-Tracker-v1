# Keystore Error Fix Guide

## 🚨 The Problem

The build was failing with this error:
```
Generating a new Keystore is not supported in --non-interactive mode
Error: build command failed.
Process completed with exit code 1.
```

## ✅ The Solution

This error occurs when EAS tries to generate a keystore automatically during a non-interactive build (like GitHub Actions). Here's how it's been fixed:

### 1. Updated Build Profiles

The `eas.json` now includes proper keystore handling:

```json
{
  "build": {
    "development": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug",
        "withoutCredentials": true  // Uses debug keystore
      }
    },
    "apk-unsigned": {
      "android": {
        "buildType": "apk", 
        "gradleCommand": ":app:assembleDebug",
        "withoutCredentials": true  // No keystore needed
      }
    },
    "preview": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease",
        "withoutCredentials": false  // Requires credentials
      }
    }
  }
}
```

### 2. Build Profile Options

| Profile | Keystore | Use Case | GitHub Actions |
|---------|----------|----------|----------------|
| `apk-unsigned` | None | Testing | ✅ Works |
| `development` | Debug | Development | ✅ Works |
| `preview` | Release | Internal distribution | ❌ Needs setup |
| `apk` | Release | Release testing | ❌ Needs setup |
| `production` | Release | Play Store | ❌ Needs setup |

## 🚀 Quick Fix Commands

### For GitHub Actions (Recommended)
```bash
# Use the unsigned profile (no keystore issues)
./build-android-apk.sh
```

### For Local Development
```bash
# Development build (debug keystore)
./build-android-apk.sh dev
```

### If You Need Signed APK
You'll need to set up credentials first:
```bash
npx eas credentials:configure
```

## 🔧 GitHub Actions Setup

The error occurred in GitHub Actions because:
1. The build was using `production` profile
2. Production profile requires keystore generation
3. Keystore generation needs interactive input
4. GitHub Actions runs non-interactively

### Fixed GitHub Workflow

The new workflow (`.github/workflows/build-android-apk.yml`) now:
- Uses `apk-unsigned` profile by default
- Includes profile selection options
- Handles credentials properly
- Uses `--no-wait` flag for unsigned builds

## 🎯 Immediate Solution

**To fix your current build error:**

1. **Run the fix script:**
   ```bash
   ./fix-build-errors.sh
   ```

2. **Build unsigned APK:**
   ```bash
   ./build-android-apk.sh
   ```

3. **Or use GitHub Actions:**
   - Go to Actions tab in your repo
   - Run "Build Android APK" workflow
   - Select "apk-unsigned" profile

## 📋 Profile Selection Guide

### ✅ No Credentials Needed
- `apk-unsigned` - For quick testing
- `development` - For development with debug features

### ⚠️ Credentials Required
- `preview` - For internal distribution
- `apk` - For release testing  
- `production` - For Play Store

## 🔐 Setting Up Credentials (Optional)

If you need signed APKs later:

```bash
# Configure credentials
npx eas credentials:configure

# Build signed APK
./build-android-apk.sh preview
```

## 🐛 Troubleshooting

### Still Getting Keystore Errors?
1. Make sure you're using the right profile:
   ```bash
   ./build-android-apk.sh  # Uses apk-unsigned
   ```

2. Clear all caches:
   ```bash
   ./fix-build-errors.sh
   ```

3. Check your eas.json:
   ```bash
   cat eas.json | grep -A5 "apk-unsigned"
   ```

### GitHub Actions Still Failing?
1. Check if `EXPO_TOKEN` secret is set
2. Use the manual workflow dispatch
3. Select `apk-unsigned` profile

## 📞 Support

If you're still having issues:
1. Check the full error logs
2. Verify your EAS login: `npx eas whoami`
3. Try the fix script: `./fix-build-errors.sh`
4. Use unsigned build: `./build-android-apk.sh`