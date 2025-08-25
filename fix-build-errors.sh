#!/bin/bash

# RAIDMASTER Build Error Fix Script
# This script addresses common build issues

set -e

echo "======================================="
echo "RAIDMASTER Build Error Fix Script"
echo "======================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step() {
    echo -e "${GREEN}[FIX]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Step 1: Clean all caches and builds
print_step "Cleaning all build caches..."
rm -rf android/app/build 2>/dev/null || true
rm -rf android/build 2>/dev/null || true
rm -rf .expo 2>/dev/null || true
rm -rf ~/.expo 2>/dev/null || true
npm cache clean --force

# Step 2: Reinstall dependencies
print_step "Reinstalling dependencies..."
rm -rf node_modules
npm install

# Step 3: Update EAS CLI
print_step "Updating EAS CLI..."
npm install eas-cli@latest

# Step 4: Clear Expo prebuild
print_step "Clearing Expo prebuild..."
npx expo prebuild --clear --platform android

# Step 5: Check login status
print_step "Checking EAS login status..."
if npx eas whoami &> /dev/null; then
    USER=$(npx eas whoami)
    print_info "✅ Logged in as: $USER"
else
    print_warning "❌ Not logged in to EAS"
    echo "Please run: npx eas login"
    exit 1
fi

# Step 6: Validate configuration
print_step "Validating configuration..."
if [ ! -f "eas.json" ]; then
    print_warning "❌ eas.json not found!"
    exit 1
fi

if [ ! -f "app.json" ]; then
    print_warning "❌ app.json not found!"
    exit 1
fi

print_info "✅ Configuration files found"

# Step 7: Show available build options
echo ""
echo "======================================="
echo "Available Build Options:"
echo "======================================="
echo "1. Unsigned APK (no credentials needed):"
echo "   ./build-android-apk.sh"
echo ""
echo "2. Development APK (debug keystore):"
echo "   ./build-android-apk.sh dev"
echo ""
echo "3. Preview APK (requires credentials):"
echo "   ./build-android-apk.sh preview"
echo ""
echo "4. Signed Release APK (requires credentials):"
echo "   ./build-android-apk.sh signed"
echo ""
echo "5. Play Store AAB (requires credentials):"
echo "   ./build-android-production.sh"
echo ""
echo "======================================="
echo "Recommended for testing: ./build-android-apk.sh"
echo "======================================="