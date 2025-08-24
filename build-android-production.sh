#!/bin/bash

# Android Play Store Build Script for RAIDMASTER
# This script builds the production Android app bundle for Play Store submission

set -e  # Exit on error

echo "==================================="
echo "RAIDMASTER Android Production Build"
echo "==================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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
    print_warning "EAS CLI not found globally, using local version..."
fi

# Step 2: Clean previous builds
print_step "Cleaning previous builds..."
rm -rf android/app/build 2>/dev/null || true
rm -rf android/build 2>/dev/null || true
rm -rf ~/.expo 2>/dev/null || true

# Step 3: Install dependencies
print_step "Installing dependencies..."
npm install

# Step 4: Clear caches
print_step "Clearing caches..."
npx expo prebuild --clear
npx react-native clean-project --remove-iOS-build --remove-android-build --keep-node-modules --keep-brew --keep-pods 2>/dev/null || true

# Step 5: Check EAS configuration
print_step "Verifying EAS configuration..."
npx eas build:configure -p android --non-interactive || true

# Step 6: Login to EAS (if not already logged in)
print_step "Checking EAS login status..."
if ! npx eas whoami &> /dev/null; then
    print_warning "You need to login to EAS. Please run: npx eas login"
    exit 1
fi

# Step 7: Build for production
print_step "Starting Android production build..."
echo ""
echo "Building Android App Bundle for Play Store..."
echo "Profile: production"
echo "Build Type: app-bundle (.aab)"
echo ""

# Run the build
npx eas build --platform android --profile production --non-interactive

# Step 8: Success message
echo ""
print_step "Build submitted successfully!"
echo ""
echo "==================================="
echo "Next Steps:"
echo "1. Monitor build progress at: https://expo.dev/accounts/[your-account]/projects/raidmaster/builds"
echo "2. Once build is complete, download the .aab file"
echo "3. Upload the .aab file to Google Play Console"
echo "4. For automatic submission, run: npx eas submit -p android"
echo "==================================="