const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Creating Simple APK for RAIDMASTER...\n');

// Create a simple Android manifest
const androidManifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.raidmaster.app"
    android:versionCode="1"
    android:versionName="1.0">
    
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="RAIDMASTER"
        android:theme="@android:style/Theme.Light.NoTitleBar.Fullscreen">
        
        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

// Create MainActivity.java
const mainActivity = `package com.raidmaster.app;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import android.webkit.WebChromeClient;
import android.view.KeyEvent;

public class MainActivity extends Activity {
    private WebView webView;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        webView = new WebView(this);
        setContentView(webView);
        
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setBuiltInZoomControls(false);
        webSettings.setDisplayZoomControls(false);
        webSettings.setSupportZoom(false);
        
        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient());
        
        // Load the HTML from assets
        webView.loadUrl("file:///android_asset/index.html");
    }
    
    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if ((keyCode == KeyEvent.KEYCODE_BACK) && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
}`;

// Create build.gradle for app
const buildGradle = `apply plugin: 'com.android.application'

android {
    compileSdkVersion 34
    
    defaultConfig {
        applicationId "com.raidmaster.app"
        minSdkVersion 21
        targetSdkVersion 34
        versionCode 1
        versionName "1.0"
    }
    
    buildTypes {
        debug {
            minifyEnabled false
        }
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt')
        }
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
}`;

console.log('📝 Creating Android project structure...');

// Create directories
const dirs = [
    'simple-apk/app/src/main/java/com/raidmaster/app',
    'simple-apk/app/src/main/res/layout',
    'simple-apk/app/src/main/res/values',
    'simple-apk/app/src/main/res/mipmap-hdpi',
    'simple-apk/app/src/main/assets'
];

dirs.forEach(dir => {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`  ✓ Created ${dir}`);
});

// Write files
fs.writeFileSync('simple-apk/app/src/main/AndroidManifest.xml', androidManifest);
fs.writeFileSync('simple-apk/app/src/main/java/com/raidmaster/app/MainActivity.java', mainActivity);
fs.writeFileSync('simple-apk/app/build.gradle', buildGradle);

// Copy HTML file
fs.copyFileSync('index.html', 'simple-apk/app/src/main/assets/index.html');
console.log('  ✓ Copied HTML file to assets');

// Create a simple icon (just a colored square for now)
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192">
  <rect width="192" height="192" fill="#5D5CDE"/>
  <text x="96" y="120" font-size="80" text-anchor="middle" fill="white" font-family="Arial">R</text>
</svg>`;
fs.writeFileSync('simple-apk/app/src/main/res/mipmap-hdpi/ic_launcher.svg', iconSvg);

// Create strings.xml
const stringsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">RAIDMASTER</string>
</resources>`;
fs.writeFileSync('simple-apk/app/src/main/res/values/strings.xml', stringsXml);

// Create root build.gradle
const rootBuildGradle = `buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.1.0'
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}`;
fs.writeFileSync('simple-apk/build.gradle', rootBuildGradle);

// Create settings.gradle
const settingsGradle = `include ':app'`;
fs.writeFileSync('simple-apk/settings.gradle', settingsGradle);

// Create gradle.properties
const gradleProperties = `org.gradle.jvmargs=-Xmx1536m
android.useAndroidX=true
android.enableJetifier=true`;
fs.writeFileSync('simple-apk/gradle.properties', gradleProperties);

console.log('\n✅ Android project structure created!');
console.log('\n📦 To build the APK:');
console.log('1. cd simple-apk');
console.log('2. ./gradlew assembleDebug');
console.log('\nThe APK will be at: simple-apk/app/build/outputs/apk/debug/app-debug.apk');

// Try to copy gradlew from the existing android directory if it exists
if (fs.existsSync('android/gradlew')) {
    fs.copyFileSync('android/gradlew', 'simple-apk/gradlew');
    fs.chmodSync('simple-apk/gradlew', '755');
    
    if (fs.existsSync('android/gradlew.bat')) {
        fs.copyFileSync('android/gradlew.bat', 'simple-apk/gradlew.bat');
    }
    
    // Copy gradle wrapper
    if (fs.existsSync('android/gradle')) {
        execSync('cp -r android/gradle simple-apk/', { stdio: 'inherit' });
    }
    
    console.log('\n✅ Gradle wrapper copied from existing project');
}