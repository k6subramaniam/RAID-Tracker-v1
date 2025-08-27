import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from 'react-native-paper';

// Import ultra-modern screens
import UltraModernRAIDListScreen from '../screens/UltraModern/UltraModernRAIDListScreen';
import UltraModernAIConfigScreen from '../screens/UltraModern/UltraModernAIConfigScreen';
import UltraModernItemDetailScreen from '../screens/UltraModern/UltraModernItemDetailScreen';
import UltraModernCreateItemScreen from '../screens/UltraModern/UltraModernCreateItemScreen';

// Import existing screens that haven't been converted yet
import CalculatorScreen from '../screens/CalculatorScreen';
import GovernanceScreen from '../screens/GovernanceScreen';
import ReportsScreen from '../screens/ReportsScreen';
import MatrixScreen from '../screens/MatrixScreen';
import AIAnalysisScreen from '../screens/AIAnalysisScreen';
import WebIcon from '../components/WebIcon';

// Type definitions - same as original but with ultra-modern screens
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
          borderTopColor: theme.colors.outline,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: -4,
        },
        headerShown: false, // Ultra-modern screens handle their own headers
      }}
    >
      <Tab.Screen
        name="RAID"
        component={UltraModernRAIDListScreen}
        options={{
          title: 'RAID Items',
          tabBarIcon: ({ color, size }) => (
            <WebIcon name="shield-alert" size={size} color={color} />
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
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.outline,
            borderBottomWidth: 1,
          },
          headerTitleStyle: {
            color: theme.colors.onSurface,
            fontSize: 20,
            fontWeight: '600',
          },
        }}
      />
      <Tab.Screen
        name="Governance"
        component={GovernanceScreen}
        options={{
          title: 'Governance',
          tabBarIcon: ({ color, size }) => (
            <WebIcon name="shield-check" size={size} color={color} />
          ),
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.outline,
            borderBottomWidth: 1,
          },
          headerTitleStyle: {
            color: theme.colors.onSurface,
            fontSize: 20,
            fontWeight: '600',
          },
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          title: 'Reports',
          tabBarIcon: ({ color, size }) => (
            <WebIcon name="chart-bar" size={size} color={color} />
          ),
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.outline,
            borderBottomWidth: 1,
          },
          headerTitleStyle: {
            color: theme.colors.onSurface,
            fontSize: 20,
            fontWeight: '600',
          },
        }}
      />
    </Tab.Navigator>
  );
};

const UltraModernNavigator: React.FC = () => {
  const theme = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.outline,
            borderBottomWidth: 1,
          },
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: '600',
            color: theme.colors.onSurface,
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
          component={UltraModernItemDetailScreen}
          options={{ 
            headerShown: false, // Ultra-modern screen handles its own header
          }}
        />
        <Stack.Screen
          name="CreateItem"
          component={UltraModernCreateItemScreen}
          options={{ 
            headerShown: false, // Ultra-modern screen handles its own header
          }}
        />
        <Stack.Screen
          name="AIConfig"
          component={UltraModernAIConfigScreen}
          options={{ 
            headerShown: false, // Ultra-modern screen handles its own header
          }}
        />
        <Stack.Screen
          name="AIAnalysis"
          component={AIAnalysisScreen}
          options={{ 
            title: 'AI Analysis',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="Matrix"
          component={MatrixScreen}
          options={{ 
            title: 'RAID Matrix',
            headerShown: true,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default UltraModernNavigator;