#!/bin/bash

# RAIDMASTER WebView APK Build Script
# This script builds an Android APK from the HTML WebView app

echo "==========================================="
echo "🚀 RAIDMASTER WebView APK Builder"
echo "==========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    print_warning "EAS CLI not found. Installing..."
    npm install -g eas-cli
    if [ $? -ne 0 ]; then
        print_error "Failed to install EAS CLI"
        exit 1
    fi
    print_status "EAS CLI installed successfully"
else
    print_status "EAS CLI found: $(eas --version)"
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
echo "🔨 Converting HTML to JavaScript module..."
node -e "
const fs = require('fs');
const htmlContent = fs.readFileSync('index.html', 'utf8');
const jsContent = 'const htmlContent = ' + JSON.stringify(htmlContent) + ';\\nexport default htmlContent;';
fs.writeFileSync('htmlContent.js', jsContent);
console.log('HTML content embedded successfully');
"
if [ $? -ne 0 ]; then
    print_error "Failed to convert HTML to JavaScript module"
    exit 1
fi
print_status "HTML converted to JavaScript module"

echo ""
echo "🏗️  Building APK with EAS..."
echo "Please select build profile:"
echo "1) apk-unsigned (Debug, unsigned APK - fastest)"
echo "2) apk (Release, signed APK - recommended)"
echo "3) production (AAB for Play Store)"
read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        BUILD_PROFILE="apk-unsigned"
        print_status "Building unsigned debug APK..."
        ;;
    2)
        BUILD_PROFILE="apk"
        print_status "Building signed release APK..."
        ;;
    3)
        BUILD_PROFILE="production"
        print_status "Building production AAB..."
        ;;
    *)
        print_warning "Invalid choice. Using default: apk-unsigned"
        BUILD_PROFILE="apk-unsigned"
        ;;
esac

echo ""
echo "📱 Starting build process..."
echo "This may take 10-20 minutes depending on your connection..."
echo ""

# Check if user is logged in to EAS
eas whoami &> /dev/null
if [ $? -ne 0 ]; then
    print_warning "Not logged in to EAS. Please log in:"
    eas login
    if [ $? -ne 0 ]; then
        print_error "Failed to log in to EAS"
        exit 1
    fi
fi

# Start the build
eas build --platform android --profile $BUILD_PROFILE --non-interactive

if [ $? -eq 0 ]; then
    echo ""
    print_status "Build submitted successfully!"
    echo ""
    echo "==========================================="
    echo "📱 APK Build Complete!"
    echo "==========================================="
    echo ""
    echo "Next steps:"
    echo "1. Check the build status in your terminal or at https://expo.dev"
    echo "2. Once complete, download the APK from the provided URL"
    echo "3. Transfer the APK to your Android device"
    echo "4. Install by opening the APK file on your device"
    echo ""
    echo "Installation tips:"
    echo "- Enable 'Install from Unknown Sources' in your device settings"
    echo "- For Samsung devices: Settings > Biometrics and security > Install unknown apps"
    echo "- Select your file manager app and allow it to install apps"
    echo ""
else
    print_error "Build failed. Please check the error messages above."
    exit 1
fi