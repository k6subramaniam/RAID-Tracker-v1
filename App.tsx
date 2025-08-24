import React, { useEffect } from 'react';
import { StatusBar, useColorScheme, Platform } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { lightTheme, darkTheme } from './src/styles/theme';
import AppNavigator from './src/navigation/AppNavigator';
import { useStore } from './src/store';

export default function App() {
  const colorScheme = useColorScheme();
  const { themeMode } = useStore();
  
  // Determine which theme to use
  const theme = 
    themeMode === 'auto' 
      ? (colorScheme === 'dark' ? darkTheme : lightTheme)
      : themeMode === 'dark' 
        ? darkTheme 
        : lightTheme;

  useEffect(() => {
    // Set status bar style based on theme
    StatusBar.setBarStyle(
      theme.dark ? 'light-content' : 'dark-content',
      true
    );
    
    // Set status bar background color on Android
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(theme.colors.surface);
    }
  }, [theme]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <StatusBar
            barStyle={theme.dark ? 'light-content' : 'dark-content'}
            backgroundColor={theme.colors.surface}
          />
          <AppNavigator />
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}