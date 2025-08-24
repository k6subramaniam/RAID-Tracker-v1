import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Card, Text, Chip, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RAIDItem } from '../types';
import { 
  getTypeColor, 
  getPriorityColor, 
  getStatusColor, 
  truncateText, 
  formatDate,
  isOverdue 
} from '../utils/helpers';
import { useStore } from '../store';

interface ItemCardProps {
  item: RAIDItem;
  onPress: () => void;
  onLongPress?: () => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onPress, onLongPress }) => {
  const theme = useTheme();
  const { workstreams, owners } = useStore();
  
  const workstream = workstreams.find(ws => ws.id === item.workstream);
  const owner = owners.find(o => o.id === item.owner);
  const typeColor = getTypeColor(item.type);
  const priorityColor = getPriorityColor(item.priority);
  const statusColor = getStatusColor(item.status);
  const isDue = isOverdue(item.dueDate);

  return (
    <Pressable onPress={onPress} onLongPress={onLongPress}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          {/* Header row with type and priority */}
          <View style={styles.headerRow}>
            <View style={[styles.typeBadge, { backgroundColor: typeColor + '20' }]}>
              <Text style={[styles.typeText, { color: typeColor }]}>
                {item.type}
              </Text>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]}>
              <Text style={styles.priorityText}>{item.priority}</Text>
            </View>
          </View>

          {/* Title */}
          <Text
            style={[styles.title, { color: theme.colors.onSurface }]}
            numberOfLines={1}
          >
            {item.title}
          </Text>

          {/* Status and severity */}
          <View style={styles.statusRow}>
            <Chip
              mode="flat"
              compact
              style={[styles.statusChip, { backgroundColor: statusColor + '20' }]}
              textStyle={[styles.statusText, { color: statusColor }]}
            >
              {item.status}
            </Chip>
            
            <View style={styles.severityIndicator}>
              <Icon name="alert-circle" size={16} color={priorityColor} />
              <Text style={[styles.severityScore, { color: theme.colors.onSurfaceVariant }]}>
                {item.severityScore}
              </Text>
            </View>
          </View>

          {/* Meta information */}
          <View style={styles.metaRow}>
            {workstream && (
              <Chip
                mode="outlined"
                compact
                style={[styles.metaChip, { borderColor: workstream.color }]}
                textStyle={[styles.metaText, { color: workstream.color }]}
              >
                {workstream.label}
              </Chip>
            )}
            
            {owner && (
              <View style={styles.ownerChip}>
                <View style={[styles.ownerAvatar, { backgroundColor: theme.colors.primaryContainer }]}>
                  <Text style={[styles.ownerInitials, { color: theme.colors.onPrimaryContainer }]}>
                    {owner.initials || owner.name.substring(0, 2).toUpperCase()}
                  </Text>
                </View>
                <Text style={[styles.ownerName, { color: theme.colors.onSurfaceVariant }]}>
                  {owner.name}
                </Text>
              </View>
            )}
          </View>

          {/* Due date if present */}
          {item.dueDate && (
            <View style={styles.dueDateRow}>
              <Icon 
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
                {isDue ? 'Overdue: ' : 'Due: '}{formatDate(item.dueDate)}
              </Text>
            </View>
          )}

          {/* AI indicator if analyzed */}
          {item.ai && (
            <View style={styles.aiIndicator}>
              <Icon name="robot" size={14} color={theme.colors.primary} />
              <Text style={[styles.aiText, { color: theme.colors.primary }]}>
                AI Analyzed
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusChip: {
    height: 24,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  severityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  severityScore: {
    fontSize: 14,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  metaChip: {
    height: 24,
    borderWidth: 1,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '500',
  },
  ownerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ownerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerInitials: {
    fontSize: 10,
    fontWeight: '600',
  },
  ownerName: {
    fontSize: 12,
  },
  dueDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  dueDate: {
    fontSize: 12,
  },
  aiIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  aiText: {
    fontSize: 11,
    fontWeight: '500',
  },
});

export default ItemCard;