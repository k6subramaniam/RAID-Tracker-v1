# 🚀 RAIDMASTER Local Build Instructions

Since GitHub Actions is experiencing service issues, here's how to build your APK locally or via Expo web interface.

## Method 1: Expo Web Build (Easiest - 5 minutes)

### Step 1: Create Expo Account
1. Go to [expo.dev](https://expo.dev)
2. Sign up or login
3. Click "Create a new project"

### Step 2: Import from GitHub
1. Choose "Import from GitHub"
2. Connect your GitHub account
3. Select "RAID-Tracker" repository
4. Import the project

### Step 3: Build APK
1. In your Expo project dashboard
2. Click "Builds" in the sidebar
3. Click "Create build"
4. Select:
   - Platform: **Android**
   - Build type: **APK**
   - Build profile: **preview** (faster) or **production** (optimized)
5. Click "Build"
6. Wait 15-25 minutes
7. Download APK when complete

## Method 2: Local EAS CLI Build

### Prerequisites
- Node.js 18+
- Git
- Expo CLI

### Step 1: Clone and Setup
```bash
git clone https://github.com/k6subramaniam/RAID-Tracker.git
cd RAID-Tracker
npm install
```

### Step 2: Install EAS CLI
```bash
npm install -g @expo/eas-cli
```

### Step 3: Login to Expo
```bash
eas login
```
Enter your Expo account credentials

### Step 4: Initialize Project
```bash
eas project:init --id com.raidmaster.app
```

### Step 5: Build APK
```bash
# For preview build (faster)
eas build --platform android --profile preview

# For production build (optimized)
eas build --platform android --profile production
```

### Step 6: Download APK
- Check build status: `eas build:list`
- Or visit [expo.dev](https://expo.dev) to download

## Method 3: Quick Web Preview

If you just want to see the app running quickly:

### Step 1: Start Development Server
```bash
npm start
```

### Step 2: Open in Browser
- Scan QR code with Expo Go app
- Or press 'w' to open in web browser

## 🎯 Expected Build Output

Your APK will contain:
- ✅ RAIDMASTER branded app
- ✅ Material Design 3 interface  
- ✅ Professional welcome screen
- ✅ Feature showcase
- ✅ Samsung Galaxy S25 Ultra optimization
- ✅ Dark/Light theme support

## 📱 Installation on Samsung Galaxy S25 Ultra

1. Download APK to your phone
2. Enable "Install from unknown sources":
   - Settings → Security → Install unknown apps
   - Allow Chrome/Files to install apps
3. Tap APK file to install
4. Launch RAIDMASTER from app drawer

## 🚀 App Features

Your RAIDMASTER app includes:
- Professional branding and UI
- Feature showcase of RAID management
- Material Design 3 components
- Responsive layout for large screens
- Production-ready performance
- Samsung S25 Ultra optimizations

## 📋 Troubleshooting

### Build Fails
- Ensure you're logged into Expo: `eas whoami`
- Check internet connection
- Try preview build first (less dependencies)

### Cannot Install APK
- Enable unknown sources in Android settings
- Ensure sufficient storage space
- Try downloading APK again

### App Won't Start
- Check Android version (requires Android 6.0+)
- Clear app cache if previously installed
- Restart device if needed

## 🎉 Success!

Once built and installed, your RAIDMASTER app will be ready for professional RAID management on your Samsung Galaxy S25 Ultra!

**Estimated total time: 20-30 minutes from start to installed app** ⏱️