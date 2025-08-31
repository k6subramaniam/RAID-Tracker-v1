#!/bin/bash

# APK Signing Script for RAIDMASTER
# This creates a properly signed APK that Android will accept

echo "================================================"
echo "📱 RAIDMASTER APK Signing Tool"
echo "================================================"
echo ""

# Check if APK exists
if [ ! -f "RAIDMASTER-unsigned.apk" ]; then
    echo "❌ RAIDMASTER-unsigned.apk not found!"
    echo "Please download the unsigned APK from PWABuilder first."
    exit 1
fi

echo "📝 Creating debug keystore..."

# Create a debug keystore if it doesn't exist
if [ ! -f "debug.keystore" ]; then
    keytool -genkey -v \
        -keystore debug.keystore \
        -storepass android \
        -alias androiddebugkey \
        -keypass android \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -dname "CN=Android Debug,O=Android,C=US"
    
    echo "✅ Debug keystore created"
else
    echo "✅ Using existing debug keystore"
fi

echo ""
echo "🔐 Signing APK with debug key..."

# Sign the APK using apksigner (if available) or jarsigner
if command -v apksigner &> /dev/null; then
    # Use apksigner (preferred method)
    apksigner sign \
        --ks debug.keystore \
        --ks-pass pass:android \
        --ks-key-alias androiddebugkey \
        --key-pass pass:android \
        --out RAIDMASTER-signed.apk \
        RAIDMASTER-unsigned.apk
    
    echo "✅ APK signed with apksigner"
elif command -v jarsigner &> /dev/null; then
    # Use jarsigner (fallback method)
    cp RAIDMASTER-unsigned.apk RAIDMASTER-signed-temp.apk
    
    jarsigner -verbose \
        -sigalg SHA256withRSA \
        -digestalg SHA-256 \
        -keystore debug.keystore \
        -storepass android \
        RAIDMASTER-signed-temp.apk \
        androiddebugkey
    
    # Align the APK
    if command -v zipalign &> /dev/null; then
        zipalign -v 4 RAIDMASTER-signed-temp.apk RAIDMASTER-signed.apk
        rm RAIDMASTER-signed-temp.apk
        echo "✅ APK signed and aligned"
    else
        mv RAIDMASTER-signed-temp.apk RAIDMASTER-signed.apk
        echo "✅ APK signed (not aligned - may be slightly larger)"
    fi
else
    echo "❌ No signing tools found (apksigner or jarsigner)"
    echo "Please install Android SDK Build Tools"
    exit 1
fi

echo ""
echo "================================================"
echo "✅ Success! Signed APK created:"
echo "   RAIDMASTER-signed.apk"
echo ""
echo "📱 Installation Instructions:"
echo "1. Transfer RAIDMASTER-signed.apk to your phone"
echo "2. Open the file on your phone"
echo "3. Tap 'Install'"
echo "4. If prompted, allow installation from unknown sources"
echo ""
echo "This signed APK should install without errors!"
echo "================================================"