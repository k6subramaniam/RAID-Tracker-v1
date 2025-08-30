#!/bin/bash

# Local APK Build Script for RAIDMASTER WebView App
# This script builds an Android APK locally using Expo

echo "==========================================="
echo "🚀 RAIDMASTER Local APK Builder"
echo "==========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi
print_status "Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi
print_status "npm found: $(npm --version)"

# Check if Expo CLI is installed
if ! command -v expo &> /dev/null; then
    print_warning "Expo CLI not found. Installing..."
    npm install -g expo-cli
    if [ $? -ne 0 ]; then
        print_error "Failed to install Expo CLI"
        exit 1
    fi
    print_status "Expo CLI installed successfully"
else
    print_status "Expo CLI found"
fi

echo ""
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies"
    exit 1
fi
print_status "Dependencies installed"

echo ""
echo "🔨 Preparing HTML content..."
node -e "
const fs = require('fs');
const htmlContent = fs.readFileSync('index.html', 'utf8');
const jsContent = 'const htmlContent = ' + JSON.stringify(htmlContent) + ';\\nexport default htmlContent;';
fs.writeFileSync('htmlContent.js', jsContent);
console.log('HTML content prepared successfully');
"
if [ $? -ne 0 ]; then
    print_error "Failed to prepare HTML content"
    exit 1
fi
print_status "HTML content prepared"

echo ""
echo "🏗️  Prebuild Android project..."
npx expo prebuild --platform android --clear
if [ $? -ne 0 ]; then
    print_error "Failed to prebuild Android project"
    print_info "Trying to continue anyway..."
fi

# Check if android directory exists
if [ ! -d "android" ]; then
    print_error "Android directory not found after prebuild"
    print_info "Attempting to run expo eject..."
    npx expo eject
    if [ $? -ne 0 ]; then
        print_error "Failed to eject to bare workflow"
        exit 1
    fi
fi

# Copy HTML file to Android assets
if [ -d "android/app/src/main" ]; then
    echo ""
    echo "📁 Copying HTML to Android assets..."
    mkdir -p android/app/src/main/assets
    cp index.html android/app/src/main/assets/
    print_status "HTML copied to Android assets"
fi

echo ""
echo "🔧 Building APK..."
echo "This may take several minutes..."

# Navigate to android directory and build
cd android

# Check if gradlew exists
if [ ! -f "./gradlew" ]; then
    print_error "gradlew not found"
    exit 1
fi

# Make gradlew executable
chmod +x ./gradlew

# Clean previous builds
./gradlew clean

# Build debug APK
print_info "Building debug APK..."
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
    if [ -f "$APK_PATH" ]; then
        # Copy APK to root directory
        cp "$APK_PATH" ../RAIDMASTER-debug.apk
        
        echo ""
        print_status "Build completed successfully!"
        echo ""
        echo "==========================================="
        echo "📱 APK Build Complete!"
        echo "==========================================="
        echo ""
        echo "APK Location: $(pwd)/../RAIDMASTER-debug.apk"
        echo ""
        echo "📲 Installation Instructions:"
        echo "1. Transfer RAIDMASTER-debug.apk to your Android device"
        echo "2. On your device, navigate to the APK file"
        echo "3. Tap the file to install"
        echo "4. If prompted, enable 'Install from Unknown Sources'"
        echo ""
        echo "For Samsung devices:"
        echo "Settings > Biometrics and security > Install unknown apps"
        echo "Select your file manager and allow installation"
        echo ""
        
        # Get APK size
        APK_SIZE=$(du -h "../RAIDMASTER-debug.apk" | cut -f1)
        echo "APK Size: $APK_SIZE"
        echo ""
    else
        print_error "APK file not found at expected location"
        exit 1
    fi
else
    print_error "Build failed"
    print_info "Check the error messages above for details"
    exit 1
fi

# Option to build release APK
echo "Would you like to build a release APK as well? (y/n)"
read -p "Choice: " build_release

if [ "$build_release" = "y" ] || [ "$build_release" = "Y" ]; then
    print_info "Building release APK..."
    ./gradlew assembleRelease
    
    if [ $? -eq 0 ]; then
        RELEASE_APK="app/build/outputs/apk/release/app-release-unsigned.apk"
        if [ -f "$RELEASE_APK" ]; then
            cp "$RELEASE_APK" ../RAIDMASTER-release-unsigned.apk
            print_status "Release APK created: RAIDMASTER-release-unsigned.apk"
            print_warning "Note: Release APK is unsigned and needs to be signed before distribution"
        fi
    else
        print_warning "Release build failed, but debug APK is available"
    fi
fi

cd ..
echo ""
print_status "All done! Your APK is ready for installation."