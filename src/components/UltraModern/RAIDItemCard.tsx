import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Chip, useTheme, Badge } from 'react-native-paper';
import WebIcon from '../WebIcon';
import { RAIDItem } from '../../types';
import { ultraModernStyles } from '../../theme/ultraModern';
import { useStore } from '../../store';
import { formatDate, isOverdue } from '../../utils/helpers';

interface RAIDItemCardProps {
  item: RAIDItem;
  onPress: () => void;
  onLongPress?: () => void;
}

const RAIDItemCard: React.FC<RAIDItemCardProps> = ({ item, onPress, onLongPress }) => {
  const theme = useTheme();
  const { workstreams, owners } = useStore();

  const workstream = workstreams.find(ws => ws.id === item.workstream);
  const owner = owners.find(o => o.id === item.owner);
  const isDue = isOverdue(item.dueDate);

  // Get colors based on type
  const getTypeConfig = () => {
    switch (item.type) {
      case 'Risk':
        return {
          color: theme.colors.risk,
          backgroundColor: theme.colors.riskContainer,
          icon: 'alert-circle',
        };
      case 'Issue':
        return {
          color: theme.colors.issue,
          backgroundColor: theme.colors.issueContainer,
          icon: 'alert',
        };
      case 'Assumption':
        return {
          color: theme.colors.assumption,
          backgroundColor: theme.colors.assumptionContainer,
          icon: 'help-circle',
        };
      case 'Dependency':
        return {
          color: theme.colors.dependency,
          backgroundColor: theme.colors.dependencyContainer,
          icon: 'link-variant',
        };
      default:
        return {
          color: theme.colors.onSurfaceVariant,
          backgroundColor: theme.colors.surfaceVariant,
          icon: 'circle',
        };
    }
  };

  const getPriorityColor = () => {
    switch (item.priority) {
      case 'P0': return theme.colors.p0;
      case 'P1': return theme.colors.p1;
      case 'P2': return theme.colors.p2;
      case 'P3': return theme.colors.p3;
      default: return theme.colors.onSurfaceVariant;
    }
  };

  const typeConfig = getTypeConfig();
  const priorityColor = getPriorityColor();

  return (
    <Pressable
      style={[
        styles.container,
        ultraModernStyles.ultraCard,
        { backgroundColor: theme.colors.surfaceContainer }
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      {/* Left accent border */}
      <View style={[styles.accentBorder, { backgroundColor: typeConfig.color }]} />

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.typeAndPriority}>
            <Chip
              mode="flat"
              compact
              style={[
                styles.typeBadge,
                {
                  backgroundColor: typeConfig.backgroundColor,
                  borderColor: `${typeConfig.color}50`,
                }
              ]}
              textStyle={[styles.typeBadgeText, { color: typeConfig.color }]}
              icon={() => <WebIcon name={typeConfig.icon} size={12} color={typeConfig.color} />}
            >
              {item.type.toUpperCase()}
            </Chip>

            <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]}>
              <Text style={styles.priorityText}>{item.priority}</Text>
            </View>
          </View>

          {item.ai && (
            <View style={[styles.aiConfidence, { borderColor: theme.colors.primary }]}>
              <WebIcon name="robot" size={11} color={theme.colors.primary} />
              <Text style={[styles.aiText, { color: theme.colors.primary }]}>
                {Math.round(item.ai.confidence * 100)}%
              </Text>
            </View>
          )}
        </View>

        {/* Title */}
        <Text
          variant="titleMedium"
          numberOfLines={2}
          style={[styles.title, { color: theme.colors.onSurface }]}
        >
          {item.title}
        </Text>

        {/* Meta information */}
        <View style={styles.metaRow}>
          <View style={styles.severityInfo}>
            <WebIcon name="speedometer" size={14} color={priorityColor} />
            <Text style={[styles.severityScore, { color: theme.colors.onSurfaceVariant }]}>
              Severity: {item.severityScore}
            </Text>
          </View>

          {item.dueDate && (
            <View style={styles.dueDateInfo}>
              <WebIcon 
                name="calendar-clock" 
                size={14} 
                color={isDue ? theme.colors.error : theme.colors.onSurfaceVariant} 
              />
              <Text 
                style={[
                  styles.dueDate,
                  { color: isDue ? theme.colors.error : theme.colors.onSurfaceVariant }
                ]}
              >
                {formatDate(item.dueDate)}
              </Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.leftFooter}>
            {workstream && (
              <Chip
                mode="outlined"
                compact
                style={[
                  styles.workstreamChip,
                  { borderColor: `${workstream.color}80` }
                ]}
                textStyle={[styles.workstreamText, { color: workstream.color }]}
              >
                {workstream.label}
              </Chip>
            )}

            <Text 
              variant="bodySmall" 
              style={[styles.statusText, { color: theme.colors.onSurfaceVariant }]}
            >
              {item.status}
            </Text>
          </View>

          <View style={styles.ownerInfo}>
            {owner && (
              <>
                <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
                  <Text style={[styles.avatarText, { color: theme.colors.onPrimary }]}>
                    {owner.initials || owner.name.substring(0, 2).toUpperCase()}
                  </Text>
                </View>
                <Text 
                  variant="bodySmall" 
                  style={[styles.ownerName, { color: theme.colors.onSurfaceVariant }]}
                  numberOfLines={1}
                >
                  {owner.name}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* AI Flags */}
        {item.ai && item.ai.flags && item.ai.flags.length > 0 && (
          <View style={styles.aiFlags}>
            {item.ai.flags.slice(0, 2).map((flag, index) => (
              <Chip
                key={index}
                mode="flat"
                compact
                style={[
                  styles.flagChip,
                  {
                    backgroundColor: flag.severity === 'high' 
                      ? theme.colors.error + '20'
                      : flag.severity === 'medium'
                      ? theme.colors.warning + '20'
                      : theme.colors.info + '20'
                  }
                ]}
                textStyle={{
                  color: flag.severity === 'high' 
                    ? theme.colors.error
                    : flag.severity === 'medium'
                    ? theme.colors.warning
                    : theme.colors.info,
                  fontSize: 10,
                }}
              >
                {flag.message}
              </Chip>
            ))}
            {item.ai.flags.length > 2 && (
              <Text style={[styles.moreFlags, { color: theme.colors.tertiary }]}>
                +{item.ai.flags.length - 2} more
              </Text>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: ultraModernStyles.spacing.md,
    position: 'relative',
    overflow: 'hidden',
  },
  accentBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  content: {
    padding: ultraModernStyles.spacing.md,
    paddingLeft: ultraModernStyles.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: ultraModernStyles.spacing.sm,
  },
  typeAndPriority: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ultraModernStyles.spacing.sm,
  },
  typeBadge: {
    height: 24,
    borderWidth: 1,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.05,
  },
  priorityBadge: {
    paddingHorizontal: ultraModernStyles.spacing.sm,
    paddingVertical: 2,
    borderRadius: ultraModernStyles.radius.sm,
    minWidth: 28,
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  aiConfidence: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: ultraModernStyles.spacing.sm,
    paddingVertical: 2,
    borderRadius: ultraModernStyles.radius.xxl,
    borderWidth: 1,
  },
  aiText: {
    fontSize: 10,
    fontWeight: '500',
  },
  title: {
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: ultraModernStyles.spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: ultraModernStyles.spacing.sm,
  },
  severityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  severityScore: {
    fontSize: 12,
    fontWeight: '500',
  },
  dueDateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueDate: {
    fontSize: 11,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ultraModernStyles.spacing.sm,
    flex: 1,
  },
  workstreamChip: {
    height: 20,
    borderWidth: 1,
  },
  workstreamText: {
    fontSize: 10,
    fontWeight: '500',
  },
  statusText: {
    fontSize: 11,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ultraModernStyles.spacing.sm,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 10,
    fontWeight: '700',
  },
  ownerName: {
    fontSize: 11,
    maxWidth: 80,
  },
  aiFlags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ultraModernStyles.spacing.sm,
    marginTop: ultraModernStyles.spacing.sm,
    flexWrap: 'wrap',
  },
  flagChip: {
    height: 20,
  },
  moreFlags: {
    fontSize: 10,
  },
});

export default RAIDItemCard;