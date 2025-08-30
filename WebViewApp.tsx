import React, { useRef, useState, useCallback } from 'react';
import {
  SafeAreaView,
  StatusBar,
  Platform,
  BackHandler,
  Alert,
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
} from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Read the HTML content from the index.html file
const htmlContent = require('./index.html');

const WebViewApp = () => {
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

  // JavaScript to inject into the WebView for localStorage bridge
  const injectedJavaScript = `
    (function() {
      // Override localStorage to use React Native AsyncStorage
      const originalSetItem = localStorage.setItem;
      const originalGetItem = localStorage.getItem;
      const originalRemoveItem = localStorage.removeItem;
      const originalClear = localStorage.clear;

      localStorage.setItem = function(key, value) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'storage-set',
          key: key,
          value: value
        }));
        return originalSetItem.call(this, key, value);
      };

      localStorage.getItem = function(key) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'storage-get',
          key: key
        }));
        return originalGetItem.call(this, key);
      };

      localStorage.removeItem = function(key) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'storage-remove',
          key: key
        }));
        return originalRemoveItem.call(this, key);
      };

      localStorage.clear = function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'storage-clear'
        }));
        return originalClear.call(this);
      };

      // Initialize stored data
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'storage-init'
      }));

      // Prevent default touch behaviors for better mobile experience
      document.addEventListener('gesturestart', function (e) {
        e.preventDefault();
      });

      // Set viewport for better mobile rendering
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      }

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
          
          values.forEach(([key, value]) => {
            if (value && webViewRef.current) {
              const cleanKey = key.replace('@raidmaster_', '');
              webViewRef.current.postMessage(JSON.stringify({
                type: 'storage-restore',
                key: cleanKey,
                value: value
              }));
            }
          });
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

  const htmlPath = Platform.OS === 'android' 
    ? 'file:///android_asset/index.html'
    : 'index.html';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5D5CDE" />
          <Text style={styles.loadingText}>Loading RAIDMASTER...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load application</Text>
          <Text style={styles.errorSubtext}>Please check your connection and try again</Text>
        </View>
      )}

      <WebView
        ref={webViewRef}
        source={{ uri: htmlPath }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationStateChange}
        onMessage={handleMessage}
        onError={handleError}
        onLoad={handleLoad}
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
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666666',
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
  },
  errorSubtext: {
    marginTop: 5,
    fontSize: 14,
    color: '#666666',
  },
});

export default WebViewApp;