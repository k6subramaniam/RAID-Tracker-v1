import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import UltraModernNavigator from './navigation/UltraModernNavigator';
import { useStore } from './store';
import { ultraModernTheme } from './theme/ultraModern';

export default function App() {
  const { initializeSampleData } = useStore();

  useEffect(() => {
    // Initialize sample data when app starts
    initializeSampleData();
  }, [initializeSampleData]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={ultraModernTheme}>
          <StatusBar style="light" backgroundColor={ultraModernTheme.colors.background} />
          <UltraModernNavigator />
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}