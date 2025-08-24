#!/bin/bash

# RAIDMASTER Android APK Build Script
# This script automates the build process for creating an Android APK

echo "========================================="
echo "RAIDMASTER Android APK Build Script"
echo "========================================="
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "Checking prerequisites..."

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi
echo ""

# Build options
echo "Select build method:"
echo "1) EAS Build (Expo Cloud - Recommended)"
echo "2) Local Expo Build"
echo "3) Development Build (Debug APK)"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "Building with EAS..."
        
        # Check if EAS CLI is installed
        if ! command_exists eas; then
            echo "Installing EAS CLI..."
            npm install -g eas-cli
        fi
        
        # Login to EAS
        echo "Please login to your Expo account:"
        eas login
        
        # Build
        echo "Starting EAS build..."
        eas build --platform android --profile production
        
        echo ""
        echo "✅ Build submitted to EAS!"
        echo "You will receive a URL to download the APK once the build is complete."
        echo "Check your terminal or https://expo.dev for the build status."
        ;;
        
    2)
        echo ""
        echo "Building locally with Expo..."
        
        # Check if Expo CLI is installed
        if ! command_exists expo; then
            echo "Installing Expo CLI..."
            npm install -g expo-cli
        fi
        
        # Build
        echo "Starting local build..."
        echo "This will open a browser window for Expo login if needed."
        expo build:android -t apk
        
        echo ""
        echo "✅ Build process started!"
        echo "Follow the prompts in your terminal."
        echo "The APK download link will be provided once complete."
        ;;
        
    3)
        echo ""
        echo "Creating development build..."
        
        # Create a development APK using Expo
        npx expo export --platform android --dev --output-dir ./dist
        
        echo ""
        echo "✅ Development files exported to ./dist"
        echo "Note: This creates development files, not a standalone APK."
        echo "For a standalone APK, use option 1 or 2."
        ;;
        
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "========================================="
echo "Build process completed!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Download the APK file when ready"
echo "2. Transfer to your Samsung Galaxy S25 Ultra"
echo "3. Enable 'Install from Unknown Sources' in Settings"
echo "4. Install and enjoy RAIDMASTER!"
echo ""