import React, { useEffect, useState } from 'react';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Alert, Platform } from 'react-native';
import { useStore } from './src/store';
import { lightTheme, darkTheme } from './src/styles/theme';
import ProductionNavigator from './src/navigation/ProductionNavigator';
import { StatusBar } from 'expo-status-bar';
import { apiService } from './src/services/api';

export default function ProductionApp() {
  const { themeMode, initializeSampleData } = useStore();
  const [appReady, setAppReady] = useState(false);
  
  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize sample data
        initializeSampleData();
        
        // Check backend connectivity (non-blocking)
        if (Platform.OS === 'web') {
          try {
            await apiService.healthCheck();
            console.log('✅ Backend AI service connected');
          } catch (error) {
            console.warn('⚠️ Backend AI service unavailable - app will work in offline mode');
          }
        }
        
        setAppReady(true);
      } catch (error) {
        console.error('App initialization error:', error);
        setAppReady(true); // Continue anyway
      }
    };

    initializeApp();
  }, [initializeSampleData]);
  
  // Determine theme
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  
  if (!appReady) {
    return null; // Could add a loading screen here
  }
  
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <ProductionNavigator />
        <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      </PaperProvider>
    </SafeAreaProvider>
  );
}