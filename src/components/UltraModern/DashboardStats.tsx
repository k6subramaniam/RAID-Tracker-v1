import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import WebIcon from '../WebIcon';
import { ultraModernStyles } from '../../theme/ultraModern';
import { useStore } from '../../store';
import { RAIDItem } from '../../types';

interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: string;
  color: string;
  backgroundColor: string;
  change?: {
    value: number;
    isPositive: boolean;
  };
  onPress?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  backgroundColor,
  change,
  onPress,
}) => {
  const theme = useTheme();

  return (
    <Pressable 
      style={[
        styles.statCard, 
        ultraModernStyles.ultraCard,
        { backgroundColor: theme.colors.surface }
      ]}
      onPress={onPress}
    >
      {/* Top accent line */}
      <View style={[styles.accentLine, { backgroundColor: color }]} />
      
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor, color }]}>
          <WebIcon name={icon} size={16} color={color} />
        </View>
        
        {change && (
          <Text 
            variant="labelSmall" 
            style={[
              styles.changeText, 
              { color: change.isPositive ? theme.colors.success : theme.colors.error }
            ]}
          >
            {change.isPositive ? '+' : ''}{change.value}%
          </Text>
        )}
      </View>

      <Text variant="displaySmall" style={[styles.statNumber, { color: theme.colors.onSurface }]}>
        {value}
      </Text>
      
      <Text variant="bodyMedium" style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
        {title}
      </Text>
      
      <Text variant="bodySmall" style={[styles.statSubtitle, { color: theme.colors.tertiary }]}>
        {subtitle}
      </Text>
    </Pressable>
  );
};

const DashboardStats: React.FC = () => {
  const theme = useTheme();
  const { items, dashboardStats, loadDashboardStats, isLoading } = useStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardStats();
  }, [loadDashboardStats]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadDashboardStats();
    } finally {
      setRefreshing(false);
    }
  };

  // Use backend stats if available, otherwise calculate from local items
  const stats = React.useMemo(() => {
    if (dashboardStats) {
      return {
        risks: {
          total: dashboardStats.by_type?.Risk || 0,
          open: dashboardStats.active_items || 0,
        },
        issues: {
          total: dashboardStats.by_type?.Issue || 0,
          open: dashboardStats.by_status?.Open || 0,
        },
        assumptions: {
          total: dashboardStats.by_type?.Assumption || 0,
          open: dashboardStats.by_status?.['In Progress'] || 0,
        },
        dependencies: {
          total: dashboardStats.by_type?.Dependency || 0,
          open: dashboardStats.active_items || 0,
        },
        overdue: dashboardStats.overdue || 0,
        recentActivity: dashboardStats.recent_activity || 0,
      };
    }

    // Fallback to local calculation
    const riskItems = items.filter(item => item.type === 'Risk');
    const issueItems = items.filter(item => item.type === 'Issue');
    const assumptionItems = items.filter(item => item.type === 'Assumption');
    const dependencyItems = items.filter(item => item.type === 'Dependency');

    return {
      risks: {
        total: riskItems.length,
        open: riskItems.filter(item => ['Open', 'In Progress', 'Mitigating'].includes(item.status)).length,
      },
      issues: {
        total: issueItems.length,
        open: issueItems.filter(item => ['Open', 'In Progress', 'Mitigating'].includes(item.status)).length,
      },
      assumptions: {
        total: assumptionItems.length,
        open: assumptionItems.filter(item => ['Open', 'In Progress'].includes(item.status)).length,
      },
      dependencies: {
        total: dependencyItems.length,
        open: dependencyItems.filter(item => ['Open', 'In Progress'].includes(item.status)).length,
      },
      overdue: 0,
      recentActivity: 0,
    };
  }, [items, dashboardStats]);

  const statCards = [
    {
      title: 'Active Risks',
      value: stats.risks.open,
      subtitle: `${stats.risks.total} total risks`,
      icon: 'alert-circle',
      color: theme.colors.risk,
      backgroundColor: theme.colors.riskContainer,
      change: { value: -12, isPositive: true }, // Decrease in risks is positive
    },
    {
      title: 'Open Issues',
      value: stats.issues.open,
      subtitle: `${stats.issues.total} total issues`,
      icon: 'alert',
      color: theme.colors.issue,
      backgroundColor: theme.colors.issueContainer,
      change: { value: 8, isPositive: false }, // Increase in issues is negative
    },
    {
      title: 'Assumptions',
      value: stats.assumptions.open,
      subtitle: `${stats.assumptions.total} total assumptions`,
      icon: 'help-circle',
      color: theme.colors.assumption,
      backgroundColor: theme.colors.assumptionContainer,
      change: { value: 3, isPositive: true },
    },
    {
      title: 'Dependencies',
      value: stats.dependencies.open,
      subtitle: `${stats.dependencies.total} total dependencies`,
      icon: 'link-variant',
      color: theme.colors.dependency,
      backgroundColor: theme.colors.dependencyContainer,
      change: { value: -5, isPositive: true }, // Decrease in dependencies is positive
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
          RAID Dashboard
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          Real-time overview of your project risks, assumptions, issues, and dependencies
        </Text>
      </View>

      <View style={styles.statsGrid}>
        {statCards.map((stat, index) => (
          <StatCard
            key={index}
            {...stat}
          />
        ))}
      </View>

      {/* Quick Insights */}
      <View style={[styles.insightsCard, ultraModernStyles.ultraCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.insightsHeader}>
          <WebIcon name="lightbulb" size={20} color={theme.colors.primary} />
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
            AI Insights
          </Text>
        </View>
        
        <View style={styles.insightsList}>
          <View style={styles.insightItem}>
            <View style={[styles.insightDot, { backgroundColor: theme.colors.warning }]} />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, flex: 1 }}>
              High priority risks need immediate attention - 3 items overdue
            </Text>
          </View>
          <View style={styles.insightItem}>
            <View style={[styles.insightDot, { backgroundColor: theme.colors.success }]} />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, flex: 1 }}>
              Dependencies on track - no blocking issues identified
            </Text>
          </View>
          <View style={styles.insightItem}>
            <View style={[styles.insightDot, { backgroundColor: theme.colors.info }]} />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, flex: 1 }}>
              Consider validating 2 assumptions before next milestone
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: ultraModernStyles.spacing.lg,
  },
  header: {
    marginBottom: ultraModernStyles.spacing.md,
  },
  title: {
    fontWeight: '700',
    marginBottom: ultraModernStyles.spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ultraModernStyles.spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: 200,
    padding: ultraModernStyles.spacing.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  accentLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: ultraModernStyles.spacing.md,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: ultraModernStyles.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 32,
    marginBottom: ultraModernStyles.spacing.xs,
  },
  statLabel: {
    fontSize: 14,
    marginBottom: ultraModernStyles.spacing.xs,
  },
  statSubtitle: {
    fontSize: 12,
  },
  insightsCard: {
    padding: ultraModernStyles.spacing.lg,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ultraModernStyles.spacing.sm,
    marginBottom: ultraModernStyles.spacing.md,
  },
  insightsList: {
    gap: ultraModernStyles.spacing.sm,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ultraModernStyles.spacing.sm,
  },
  insightDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

export default DashboardStats;