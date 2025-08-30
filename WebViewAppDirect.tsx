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
import * as FileSystem from 'expo-file-system';

const WebViewAppDirect = () => {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string>('');

  // Load HTML content on mount
  React.useEffect(() => {
    loadHtmlContent();
  }, []);

  const loadHtmlContent = async () => {
    try {
      // Read the HTML file from the app bundle
      const htmlPath = `${FileSystem.documentDirectory}../index.html`;
      let content = '';
      
      try {
        // Try to read from file system first
        content = await FileSystem.readAsStringAsync(htmlPath);
      } catch (e) {
        // If that fails, use the bundled HTML content
        // For now, we'll need to import it differently
        const response = await fetch('index.html');
        content = await response.text();
      }
      
      // Inject base tag for proper resource loading
      const modifiedHtml = content.replace(
        '<head>',
        `<head>
          <base href="file:///android_asset/">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        `
      );
      
      setHtmlContent(modifiedHtml);
    } catch (err) {
      console.error('Error loading HTML content:', err);
      setError(true);
    }
  };

  // Handle Android back button
  React.useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      
      Alert.alert(
        'Exit App',
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
      // Create a bridge between WebView localStorage and React Native AsyncStorage
      const storage = {
        data: {},
        
        init: async function() {
          // Request stored data from React Native
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'storage-init'
          }));
        },
        
        setItem: function(key, value) {
          this.data[key] = value;
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'storage-set',
            key: key,
            value: value
          }));
        },
        
        getItem: function(key) {
          return this.data[key] || null;
        },
        
        removeItem: function(key) {
          delete this.data[key];
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'storage-remove',
            key: key
          }));
        },
        
        clear: function() {
          this.data = {};
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'storage-clear'
          }));
        }
      };

      // Override localStorage with our custom implementation
      Object.defineProperty(window, 'localStorage', {
        value: storage,
        writable: false,
        configurable: false
      });

      // Listen for storage restore messages from React Native
      window.addEventListener('message', function(event) {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'storage-restore') {
            storage.data[message.key] = message.value;
          }
        } catch (e) {
          // Ignore parse errors
        }
      });

      // Initialize storage
      storage.init();

      // Mobile optimizations
      document.addEventListener('gesturestart', function(e) {
        e.preventDefault();
      });

      // Disable zoom
      document.addEventListener('touchmove', function(e) {
        if (e.scale !== 1) {
          e.preventDefault();
        }
      }, { passive: false });

      // Fix viewport for better mobile rendering
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      }

      // Ensure the app fits the screen properly
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
      document.body.style.width = '100vw';

      // Fix any fixed positioning issues
      const app = document.getElementById('app');
      if (app) {
        app.style.height = '100vh';
        app.style.width = '100vw';
        app.style.position = 'fixed';
        app.style.top = '0';
        app.style.left = '0';
      }

      console.log('WebView bridge initialized');
      true; // Required for injectedJavaScript
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
          
        case 'storage-get':
          const value = await AsyncStorage.getItem(`@raidmaster_${message.key}`);
          if (value && webViewRef.current) {
            webViewRef.current.postMessage(JSON.stringify({
              type: 'storage-response',
              key: message.key,
              value: value
            }));
          }
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

  if (!htmlContent && !error) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5D5CDE" />
        <Text style={styles.loadingText}>Loading RAIDMASTER...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load application</Text>
        <Text style={styles.errorSubtext}>Please check your installation and try again</Text>
      </View>
    );
  }

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
        source={{ html: htmlContent, baseUrl: 'file:///android_asset/' }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationStateChange}
        onMessage={handleMessage}
        onError={handleError}
        onLoad={handleLoad}
        onLoadEnd={handleLoad}
        injectedJavaScript={injectedJavaScript}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        mixedContentMode="compatibility"
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        originWhitelist={['*']}
        scalesPageToFit={false}
        bounces={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        androidHardwareAccelerationDisabled={false}
        cacheEnabled={true}
        incognito={false}
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  errorText: {
    fontSize: 18,
    color: '#DC2626',
    fontWeight: 'bold',
  },
  errorSubtext: {
    marginTop: 5,
    fontSize: 14,
    color: '#666666',
  },
});

export default WebViewAppDirect;