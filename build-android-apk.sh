#!/bin/bash

# Android APK Build Script for RAIDMASTER
# This script builds APK files for testing and internal distribution

set -e  # Exit on error

echo "=============================="
echo "RAIDMASTER Android APK Build"
echo "=============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${GREEN}[STEP]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Build profile selection
BUILD_PROFILE="apk-unsigned"
if [ "$1" == "dev" ] || [ "$1" == "development" ]; then
    BUILD_PROFILE="development"
    print_info "Building development APK (signed with debug keystore)..."
elif [ "$1" == "preview" ]; then
    BUILD_PROFILE="preview"
    print_info "Building preview APK (requires credentials)..."
elif [ "$1" == "signed" ] || [ "$1" == "apk" ]; then
    BUILD_PROFILE="apk"
    print_info "Building signed release APK (requires credentials)..."
else
    print_info "Building unsigned APK for testing (no credentials needed)..."
fi

# Step 1: Check prerequisites
print_step "Checking prerequisites..."

# Check if node is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed!"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed!"
    exit 1
fi

# Check if eas-cli is available
if ! npx eas --version &> /dev/null; then
    print_error "EAS CLI not found! Please install with: npm install eas-cli"
    exit 1
fi

# Step 2: Clean previous builds
print_step "Cleaning previous builds..."
rm -rf android/app/build 2>/dev/null || true
rm -rf android/build 2>/dev/null || true
rm -rf .expo 2>/dev/null || true

# Step 3: Install dependencies
print_step "Installing dependencies..."
npm install

# Step 4: Clear Expo caches
print_step "Clearing Expo caches..."
npx expo prebuild --clear --platform android

# Step 5: Check EAS login
print_step "Checking EAS login status..."
if ! npx eas whoami &> /dev/null; then
    print_warning "You need to login to EAS. Please run: npx eas login"
    exit 1
fi

# Step 6: Validate configuration
print_step "Validating build configuration..."
print_info "EAS CLI version: $(npx eas --version | head -1)"

# Step 7: Build APK
print_step "Starting Android APK build..."
echo ""
echo "Profile: $BUILD_PROFILE"
echo "Platform: Android"
echo "Output: APK (.apk)"
echo ""

# Run the build with error handling
print_step "Submitting build to EAS..."
if [ "$BUILD_PROFILE" == "apk-unsigned" ] || [ "$BUILD_PROFILE" == "development" ]; then
    # For unsigned/development builds, use --no-wait to avoid keystore issues
    npx eas build --platform android --profile "$BUILD_PROFILE" --non-interactive --no-wait
else
    # For signed builds, let EAS handle the process normally
    npx eas build --platform android --profile "$BUILD_PROFILE" --non-interactive
fi

if [ $? -eq 0 ]; then
    echo ""
    print_step "APK build submitted successfully!"
    echo ""
    echo "=============================="
    echo "Next Steps:"
    echo "1. Monitor build progress at: https://expo.dev"
    echo "2. Once complete, download the .apk file"
    echo "3. Install on Android device for testing"
    echo "4. For Play Store submission, use: ./build-android-production.sh"
    echo "=============================="
else
    print_error "Build failed! Check the error messages above."
    echo ""
    echo "Common solutions:"
    echo "1. Clear all caches: npx expo prebuild --clear"
    echo "2. Update dependencies: npm update"
    echo "3. Check eas.json configuration"
    echo "4. Verify Android SDK settings in app.json"
    exit 1
fi