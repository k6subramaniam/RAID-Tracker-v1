import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useTheme } from 'react-native-paper';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { ultraModernStyles } from '../../theme/ultraModern';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showSidebar?: boolean;
  showBackButton?: boolean;
  rightActions?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  subtitle,
  showSidebar = true,
  showBackButton = false,
  rightActions,
}) => {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.appContainer}>
        {/* Sidebar */}
        {showSidebar && <Sidebar />}
        
        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Top Bar */}
          <TopBar 
            title={title}
            subtitle={subtitle}
            showBackButton={showBackButton}
            rightActions={rightActions}
          />
          
          {/* Content Area */}
          <View style={styles.contentArea}>
            {children}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'column',
  },
  contentArea: {
    flex: 1,
    padding: ultraModernStyles.spacing.lg,
  },
});

export default Layout;