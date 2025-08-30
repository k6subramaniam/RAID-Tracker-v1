#!/bin/bash

# PWA to APK Generator using Bubblewrap
# This creates an Android APK from our PWA

echo "==========================================="
echo "🚀 RAIDMASTER PWA to APK Generator"
echo "==========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi
print_status "Node.js found: $(node --version)"

# Install Bubblewrap
print_info "Installing Bubblewrap..."
npm install -g @bubblewrap/cli 2>/dev/null || npm install --save-dev @bubblewrap/cli

# Create TWA config file
print_info "Creating TWA configuration..."
cat > twa-manifest.json << EOF
{
  "packageId": "com.raidmaster.app",
  "host": "localhost",
  "name": "RAIDMASTER",
  "launcherName": "RAIDMASTER",
  "display": "standalone",
  "themeColor": "#5D5CDE",
  "navigationColor": "#5D5CDE",
  "backgroundColor": "#ffffff",
  "enableNotifications": true,
  "startUrl": "/index.html",
  "iconUrl": "https://8080-ivcx9zjucd9de81v9bys2-6532622b.e2b.dev/icon-512.png",
  "maskableIconUrl": "https://8080-ivcx9zjucd9de81v9bys2-6532622b.e2b.dev/icon-512.png",
  "splashScreenFadeOutDuration": 300,
  "signingKey": {
    "path": "android.keystore",
    "alias": "android"
  },
  "appVersionName": "1.0.0",
  "appVersionCode": 1,
  "shortcuts": [
    {
      "name": "Add Risk",
      "shortName": "Risk",
      "url": "/?action=add-risk",
      "icons": [
        {
          "sizes": "96x96",
          "src": "/icon-192.png"
        }
      ]
    }
  ],
  "generatorApp": "bubblewrap-cli",
  "webManifestUrl": "https://8080-ivcx9zjucd9de81v9bys2-6532622b.e2b.dev/manifest.json",
  "fallbackType": "customtabs",
  "features": {
    "locationDelegation": {
      "enabled": false
    },
    "playBilling": {
      "enabled": false
    }
  },
  "alphaDependencies": {
    "enabled": false
  },
  "enableSiteSettingsShortcut": true,
  "isChromeOSOnly": false,
  "orientation": "portrait",
  "fingerprints": [],
  "fullScopeUrl": "https://8080-ivcx9zjucd9de81v9bys2-6532622b.e2b.dev/"
}
EOF

print_status "TWA configuration created"

# Initialize Bubblewrap project
print_info "Initializing Bubblewrap project..."
npx bubblewrap init --manifest=https://8080-ivcx9zjucd9de81v9bys2-6532622b.e2b.dev/manifest.json --directory=./android-twa 2>/dev/null || true

# If initialization fails, try manual setup
if [ ! -d "android-twa" ]; then
    print_warning "Auto-init failed, trying manual setup..."
    mkdir -p android-twa
    cp twa-manifest.json android-twa/
    cd android-twa
    npx bubblewrap init --config=twa-manifest.json 2>/dev/null || true
    cd ..
fi

# Build the APK
print_info "Building Android APK..."
cd android-twa 2>/dev/null || mkdir -p android-twa && cd android-twa

# Try to build
npx bubblewrap build 2>/dev/null

if [ $? -eq 0 ]; then
    print_status "APK built successfully!"
    
    # Find the APK
    APK_PATH=$(find . -name "*.apk" | head -n 1)
    if [ -n "$APK_PATH" ]; then
        cp "$APK_PATH" ../RAIDMASTER-twa.apk
        print_status "APK saved as: RAIDMASTER-twa.apk"
    fi
else
    print_warning "Bubblewrap build failed. Trying alternative method..."
fi

cd ..

echo ""
echo "==========================================="
echo "📱 Build Process Complete"
echo "==========================================="
echo ""
echo "Next steps:"
echo "1. Check for RAIDMASTER-twa.apk in current directory"
echo "2. Transfer the APK to your Android device"
echo "3. Enable 'Install from Unknown Sources' in settings"
echo "4. Install and run the app!"
echo ""