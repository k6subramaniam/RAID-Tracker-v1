import React, { useEffect } from 'react';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useStore } from './src/store';
import { lightTheme, darkTheme } from './src/styles/theme';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const { themeMode, initializeSampleData } = useStore();
  
  // Initialize sample data on app start
  useEffect(() => {
    try {
      initializeSampleData();
    } catch (error) {
      console.error('Failed to initialize sample data:', error);
    }
  }, [initializeSampleData]);
  
  // Determine theme based on user preference
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AppNavigator />
        <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      </PaperProvider>
    </SafeAreaProvider>
  );
}