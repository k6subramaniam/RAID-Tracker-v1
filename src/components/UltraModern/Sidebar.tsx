import React from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import WebIcon from '../WebIcon';
import { ultraModernStyles } from '../../theme/ultraModern';

interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  section?: string;
}

const navigationItems: SidebarItem[] = [
  // Core section
  { id: 'dashboard', label: 'Dashboard', icon: 'view-dashboard', route: 'MainTabs', section: 'Core' },
  { id: 'raid', label: 'RAID Items', icon: 'shield-alert', route: 'RAID', section: 'Core' },
  { id: 'create', label: 'Create Item', icon: 'plus-circle', route: 'CreateItem', section: 'Core' },
  
  // Analysis section
  { id: 'ai-analysis', label: 'AI Analysis', icon: 'robot', route: 'AIAnalysis', section: 'AI & Analysis' },
  { id: 'ai-config', label: 'AI Configuration', icon: 'cog', route: 'AIConfig', section: 'AI & Analysis' },
  { id: 'calculator', label: 'Calculator', icon: 'calculator', route: 'Calculator', section: 'AI & Analysis' },
  { id: 'matrix', label: 'RAID Matrix', icon: 'grid', route: 'Matrix', section: 'AI & Analysis' },
  
  // Governance section
  { id: 'governance', label: 'Governance', icon: 'shield-check', route: 'Governance', section: 'Governance' },
  { id: 'reports', label: 'Reports', icon: 'chart-bar', route: 'Reports', section: 'Governance' },
];

const Sidebar: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  
  // Get current route to highlight active item
  const currentRoute = useNavigationState(state => {
    const route = state.routes[state.index];
    if (route.state) {
      const tabState = route.state as any;
      return tabState.routes[tabState.index]?.name || route.name;
    }
    return route.name;
  });

  const handleItemPress = (item: SidebarItem) => {
    navigation.navigate(item.route as never);
  };

  const renderSection = (sectionName: string, items: SidebarItem[]) => (
    <View key={sectionName} style={styles.navSection}>
      <Text variant="labelSmall" style={[styles.sectionTitle, { color: theme.colors.tertiary }]}>
        {sectionName}
      </Text>
      {items.map((item) => {
        const isActive = currentRoute === item.route || 
          (item.route === 'RAID' && currentRoute === 'MainTabs');
        
        return (
          <Pressable
            key={item.id}
            style={[
              styles.navItem,
              isActive && [styles.navItemActive, { backgroundColor: theme.colors.surfaceVariant }],
            ]}
            onPress={() => handleItemPress(item)}
          >
            {isActive && <View style={[styles.activeIndicator, { backgroundColor: theme.colors.primary }]} />}
            
            <WebIcon 
              name={item.icon} 
              size={20} 
              color={isActive ? theme.colors.onSurface : theme.colors.onSurfaceVariant} 
            />
            <Text 
              variant="labelLarge" 
              style={[
                styles.navText,
                { color: isActive ? theme.colors.onSurface : theme.colors.onSurfaceVariant }
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  const groupedItems = navigationItems.reduce((acc, item) => {
    const section = item.section || 'Other';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, SidebarItem[]>);

  return (
    <View style={[styles.container, ultraModernStyles.sidebarContainer]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logo}>
          <View style={[styles.logoIcon, { backgroundColor: theme.colors.primary }]}>
            <Text variant="titleMedium" style={{ color: theme.colors.onPrimary }}>
              ⚡
            </Text>
          </View>
          <Text variant="titleLarge" style={[styles.logoText, { color: theme.colors.onSurface }]}>
            RAIDMaster
          </Text>
        </View>
      </View>

      {/* Navigation Menu */}
      <ScrollView style={styles.navMenu} showsVerticalScrollIndicator={false}>
        {Object.entries(groupedItems).map(([sectionName, items]) => 
          renderSection(sectionName, items)
        )}
      </ScrollView>

      {/* Theme Toggle */}
      <View style={styles.themeToggle}>
        <Pressable 
          style={[
            styles.themeButton, 
            { backgroundColor: theme.colors.surfaceVariant }
          ]}
        >
          <WebIcon name="theme-light-dark" size={20} color={theme.colors.onSurfaceVariant} />
          <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>
            Dark Theme
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280,
    height: '100%',
    flexDirection: 'column',
  },
  header: {
    padding: ultraModernStyles.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ultraModernStyles.spacing.md,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: ultraModernStyles.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontWeight: '700',
    letterSpacing: -0.02,
  },
  navMenu: {
    flex: 1,
    paddingVertical: ultraModernStyles.spacing.md,
  },
  navSection: {
    marginBottom: ultraModernStyles.spacing.xl,
  },
  sectionTitle: {
    paddingHorizontal: ultraModernStyles.spacing.md,
    paddingBottom: ultraModernStyles.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.1,
    fontWeight: '600',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ultraModernStyles.spacing.md,
    paddingVertical: ultraModernStyles.spacing.md,
    paddingHorizontal: ultraModernStyles.spacing.md,
    position: 'relative',
  },
  navItemActive: {
    borderRightWidth: 2,
    borderRightColor: 'transparent', // Will be overridden by activeIndicator
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  navText: {
    fontWeight: '500',
  },
  themeToggle: {
    padding: ultraModernStyles.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  themeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ultraModernStyles.spacing.md,
    width: '100%',
    paddingVertical: ultraModernStyles.spacing.md,
    paddingHorizontal: ultraModernStyles.spacing.md,
    borderRadius: ultraModernStyles.radius.md,
  },
});

export default Sidebar;