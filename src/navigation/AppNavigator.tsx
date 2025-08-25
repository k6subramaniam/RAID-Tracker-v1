import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from 'react-native-paper';
import { Platform } from 'react-native';

// Web-compatible icon import
const Icon = Platform.OS === 'web' 
  ? ({ name, size, color }: { name: string; size: number; color: string }) => (
      <span style={{ fontSize: size, color, fontFamily: 'monospace' }}>
        {name === 'alert-circle-outline' ? '⚠' : 
         name === 'calculator' ? '🧮' :
         name === 'shield-check-outline' ? '🛡' :
         name === 'chart-bar' ? '📊' : '•'}
      </span>
    )
  : require('react-native-vector-icons/MaterialCommunityIcons').default;

// Import screens
import RAIDListScreen from '../screens/RAIDListScreen';
import ItemDetailScreen from '../screens/ItemDetailScreen';
import CreateItemScreen from '../screens/CreateItemScreen';
import CalculatorScreen from '../screens/CalculatorScreen';
import GovernanceScreen from '../screens/GovernanceScreen';
import ReportsScreen from '../screens/ReportsScreen';
import MatrixScreen from '../screens/MatrixScreen';
import AIConfigScreen from '../screens/AIConfigScreen';
import AIAnalysisScreen from '../screens/AIAnalysisScreen';
import WebIcon from '../components/WebIcon';

// Type definitions
export type RootStackParamList = {
  MainTabs: undefined;
  ItemDetail: { itemId: string };
  CreateItem: { type?: string };
  AIConfig: undefined;
  AIAnalysis: { itemIds?: string[] };
  Matrix: undefined;
};

export type MainTabParamList = {
  RAID: undefined;
  Calculator: undefined;
  Governance: undefined;
  Reports: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs: React.FC = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.surfaceVariant,
          borderTopWidth: 1,
          paddingBottom: 4,
          paddingTop: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.surfaceVariant,
        },
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="RAID"
        component={RAIDListScreen}
        options={{
          title: 'RAID Items',
          tabBarIcon: ({ color, size }) => (
            <WebIcon name="alert-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Calculator"
        component={CalculatorScreen}
        options={{
          title: 'Calculator',
          tabBarIcon: ({ color, size }) => (
            <WebIcon name="calculator" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Governance"
        component={GovernanceScreen}
        options={{
          title: 'Governance',
          tabBarIcon: ({ color, size }) => (
            <WebIcon name="shield-check-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          title: 'Reports',
          tabBarIcon: ({ color, size }) => (
            <Icon name="chart-bar" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  const theme = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.surface,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: '600',
          },
          headerTintColor: theme.colors.onSurface,
          cardStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ItemDetail"
          component={ItemDetailScreen}
          options={{ title: 'Item Details' }}
        />
        <Stack.Screen
          name="CreateItem"
          component={CreateItemScreen}
          options={{ title: 'New RAID Item' }}
        />
        <Stack.Screen
          name="AIConfig"
          component={AIConfigScreen}
          options={{ title: 'AI Configuration' }}
        />
        <Stack.Screen
          name="AIAnalysis"
          component={AIAnalysisScreen}
          options={{ title: 'AI Analysis' }}
        />
        <Stack.Screen
          name="Matrix"
          component={MatrixScreen}
          options={{ title: 'RAID Matrix' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;