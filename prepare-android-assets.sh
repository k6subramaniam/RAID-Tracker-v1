#!/bin/bash

# Prepare Android Assets Script for RAIDMASTER WebView App
# This script copies the HTML file to the Android assets directory

echo "🚀 Preparing Android assets for RAIDMASTER WebView App..."

# Create android assets directory if it doesn't exist
ANDROID_ASSETS_DIR="android/app/src/main/assets"

# Check if we're in an ejected/bare workflow
if [ -d "android" ]; then
    echo "📁 Creating Android assets directory..."
    mkdir -p "$ANDROID_ASSETS_DIR"
    
    # Copy HTML file to Android assets
    echo "📋 Copying index.html to Android assets..."
    cp index.html "$ANDROID_ASSETS_DIR/"
    
    echo "✅ Android assets prepared successfully!"
else
    echo "⚠️  Android directory not found. This script is for ejected/bare React Native projects."
    echo "📱 For Expo managed workflow, the HTML will be bundled automatically."
fi

echo "🎯 Assets preparation complete!"