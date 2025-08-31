import React, { useRef, useState, useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  BackHandler,
  Alert,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get the HTML content
const htmlSource = require('./index.html');

const SimpleWebViewApp = () => {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      } else {
        Alert.alert('Exit App', 'Do you want to exit RAIDMASTER?', [
          { text: 'No', onPress: () => null, style: 'cancel' },
          { text: 'Yes', onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [canGoBack]);

  // JavaScript code to inject for localStorage persistence
  const injectedJavaScript = `
    (function() {
      // Override localStorage to persist data
      const originalSetItem = localStorage.setItem;
      const originalGetItem = localStorage.getItem;
      const originalRemoveItem = localStorage.removeItem;
      const originalClear = localStorage.clear;
      
      // Initialize storage data
      window.storageData = {};
      
      // Override setItem
      localStorage.setItem = function(key, value) {
        window.storageData[key] = value;
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'localStorage',
          action: 'setItem',
          key: key,
          value: value
        }));
        try {
          originalSetItem.call(this, key, value);
        } catch(e) {}
      };
      
      // Override getItem
      localStorage.getItem = function(key) {
        return window.storageData[key] || originalGetItem.call(this, key);
      };
      
      // Override removeItem
      localStorage.removeItem = function(key) {
        delete window.storageData[key];
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'localStorage',
          action: 'removeItem',
          key: key
        }));
        try {
          originalRemoveItem.call(this, key);
        } catch(e) {}
      };
      
      // Override clear
      localStorage.clear = function() {
        window.storageData = {};
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'localStorage',
          action: 'clear'
        }));
        try {
          originalClear.call(this);
        } catch(e) {}
      };
      
      // Request stored data
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'localStorage',
        action: 'init'
      }));
      
      // Mobile optimizations
      document.addEventListener('DOMContentLoaded', function() {
        // Set viewport
        var viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
          viewport = document.createElement('meta');
          viewport.name = 'viewport';
          document.head.appendChild(viewport);
        }
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        
        // Prevent zoom
        document.addEventListener('gesturestart', function(e) {
          e.preventDefault();
        });
        
        // Style adjustments
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.width = '100%';
        document.body.style.height = '100vh';
        document.body.style.overflow = 'hidden';
      });
      
      console.log('RAIDMASTER WebView initialized');
      true;
    })();
  `;

  // Handle messages from WebView
  const handleMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'localStorage') {
        switch (data.action) {
          case 'setItem':
            await AsyncStorage.setItem(`@raid_${data.key}`, data.value);
            break;
          case 'removeItem':
            await AsyncStorage.removeItem(`@raid_${data.key}`);
            break;
          case 'clear':
            const keys = await AsyncStorage.getAllKeys();
            const raidKeys = keys.filter(k => k.startsWith('@raid_'));
            await AsyncStorage.multiRemove(raidKeys);
            break;
          case 'init':
            // Load and send all stored data to WebView
            const allKeys = await AsyncStorage.getAllKeys();
            const raidStorageKeys = allKeys.filter(k => k.startsWith('@raid_'));
            const items = await AsyncStorage.multiGet(raidStorageKeys);
            
            items.forEach(([key, value]) => {
              if (value && webViewRef.current) {
                const cleanKey = key.replace('@raid_', '');
                webViewRef.current.injectJavaScript(`
                  window.storageData['${cleanKey}'] = ${JSON.stringify(value)};
                  localStorage.setItem('${cleanKey}', ${JSON.stringify(value)});
                `);
              }
            });
            break;
        }
      }
    } catch (error) {
      console.error('Message handling error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5D5CDE" />
          <Text style={styles.loadingText}>Loading RAIDMASTER...</Text>
        </View>
      )}
      
      <WebView
        ref={webViewRef}
        source={htmlSource}
        style={styles.webview}
        injectedJavaScript={injectedJavaScript}
        onMessage={handleMessage}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        mixedContentMode="always"
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        allowFileAccessFromFileURLs={true}
        originWhitelist={['*']}
        scalesPageToFit={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    zIndex: 999,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
});

export default SimpleWebViewApp;