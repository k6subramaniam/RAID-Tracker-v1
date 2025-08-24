import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Chip,
  Button,
  useTheme,
  IconButton,
  List,
  Divider,
  Portal,
  Dialog,
  TextInput,
  Menu,
  FAB,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useStore } from '../store';
import { RootStackParamList } from '../navigation/AppNavigator';
import {
  getTypeColor,
  getPriorityColor,
  getStatusColor,
  formatDate,
  formatDateTime,
  getRelativeTime,
  isOverdue,
  calculateSeverityScore,
} from '../utils/helpers';
import { ITEM_STATUSES, PRIORITIES } from '../constants';

type NavigationProp = StackNavigationProp<RootStackParamList, 'ItemDetail'>;
type RoutePropType = RouteProp<RootStackParamList, 'ItemDetail'>;

const ItemDetailScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { items, updateItem, deleteItem, workstreams, owners } = useStore();

  const [menuVisible, setMenuVisible] = useState(false);
  const [statusDialogVisible, setStatusDialogVisible] = useState(false);
  const [priorityDialogVisible, setPriorityDialogVisible] = useState(false);
  const [noteDialogVisible, setNoteDialogVisible] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [selectedTab, setSelectedTab] = useState<'overview' | 'ai' | 'history'>('overview');

  const item = useMemo(
    () => items.find(i => i.id === route.params.itemId),
    [items, route.params.itemId]
  );

  const workstream = useMemo(
    () => workstreams.find(ws => ws.id === item?.workstream),
    [workstreams, item?.workstream]
  );

  const owner = useMemo(
    () => owners.find(o => o.id === item?.owner),
    [owners, item?.owner]
  );

  const severity = useMemo(
    () => item ? calculateSeverityScore(item.impact, item.likelihood) : null,
    [item]
  );

  const handleStatusChange = useCallback((newStatus: string) => {
    if (item) {
      updateItem(item.id, { status: newStatus as any });
      setStatusDialogVisible(false);
    }
  }, [item, updateItem]);

  const handlePriorityChange = useCallback((newPriority: string) => {
    if (item) {
      updateItem(item.id, { priority: newPriority as any });
      setPriorityDialogVisible(false);
    }
  }, [item, updateItem]);

  const handleAddNote = useCallback(() => {
    if (item && newNote.trim()) {
      const newHistory = {
        id: Date.now().toString(),
        timestamp: new Date(),
        actor: 'User',
        action: 'Added note',
        note: newNote,
      };
      updateItem(item.id, {
        history: [...item.history, newHistory],
      });
      setNewNote('');
      setNoteDialogVisible(false);
    }
  }, [item, newNote, updateItem]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (item) {
              deleteItem(item.id);
              navigation.goBack();
            }
          },
        },
      ]
    );
  }, [item, deleteItem, navigation]);

  const handleRunAIAnalysis = useCallback(() => {
    if (item) {
      navigation.navigate('AIAnalysis', { itemIds: [item.id] });
    }
  }, [item, navigation]);

  if (!item) {
    return (
      <View style={styles.emptyContainer}>
        <Text>Item not found</Text>
      </View>
    );
  }

  const renderOverviewTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Description */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Description
          </Text>
          <Text variant="bodyMedium" style={styles.description}>
            {item.description}
          </Text>
        </Card.Content>
      </Card>

      {/* Impact & Assessment */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Impact Assessment
          </Text>
          
          <View style={styles.assessmentRow}>
            <View style={styles.assessmentItem}>
              <Text variant="labelSmall" style={styles.assessmentLabel}>
                Impact
              </Text>
              <Chip mode="flat" style={styles.assessmentChip}>
                {item.impact}
              </Chip>
            </View>
            
            <View style={styles.assessmentItem}>
              <Text variant="labelSmall" style={styles.assessmentLabel}>
                Likelihood
              </Text>
              <Chip mode="flat" style={styles.assessmentChip}>
                {item.likelihood}
              </Chip>
            </View>
            
            <View style={styles.assessmentItem}>
              <Text variant="labelSmall" style={styles.assessmentLabel}>
                Severity
              </Text>
              <View style={styles.severityContainer}>
                <Text
                  variant="headlineSmall"
                  style={[styles.severityScore, { color: severity?.color }]}
                >
                  {item.severityScore}
                </Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Governance */}
      {item.governanceTags.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Governance Tags
            </Text>
            <View style={styles.tagContainer}>
              {item.governanceTags.map(tag => (
                <Chip key={tag} mode="outlined" style={styles.tag}>
                  {tag}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* References */}
      {item.references.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              References
            </Text>
            {item.references.map((ref, index) => (
              <List.Item
                key={index}
                title={ref}
                left={props => <List.Icon {...props} icon="link" />}
                onPress={() => {/* Open URL */}}
              />
            ))}
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );

  const renderAITab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {item.ai ? (
        <>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                AI Analysis
              </Text>
              <Text variant="bodyMedium">{item.ai.analysis}</Text>
              
              <View style={styles.aiMetrics}>
                <Chip mode="flat" style={styles.confidenceChip}>
                  Confidence: {(item.ai.confidence * 100).toFixed(0)}%
                </Chip>
                <Text variant="labelSmall" style={styles.aiTimestamp}>
                  {getRelativeTime(item.ai.lastAnalyzedAt)}
                </Text>
              </View>
            </Card.Content>
          </Card>

          {item.ai.suggestedPriority !== item.priority && (
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  AI Suggestions
                </Text>
                <List.Item
                  title="Suggested Priority"
                  description={item.ai.suggestedPriority}
                  left={props => <List.Icon {...props} icon="flag" />}
                  right={() => (
                    <Button
                      mode="contained-tonal"
                      onPress={() => handlePriorityChange(item.ai!.suggestedPriority)}
                    >
                      Apply
                    </Button>
                  )}
                />
              </Card.Content>
            </Card>
          )}

          {item.ai.flags && item.ai.flags.length > 0 && (
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Data Quality Flags
                </Text>
                {item.ai.flags.map((flag, index) => (
                  <List.Item
                    key={index}
                    title={flag.message}
                    description={flag.field}
                    left={props => (
                      <List.Icon
                        {...props}
                        icon="alert"
                        color={
                          flag.severity === 'high'
                            ? theme.colors.error
                            : flag.severity === 'medium'
                            ? theme.colors.warning
                            : theme.colors.info
                        }
                      />
                    )}
                  />
                ))}
              </Card.Content>
            </Card>
          )}
        </>
      ) : (
        <Card style={styles.card}>
          <Card.Content style={styles.emptyAI}>
            <Icon name="robot-outline" size={48} color={theme.colors.onSurfaceVariant} />
            <Text variant="titleMedium" style={styles.emptyAITitle}>
              No AI Analysis Yet
            </Text>
            <Text variant="bodyMedium" style={styles.emptyAIText}>
              Run AI analysis to get insights and recommendations
            </Text>
            <Button mode="contained" onPress={handleRunAIAnalysis} style={styles.analyzeButton}>
              Analyze with AI
            </Button>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );

  const renderHistoryTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Card style={styles.card}>
        <Card.Content>
          {item.history.length > 0 ? (
            item.history.map((entry, index) => (
              <View key={entry.id}>
                <List.Item
                  title={entry.action}
                  description={`${entry.actor} • ${formatDateTime(entry.timestamp)}`}
                  left={props => <List.Icon {...props} icon="history" />}
                />
                {entry.note && (
                  <Text variant="bodySmall" style={styles.historyNote}>
                    {entry.note}
                  </Text>
                )}
                {index < item.history.length - 1 && <Divider />}
              </View>
            ))
          ) : (
            <Text variant="bodyMedium" style={styles.emptyHistory}>
              No history available
            </Text>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Chip
              mode="flat"
              style={[styles.typeChip, { backgroundColor: getTypeColor(item.type) + '20' }]}
              textStyle={{ color: getTypeColor(item.type) }}
            >
              {item.type}
            </Chip>
            <Chip
              mode="flat"
              style={[styles.priorityChip, { backgroundColor: getPriorityColor(item.priority) }]}
              textStyle={{ color: '#FFFFFF' }}
            >
              {item.priority}
            </Chip>
          </View>
          
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon="dots-vertical"
                onPress={() => setMenuVisible(true)}
              />
            }
          >
            <Menu.Item onPress={() => {}} title="Edit" leadingIcon="pencil" />
            <Menu.Item onPress={() => {}} title="Duplicate" leadingIcon="content-copy" />
            <Menu.Item onPress={() => {}} title="Archive" leadingIcon="archive" />
            <Divider />
            <Menu.Item
              onPress={handleDelete}
              title="Delete"
              leadingIcon="delete"
              titleStyle={{ color: theme.colors.error }}
            />
          </Menu>
        </View>

        <Text variant="headlineSmall" style={styles.title}>
          {item.title}
        </Text>

        <View style={styles.metaInfo}>
          <Chip
            mode="flat"
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) + '20' }]}
            textStyle={{ color: getStatusColor(item.status) }}
          >
            {item.status}
          </Chip>
          
          {workstream && (
            <Chip
              mode="outlined"
              style={[styles.workstreamChip, { borderColor: workstream.color }]}
              textStyle={{ color: workstream.color }}
            >
              {workstream.label}
            </Chip>
          )}
          
          {owner && (
            <Chip mode="outlined" style={styles.ownerChip}>
              {owner.name}
            </Chip>
          )}
        </View>

        {item.dueDate && (
          <View style={styles.dueDateContainer}>
            <Icon
              name="calendar-clock"
              size={16}
              color={isOverdue(item.dueDate) ? theme.colors.error : theme.colors.onSurfaceVariant}
            />
            <Text
              variant="bodySmall"
              style={{
                color: isOverdue(item.dueDate) ? theme.colors.error : theme.colors.onSurfaceVariant,
              }}
            >
              {isOverdue(item.dueDate) ? 'Overdue: ' : 'Due: '}
              {formatDate(item.dueDate)}
            </Text>
          </View>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <Chip
          mode={selectedTab === 'overview' ? 'flat' : 'outlined'}
          onPress={() => setSelectedTab('overview')}
          style={styles.tab}
        >
          Overview
        </Chip>
        <Chip
          mode={selectedTab === 'ai' ? 'flat' : 'outlined'}
          onPress={() => setSelectedTab('ai')}
          style={styles.tab}
        >
          AI Insights
        </Chip>
        <Chip
          mode={selectedTab === 'history' ? 'flat' : 'outlined'}
          onPress={() => setSelectedTab('history')}
          style={styles.tab}
        >
          History
        </Chip>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {selectedTab === 'overview' && renderOverviewTab()}
        {selectedTab === 'ai' && renderAITab()}
        {selectedTab === 'history' && renderHistoryTab()}
      </View>

      {/* Action FAB */}
      <FAB
        icon="pencil"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => {}}
      />

      {/* Status Change Dialog */}
      <Portal>
        <Dialog visible={statusDialogVisible} onDismiss={() => setStatusDialogVisible(false)}>
          <Dialog.Title>Change Status</Dialog.Title>
          <Dialog.Content>
            {ITEM_STATUSES.map(status => (
              <List.Item
                key={status}
                title={status}
                onPress={() => handleStatusChange(status)}
                left={props => (
                  <List.Icon
                    {...props}
                    icon={item.status === status ? 'check-circle' : 'circle-outline'}
                  />
                )}
              />
            ))}
          </Dialog.Content>
        </Dialog>
      </Portal>

      {/* Priority Change Dialog */}
      <Portal>
        <Dialog visible={priorityDialogVisible} onDismiss={() => setPriorityDialogVisible(false)}>
          <Dialog.Title>Change Priority</Dialog.Title>
          <Dialog.Content>
            {PRIORITIES.map(priority => (
              <List.Item
                key={priority}
                title={priority}
                onPress={() => handlePriorityChange(priority)}
                left={props => (
                  <List.Icon
                    {...props}
                    icon={item.priority === priority ? 'check-circle' : 'circle-outline'}
                  />
                )}
              />
            ))}
          </Dialog.Content>
        </Dialog>
      </Portal>

      {/* Add Note Dialog */}
      <Portal>
        <Dialog visible={noteDialogVisible} onDismiss={() => setNoteDialogVisible(false)}>
          <Dialog.Title>Add Note</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Note"
              value={newNote}
              onChangeText={setNewNote}
              mode="outlined"
              multiline
              numberOfLines={4}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setNoteDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleAddNote}>Add</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    gap: 8,
  },
  typeChip: {
    height: 28,
  },
  priorityChip: {
    height: 28,
  },
  title: {
    marginBottom: 12,
  },
  metaInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  statusChip: {
    height: 24,
  },
  workstreamChip: {
    height: 24,
  },
  ownerChip: {
    height: 24,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  tab: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  description: {
    lineHeight: 22,
  },
  assessmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  assessmentItem: {
    alignItems: 'center',
  },
  assessmentLabel: {
    marginBottom: 4,
    opacity: 0.7,
  },
  assessmentChip: {
    height: 28,
  },
  severityContainer: {
    alignItems: 'center',
  },
  severityScore: {
    fontWeight: '700',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    height: 28,
  },
  emptyAI: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyAITitle: {
    marginTop: 12,
    marginBottom: 8,
  },
  emptyAIText: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 16,
  },
  analyzeButton: {
    marginTop: 8,
  },
  aiMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  confidenceChip: {
    height: 24,
  },
  aiTimestamp: {
    opacity: 0.7,
  },
  historyNote: {
    marginLeft: 56,
    marginBottom: 12,
    opacity: 0.7,
  },
  emptyHistory: {
    textAlign: 'center',
    opacity: 0.7,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default ItemDetailScreen;