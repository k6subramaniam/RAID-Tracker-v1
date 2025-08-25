import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme, Badge } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import WebIcon from '../WebIcon';
import { ultraModernStyles } from '../../theme/ultraModern';

interface TopBarProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  rightActions?: React.ReactNode;
}

const TopBar: React.FC<TopBarProps> = ({ 
  title, 
  subtitle, 
  showBackButton = false,
  rightActions 
}) => {
  const theme = useTheme();
  const navigation = useNavigation();

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, ultraModernStyles.glassContainer]}>
      <View style={styles.leftSection}>
        {showBackButton && (
          <Pressable 
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <WebIcon 
              name="arrow-left" 
              size={24} 
              color={theme.colors.onSurface} 
            />
          </Pressable>
        )}
        
        <View style={styles.titleContainer}>
          <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
            {title}
          </Text>
          {subtitle && (
            <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.rightSection}>
        {/* System Status Badge */}
        <View style={[styles.statusBadge, ultraModernStyles.statusActive]}>
          <View style={[styles.statusDot, { backgroundColor: theme.colors.success }]} />
          <Text variant="labelSmall" style={{ color: theme.colors.success }}>
            All Systems Online
          </Text>
        </View>

        {/* AI Status Indicator */}
        <Pressable 
          style={styles.aiStatusButton}
          onPress={() => navigation.navigate('AIConfig' as never)}
        >
          <WebIcon name="robot" size={20} color={theme.colors.primary} />
          <Badge 
            style={[styles.aiBadge, { backgroundColor: theme.colors.success }]}
            size={8}
          />
        </Pressable>

        {/* Notifications */}
        <Pressable style={styles.notificationButton}>
          <WebIcon name="bell" size={20} color={theme.colors.onSurfaceVariant} />
          <Badge 
            style={[styles.notificationBadge, { backgroundColor: theme.colors.error }]}
            size={16}
          >
            3
          </Badge>
        </Pressable>

        {/* User Profile */}
        <Pressable style={styles.profileButton}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
            <Text variant="labelMedium" style={{ color: theme.colors.onPrimary }}>
              JD
            </Text>
          </View>
        </Pressable>

        {rightActions}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ultraModernStyles.spacing.lg,
    paddingVertical: ultraModernStyles.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: ultraModernStyles.spacing.md,
    padding: ultraModernStyles.spacing.sm,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '700',
    letterSpacing: -0.02,
  },
  subtitle: {
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ultraModernStyles.spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ultraModernStyles.spacing.sm,
    paddingHorizontal: ultraModernStyles.spacing.md,
    paddingVertical: ultraModernStyles.spacing.sm,
    borderRadius: ultraModernStyles.radius.xxl,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  aiStatusButton: {
    position: 'relative',
    padding: ultraModernStyles.spacing.sm,
  },
  aiBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  notificationButton: {
    position: 'relative',
    padding: ultraModernStyles.spacing.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  profileButton: {
    padding: ultraModernStyles.spacing.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TopBar;