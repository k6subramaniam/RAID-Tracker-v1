#!/usr/bin/env python3
"""
PWA to APK Builder
Converts a Progressive Web App to an Android APK
"""

import os
import json
import zipfile
import subprocess
import shutil
from pathlib import Path

class PWAtoAPKBuilder:
    def __init__(self, pwa_url, app_name, package_name):
        self.pwa_url = pwa_url
        self.app_name = app_name
        self.package_name = package_name
        self.build_dir = Path("apk-build")
        
    def create_android_project(self):
        """Create a basic Android project structure for WebView app"""
        print("📁 Creating Android project structure...")
        
        # Create directories
        dirs = [
            self.build_dir / "app/src/main/java/com/raidmaster/app",
            self.build_dir / "app/src/main/res/layout",
            self.build_dir / "app/src/main/res/values",
            self.build_dir / "app/src/main/res/mipmap-hdpi",
            self.build_dir / "app/src/main/res/mipmap-mdpi",
            self.build_dir / "app/src/main/res/mipmap-xhdpi",
            self.build_dir / "app/src/main/res/mipmap-xxhdpi",
            self.build_dir / "app/src/main/res/mipmap-xxxhdpi",
        ]
        
        for dir_path in dirs:
            dir_path.mkdir(parents=True, exist_ok=True)
            
        print("✅ Directories created")
        
    def create_gradle_files(self):
        """Create Gradle build files"""
        print("📝 Creating Gradle files...")
        
        # Root build.gradle
        root_gradle = """
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:7.4.2'
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}
"""
        (self.build_dir / "build.gradle").write_text(root_gradle)
        
        # App build.gradle
        app_gradle = f"""
apply plugin: 'com.android.application'

android {{
    compileSdkVersion 33
    
    defaultConfig {{
        applicationId "{self.package_name}"
        minSdkVersion 21
        targetSdkVersion 33
        versionCode 1
        versionName "1.0"
    }}
    
    buildTypes {{
        release {{
            minifyEnabled false
        }}
    }}
}}

dependencies {{
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'androidx.webkit:webkit:1.7.0'
}}
"""
        (self.build_dir / "app/build.gradle").write_text(app_gradle)
        
        # gradle.properties
        gradle_props = """
org.gradle.jvmargs=-Xmx1536m
android.useAndroidX=true
android.enableJetifier=true
"""
        (self.build_dir / "gradle.properties").write_text(gradle_props)
        
        # settings.gradle
        settings = "include ':app'"
        (self.build_dir / "settings.gradle").write_text(settings)
        
        print("✅ Gradle files created")
        
    def create_manifest(self):
        """Create AndroidManifest.xml"""
        print("📄 Creating AndroidManifest.xml...")
        
        manifest = f"""<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="{self.package_name}">
    
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="{self.app_name}"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">
        
        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:launchMode="singleTask"
            android:windowSoftInputMode="adjustResize"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
"""
        manifest_path = self.build_dir / "app/src/main/AndroidManifest.xml"
        manifest_path.write_text(manifest)
        print("✅ AndroidManifest.xml created")
        
    def create_main_activity(self):
        """Create MainActivity.java"""
        print("☕ Creating MainActivity...")
        
        activity = f"""package {self.package_name};

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.view.KeyEvent;

public class MainActivity extends Activity {{
    private WebView webView;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {{
        super.onCreate(savedInstanceState);
        
        webView = new WebView(this);
        setContentView(webView);
        
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setLoadWithOverviewMode(true);
        webSettings.setUseWideViewPort(true);
        webSettings.setSupportZoom(false);
        webSettings.setBuiltInZoomControls(false);
        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
        
        webView.setWebViewClient(new WebViewClient() {{
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {{
                view.loadUrl(url);
                return true;
            }}
        }});
        
        webView.setWebChromeClient(new WebChromeClient());
        
        // Load the PWA URL
        webView.loadUrl("{self.pwa_url}");
    }}
    
    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {{
        if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) {{
            webView.goBack();
            return true;
        }}
        return super.onKeyDown(keyCode, event);
    }}
}}
"""
        activity_path = self.build_dir / f"app/src/main/java/{self.package_name.replace('.', '/')}/MainActivity.java"
        activity_path.parent.mkdir(parents=True, exist_ok=True)
        activity_path.write_text(activity)
        print("✅ MainActivity created")
        
    def create_resources(self):
        """Create resource files"""
        print("🎨 Creating resources...")
        
        # styles.xml
        styles = """<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="@android:style/Theme.Light.NoTitleBar.Fullscreen">
        <item name="android:windowBackground">@android:color/white</item>
    </style>
</resources>
"""
        (self.build_dir / "app/src/main/res/values/styles.xml").write_text(styles)
        
        # strings.xml
        strings = f"""<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">{self.app_name}</string>
</resources>
"""
        (self.build_dir / "app/src/main/res/values/strings.xml").write_text(strings)
        
        # Copy icons
        for size_dir in ["mipmap-hdpi", "mipmap-mdpi", "mipmap-xhdpi", "mipmap-xxhdpi", "mipmap-xxxhdpi"]:
            icon_source = Path("icon-192.png")
            if icon_source.exists():
                icon_dest = self.build_dir / f"app/src/main/res/{size_dir}/ic_launcher.png"
                shutil.copy(icon_source, icon_dest)
        
        print("✅ Resources created")
        
    def build(self):
        """Build the complete Android project"""
        print("\n🔨 Building PWA to APK...")
        print(f"📱 App Name: {self.app_name}")
        print(f"📦 Package: {self.package_name}")
        print(f"🌐 PWA URL: {self.pwa_url}\n")
        
        # Clean previous build
        if self.build_dir.exists():
            shutil.rmtree(self.build_dir)
            
        # Create project structure
        self.create_android_project()
        self.create_gradle_files()
        self.create_manifest()
        self.create_main_activity()
        self.create_resources()
        
        print("\n✅ Android project created successfully!")
        print(f"📁 Project location: {self.build_dir}")
        print("\n📝 To build the APK:")
        print("1. Install Android Studio")
        print("2. Open the project folder")
        print("3. Build > Generate Signed Bundle/APK")
        print("\nOr use command line:")
        print(f"cd {self.build_dir} && ./gradlew assembleDebug")
        
        return True

# Main execution
if __name__ == "__main__":
    # PWA URL from our server
    PWA_URL = "https://8080-ivcx9zjucd9de81v9bys2-6532622b.e2b.dev"
    APP_NAME = "RAIDMASTER"
    PACKAGE_NAME = "com.raidmaster.app"
    
    builder = PWAtoAPKBuilder(PWA_URL, APP_NAME, PACKAGE_NAME)
    builder.build()
    
    print("\n🎉 PWA to APK project generation complete!")
    print("📱 The Android project is ready for compilation.")