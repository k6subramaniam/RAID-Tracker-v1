import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from 'react-native-paper';
import { Platform } from 'react-native';

// Screens
import ProductionRAIDListScreen from '../screens/ProductionRAIDListScreen';
import CalculatorScreen from '../screens/CalculatorScreen';
import GovernanceScreen from '../screens/GovernanceScreen';
import ReportsScreen from '../screens/ReportsScreen';
import WebIcon from '../components/WebIcon';

// Type definitions
export type RootStackParamList = {
  MainTabs: undefined;
  ItemDetail: { itemId: string };
  CreateItem: { type?: string };
  AIAnalysis: { itemIds?: string[] };
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
          paddingBottom: Platform.OS === 'web' ? 8 : 4,
          paddingTop: 8,
          height: Platform.OS === 'web' ? 70 : 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="RAID"
        component={ProductionRAIDListScreen}
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
            <WebIcon name="chart-bar" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const ProductionNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default ProductionNavigator;