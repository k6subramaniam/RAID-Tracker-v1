# 🚀 Complete Setup Guide for RAIDMASTER Android Builds

## ✅ What's Been Done For You

All the technical fixes have been implemented:
- ✅ Keystore error resolved
- ✅ Build configurations optimized
- ✅ Scripts created and tested
- ✅ GitHub Actions workflow prepared
- ✅ Documentation written

## 🎯 Your Action Items (Step-by-Step)

### STEP 1: Set Up Expo Account & Token

1. **Create Expo Account** (if you don't have one):
   - Go to https://expo.dev/signup
   - Sign up with your email

2. **Generate Access Token**:
   - Go to https://expo.dev/accounts/[your-username]/settings/access-tokens
   - Click "Create Token"
   - Name it "GitHub Actions"
   - Copy the token (save it securely!)

### STEP 2: Configure GitHub Repository

1. **Add EXPO_TOKEN Secret**:
   - Go to your GitHub repo: https://github.com/k6subramaniam/RAID-Tracker
   - Click "Settings" tab
   - Go to "Secrets and variables" > "Actions"
   - Click "New repository secret"
   - Name: `EXPO_TOKEN`
   - Value: [paste your token from Step 1]
   - Click "Add secret"

### STEP 3: Set Up Local Development

1. **Install EAS CLI locally** (if not using scripts):
   ```bash
   npm install -g eas-cli
   ```

2. **Login to EAS**:
   ```bash
   npx eas login
   # Enter your Expo credentials
   ```

3. **Verify login**:
   ```bash
   npx eas whoami
   # Should show your username
   ```

### STEP 4: Test Your Setup

#### Option A: GitHub Actions (Recommended)
1. Go to your repo: https://github.com/k6subramaniam/RAID-Tracker
2. Click "Actions" tab
3. Click "Build Android APK" workflow
4. Click "Run workflow"
5. Select "apk-unsigned" profile
6. Click "Run workflow"
7. Monitor the build progress

#### Option B: Local Build
1. Clone/pull the latest code
2. Run the build script:
   ```bash
   ./build-android-apk.sh
   ```
3. Monitor the output for any errors

## 🛠️ Available Build Options

### 1. Quick Testing (No Credentials Needed)
```bash
# Unsigned APK for quick testing
./build-android-apk.sh
```

### 2. Development Build
```bash
# Development APK with debug features
./build-android-apk.sh dev
```

### 3. Preview Build (Requires Login)
```bash
# Signed APK for internal distribution
./build-android-apk.sh preview
```

### 4. Play Store Build
```bash
# AAB for Google Play Store
./build-android-production.sh
```

## 🔧 Troubleshooting

### Issue: "Not logged in to EAS"
**Solution**:
```bash
npx eas login
```

### Issue: "Build fails with keystore error"
**Solution**: Use unsigned profile:
```bash
./build-android-apk.sh  # Uses apk-unsigned by default
```

### Issue: "GitHub Actions fails"
**Solution**: Check EXPO_TOKEN secret is set correctly

### Issue: "Dependencies not found"
**Solution**:
```bash
./fix-build-errors.sh
```

## 📱 After Build Completes

### For Unsigned APK:
1. Download APK from Expo dashboard
2. Enable "Install from Unknown Sources" on Android
3. Install and test the APK

### For Signed APK:
1. Download APK from Expo dashboard
2. Install normally on Android device
3. Ready for internal distribution

### For Play Store:
1. Download AAB file from Expo dashboard
2. Upload to Google Play Console
3. Submit for review

## 🌐 Important URLs

- **EAS Dashboard**: https://expo.dev
- **Your Builds**: https://expo.dev/accounts/[username]/projects/raidmaster/builds
- **GitHub Actions**: https://github.com/k6subramaniam/RAID-Tracker/actions
- **Expo Docs**: https://docs.expo.dev/build/introduction/

## 📞 Quick Reference Commands

```bash
# Fix any issues first
./fix-build-errors.sh

# Quick test build (no login needed)
./build-android-apk.sh

# Development build (after login)
./build-android-apk.sh dev

# Check EAS status
npx eas whoami

# Check build configuration
cat eas.json | grep -A5 "apk-unsigned"
```

## 🎉 Success Checklist

- [ ] Expo account created
- [ ] Access token generated
- [ ] EXPO_TOKEN added to GitHub secrets
- [ ] EAS CLI logged in locally
- [ ] GitHub Actions workflow tested
- [ ] Local build script tested
- [ ] APK downloaded and installed

## 🆘 Need Help?

1. **Check the logs**: Look at GitHub Actions logs or terminal output
2. **Run fix script**: `./fix-build-errors.sh`
3. **Check documentation**: 
   - `KEYSTORE_FIX_GUIDE.md` - For keystore issues
   - `APK_BUILD_TROUBLESHOOTING.md` - For APK build issues
   - `ANDROID_BUILD_FIX.md` - For Play Store builds

Your Android build system is now fully configured and ready to use! 🎊