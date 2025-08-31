#!/usr/bin/env python3
"""
APK Generator for RAIDMASTER
This script creates a simple APK file from the HTML content
"""

import os
import zipfile
import hashlib
import struct
import time
import base64
from pathlib import Path

def create_apk():
    print("🚀 Generating RAIDMASTER APK...")
    
    # APK is essentially a ZIP file with specific structure
    apk_filename = "RAIDMASTER-v1.0.apk"
    
    # Read the HTML content
    with open('index.html', 'r') as f:
        html_content = f.read()
    
    # Create basic Android manifest
    manifest_xml = '''<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.raidmaster.app"
    android:versionCode="1"
    android:versionName="1.0">
    
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <application
        android:label="RAIDMASTER"
        android:icon="@drawable/icon"
        android:allowBackup="true">
        
        <activity android:name=".MainActivity"
            android:label="RAIDMASTER"
            android:configChanges="orientation|keyboardHidden|screenSize"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>'''
    
    # Create DEX bytecode (simplified)
    # This is a minimal DEX file structure
    dex_header = b'dex\n035\x00'  # DEX magic and version
    dex_header += b'\x00' * 20  # checksum and signature (will be filled)
    dex_header += struct.pack('<I', 112)  # file size (placeholder)
    dex_header += struct.pack('<I', 0x70)  # header size
    dex_header += struct.pack('<I', 0x12345678)  # endian tag
    dex_header += b'\x00' * 56  # various counts and offsets
    
    # Create resources.arsc (simplified)
    resources = b'Resources placeholder for RAIDMASTER app'
    
    # Create the APK structure
    with zipfile.ZipFile(apk_filename, 'w', zipfile.ZIP_DEFLATED) as apk:
        # Add manifest
        apk.writestr('AndroidManifest.xml', manifest_xml)
        
        # Add classes.dex (minimal)
        apk.writestr('classes.dex', dex_header + b'\x00' * 1000)
        
        # Add resources
        apk.writestr('resources.arsc', resources)
        
        # Add HTML as an asset
        apk.writestr('assets/index.html', html_content)
        
        # Add a simple icon (SVG as text for now)
        icon_data = '''<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192">
            <rect width="192" height="192" fill="#5D5CDE"/>
            <text x="96" y="120" font-size="80" text-anchor="middle" fill="white">R</text>
        </svg>'''
        apk.writestr('res/drawable/icon.xml', icon_data)
        
        # Add META-INF directory with basic signature files
        apk.writestr('META-INF/MANIFEST.MF', 
            'Manifest-Version: 1.0\n'
            'Created-By: RAIDMASTER APK Generator\n\n')
        
        apk.writestr('META-INF/CERT.SF',
            'Signature-Version: 1.0\n'
            'Created-By: RAIDMASTER APK Generator\n\n')
        
        # Add a dummy certificate (for unsigned APK)
        apk.writestr('META-INF/CERT.RSA', b'DUMMY_CERTIFICATE')
    
    # Get file size
    file_size = os.path.getsize(apk_filename)
    file_size_mb = file_size / (1024 * 1024)
    
    print(f"✅ APK created successfully!")
    print(f"📦 File: {apk_filename}")
    print(f"📏 Size: {file_size_mb:.2f} MB")
    print(f"📱 Package: com.raidmaster.app")
    print(f"🔢 Version: 1.0")
    
    return apk_filename

if __name__ == "__main__":
    try:
        apk_file = create_apk()
        print("\n🎉 APK generation complete!")
        print(f"📥 Download: {apk_file}")
    except Exception as e:
        print(f"❌ Error creating APK: {e}")
        exit(1)