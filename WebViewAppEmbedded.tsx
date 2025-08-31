import React, { useRef, useState, useCallback } from 'react';
import {
  SafeAreaView,
  StatusBar,
  BackHandler,
  Alert,
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
} from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import htmlContent from './htmlContent';

const WebViewAppEmbedded = () => {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Handle Android back button
  React.useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      
      Alert.alert(
        'Exit RAIDMASTER',
        'Are you sure you want to exit?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Exit', onPress: () => BackHandler.exitApp() }
        ],
        { cancelable: true }
      );
      return true;
    });

    return () => backHandler.remove();
  }, [canGoBack]);

  // JavaScript to inject into the WebView for localStorage bridge and mobile optimizations
  const injectedJavaScript = `
    (function() {
      // Create localStorage bridge to React Native AsyncStorage
      const originalSetItem = window.localStorage.setItem;
      const originalGetItem = window.localStorage.getItem;
      const originalRemoveItem = window.localStorage.removeItem;
      const originalClear = window.localStorage.clear;
      
      // Store data locally and sync with React Native
      const localData = {};
      
      window.localStorage.setItem = function(key, value) {
        localData[key] = value;
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'storage-set',
          key: key,
          value: value
        }));
        try {
          return originalSetItem.call(this, key, value);
        } catch (e) {
          // Fallback if localStorage is not available
        }
      };
      
      window.localStorage.getItem = function(key) {
        return localData[key] || null;
      };
      
      window.localStorage.removeItem = function(key) {
        delete localData[key];
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'storage-remove',
          key: key
        }));
        try {
          return originalRemoveItem.call(this, key);
        } catch (e) {}
      };
      
      window.localStorage.clear = function() {
        Object.keys(localData).forEach(key => delete localData[key]);
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'storage-clear'
        }));
        try {
          return originalClear.call(this);
        } catch (e) {}
      };

      // Request initial data from React Native
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'storage-init'
      }));
      
      // Listen for storage data from React Native
      document.addEventListener('message', function(e) {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'storage-restore') {
            localData[data.key] = data.value;
          }
        } catch (err) {}
      });
      
      window.addEventListener('message', function(e) {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'storage-restore') {
            localData[data.key] = data.value;
          }
        } catch (err) {}
      });

      // Mobile optimizations
      // Prevent zooming
      document.addEventListener('gesturestart', function(e) {
        e.preventDefault();
      });
      
      // Fix viewport
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      } else {
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        document.head.appendChild(meta);
      }

      // Ensure proper sizing
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.width = '100%';
      document.body.style.height = '100vh';
      document.body.style.overflow = 'hidden';
      
      const app = document.getElementById('app');
      if (app) {
        app.style.height = '100vh';
        app.style.width = '100%';
      }

      console.log('RAIDMASTER WebView initialized');
      true;
    })();
  `;

  // Handle messages from WebView
  const handleMessage = useCallback(async (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      switch (message.type) {
        case 'storage-set':
          await AsyncStorage.setItem(`@raidmaster_${message.key}`, message.value);
          break;
          
        case 'storage-remove':
          await AsyncStorage.removeItem(`@raidmaster_${message.key}`);
          break;
          
        case 'storage-clear':
          const keys = await AsyncStorage.getAllKeys();
          const raidmasterKeys = keys.filter(key => key.startsWith('@raidmaster_'));
          await AsyncStorage.multiRemove(raidmasterKeys);
          break;
          
        case 'storage-init':
          // Load all stored data and send to WebView
          const allKeys = await AsyncStorage.getAllKeys();
          const raidKeys = allKeys.filter(key => key.startsWith('@raidmaster_'));
          const values = await AsyncStorage.multiGet(raidKeys);
          
          for (const [key, value] of values) {
            if (value && webViewRef.current) {
              const cleanKey = key.replace('@raidmaster_', '');
              webViewRef.current.postMessage(JSON.stringify({
                type: 'storage-restore',
                key: cleanKey,
                value: value
              }));
            }
          }
          break;
      }
    } catch (err) {
      console.error('Error handling WebView message:', err);
    }
  }, []);

  const handleNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
  };

  const handleError = () => {
    setError(true);
    setLoading(false);
  };

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#5D5CDE" />
          <Text style={styles.loadingText}>Initializing RAIDMASTER...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load RAIDMASTER</Text>
          <Text style={styles.errorSubtext}>Please restart the application</Text>
        </View>
      )}

      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationStateChange}
        onMessage={handleMessage}
        onError={handleError}
        onLoad={handleLoad}
        onLoadEnd={handleLoad}
        injectedJavaScript={injectedJavaScript}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        mixedContentMode="compatibility"
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        originWhitelist={['*']}
        scalesPageToFit={false}
        bounces={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        androidLayerType="hardware"
        cacheEnabled={true}
        renderToHardwareTextureAndroid={true}
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666666',
    fontFamily: 'System',
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    zIndex: 1000,
  },
  errorText: {
    fontSize: 18,
    color: '#DC2626',
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  errorSubtext: {
    marginTop: 5,
    fontSize: 14,
    color: '#666666',
    fontFamily: 'System',
  },
});

export default WebViewAppEmbedded;