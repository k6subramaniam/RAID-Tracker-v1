# GitHub Actions Setup for RAIDMASTER APK Builds

This guide explains how to set up automated APK builds using GitHub Actions.

## 🔧 Initial Setup

### 1. Expo Token Setup

You need to create an Expo account and get an access token:

1. Go to [Expo.dev](https://expo.dev) and sign up/login
2. Go to **Account Settings** → **Access Tokens**
3. Click **Create Token**
4. Name it "GitHub Actions" and copy the token
5. In your GitHub repository, go to **Settings** → **Secrets and Variables** → **Actions**
6. Click **New repository secret**
7. Name: `EXPO_TOKEN`
8. Value: Your copied Expo token
9. Click **Add secret**

### 2. EAS CLI Setup (Optional for local development)

```bash
npm install -g eas-cli
eas login
eas build:configure
```

## 🚀 How to Build APKs

### Method 1: Automatic Builds (Recommended)

**Triggers:**
- **Push to main/develop**: Automatically builds preview APK
- **Pull Request**: Builds preview APK and creates web preview
- **New Tag (v1.0.0, etc.)**: Creates a full release with both preview and production APKs

**To create a release:**
```bash
git tag v1.0.0
git push origin v1.0.0
```

### Method 2: Manual Build

1. Go to your GitHub repository
2. Click **Actions** tab
3. Select **Manual APK Build** workflow
4. Click **Run workflow**
5. Choose:
   - **Build profile**: `preview` (faster) or `production` (optimized)
   - **Platform**: `android`, `ios`, or `all`
6. Click **Run workflow**

### Method 3: Quick Manual Build

1. Go to **Actions** → **Build Android APK**
2. Click **Run workflow**  
3. Choose build type: `preview` or `production`
4. Click **Run workflow**

## 📱 Getting Your APK

### From Automatic Builds:

1. **Check GitHub Releases**: Go to your repo → **Releases**
2. **Download APK**: Click on the `.apk` file in the latest release

### From Manual Builds:

1. **Go to Actions**: Click the **Actions** tab
2. **Select Build**: Click on your build workflow run
3. **Check Summary**: The build summary will show the Expo dashboard link
4. **Visit Expo Dashboard**: Go to [expo.dev](https://expo.dev) → **Projects** → **RAIDMASTER**
5. **Download APK**: Once build completes, download the APK

## 📊 Build Types Explained

### Preview Build
- **Speed**: Fast (~10-15 minutes)
- **Size**: Slightly larger
- **Purpose**: Testing and development
- **Optimization**: Basic
- **Best for**: Quick testing on devices

### Production Build
- **Speed**: Slower (~20-30 minutes)  
- **Size**: Optimized and smaller
- **Purpose**: Final release
- **Optimization**: Full (minification, tree-shaking, etc.)
- **Best for**: App store releases and distribution

## 🔄 Workflow Details

### `build-android.yml`
- Triggers on push to main/develop
- Runs tests and type checking
- Builds preview APK by default
- Creates PR comments with build status

### `release.yml`
- Triggers on version tags (v1.0.0, v1.1.0, etc.)
- Builds both preview and production APKs
- Creates GitHub releases
- Generates changelog automatically

### `manual-build.yml`
- Manual trigger only
- Choose platform and build type
- Flexible for ad-hoc builds
- Perfect for testing specific commits

## 🛠 Troubleshooting

### Common Issues:

1. **"Expo token not found"**
   - Make sure `EXPO_TOKEN` secret is set correctly
   - Check token hasn't expired

2. **"Build failed"**
   - Check the Actions logs for specific errors
   - Common issues: dependency conflicts, type errors

3. **"APK not found"**
   - Check Expo dashboard: [expo.dev](https://expo.dev)
   - Build might still be in progress

4. **"Unable to install APK"**
   - Enable "Install from unknown sources" on Android
   - Check if you have storage space

### Getting Help:

1. **Check Actions Logs**: Detailed error information
2. **Expo Dashboard**: Build status and logs
3. **GitHub Issues**: Report bugs and get help

## 📈 Advanced Configuration

### Custom Build Profiles

Edit `eas.json` to add custom build profiles:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    },
    "samsung-optimized": {
      "extends": "production",
      "android": {
        "buildType": "apk",
        "buildConfiguration": "Release"
      }
    }
  }
}
```

### Environment Variables

Add environment-specific variables in GitHub Secrets:

- `EXPO_TOKEN`: Your Expo access token
- `ANDROID_KEYSTORE`: Base64 encoded keystore (for signed builds)
- `ANDROID_KEYSTORE_PASSWORD`: Keystore password
- `API_BASE_URL`: Backend API URL

## 🎯 Best Practices

1. **Use Preview for Testing**: Faster builds for development
2. **Use Production for Releases**: Optimized builds for users  
3. **Tag Releases**: Use semantic versioning (v1.0.0, v1.1.0)
4. **Test Before Release**: Always test preview builds first
5. **Keep Secrets Safe**: Never commit tokens or passwords

## 📱 Installation on Samsung Galaxy S25 Ultra

Once you have the APK:

1. **Download APK** to your phone
2. **Enable Unknown Sources**: Settings → Security → Install unknown apps
3. **Install**: Tap the APK file and follow prompts
4. **Launch**: Find RAIDMASTER in your app drawer

## 🎉 You're All Set!

Your RAIDMASTER app now has automated APK builds! Every push to main will create a new build, and you can manually trigger builds anytime.