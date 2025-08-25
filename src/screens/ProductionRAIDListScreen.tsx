import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Pressable,
  Alert,
} from 'react-native';
import {
  FAB,
  Searchbar,
  Chip,
  useTheme,
  Portal,
  Modal,
  Text,
  IconButton,
  Menu,
  Divider,
  Button,
  Card,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store';
import WebIcon from '../components/WebIcon';
import { apiService } from '../services/api';
import {
  sortByPriority,
  sortBySeverity,
  sortByDueDate,
  sortByUpdatedDate,
  getTypeColor,
  getPriorityColor,
  getStatusColor,
  formatDate,
  isOverdue,
} from '../utils/helpers';

type SortOption = 'priority' | 'severity' | 'dueDate' | 'updated';

const ProductionRAIDListScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const {
    getFilteredItems,
    filters,
    setFilters,
    resetFilters,
    workstreams,
    owners,
    addItem,
    items,
  } = useStore();

  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('priority');
  const [fabOpen, setFabOpen] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  // Get filtered and sorted items
  const filteredItems = useMemo(() => {
    let filtered = getFilteredItems();
    
    switch (sortBy) {
      case 'priority':
        return sortByPriority(filtered);
      case 'severity':
        return sortBySeverity(filtered);
      case 'dueDate':
        return sortByDueDate(filtered);
      case 'updated':
        return sortByUpdatedDate(filtered);
      default:
        return filtered;
    }
  }, [getFilteredItems, sortBy]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleItemPress = useCallback((itemId: string) => {
    navigation.navigate('ItemDetail', { itemId });
  }, [navigation]);

  const handleCreateItem = useCallback((type?: string) => {
    setFabOpen(false);
    navigation.navigate('CreateItem', { type });
  }, [navigation]);

  const handleSearch = useCallback((text: string) => {
    setFilters({ searchText: text });
  }, [setFilters]);

  const handleQuickAIAnalysis = async () => {
    if (items.length === 0) {
      Alert.alert('No Items', 'Please add some RAID items first before running AI analysis.');
      return;
    }

    setAiAnalyzing(true);
    try {
      const results = await apiService.batchAnalyze(items.slice(0, 3), 'analysis'); // Analyze first 3 items
      Alert.alert(
        'AI Analysis Complete',
        `Analyzed ${results.length} items. Check individual items for AI insights.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Analysis Error', 'Failed to connect to AI service. Please try again later.');
    }
    setAiAnalyzing(false);
  };

  const toggleQuickFilter = useCallback((
    filterName: 'dueSoon' | 'overdue' | 'recentlyUpdated' | 'aiFlagged'
  ) => {
    setFilters({ [filterName]: !filters[filterName] });
  }, [filters, setFilters]);

  const renderItemCard = useCallback(({ item }) => {
    const workstream = workstreams.find(ws => ws.id === item.workstream);
    const owner = owners.find(o => o.id === item.owner);
    const typeColor = getTypeColor(item.type);
    const priorityColor = getPriorityColor(item.priority);
    const statusColor = getStatusColor(item.status);
    const isDue = isOverdue(item.dueDate);

    return (
      <Pressable onPress={() => handleItemPress(item.id)}>
        <Card style={[styles.itemCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            {/* Header row */}
            <View style={styles.itemHeader}>
              <Chip
                mode="flat"
                compact
                style={[styles.typeChip, { backgroundColor: typeColor + '20' }]}
                textStyle={{ color: typeColor }}
              >
                {item.type}
              </Chip>
              <Chip
                mode="flat"
                compact
                style={[styles.priorityChip, { backgroundColor: priorityColor }]}
                textStyle={{ color: '#FFFFFF' }}
              >
                {item.priority}
              </Chip>
            </View>

            {/* Title */}
            <Text
              variant="titleMedium"
              style={[styles.itemTitle, { color: theme.colors.onSurface }]}
              numberOfLines={2}
            >
              {item.title}
            </Text>

            {/* Status and meta */}
            <View style={styles.itemMeta}>
              <Chip
                mode="outlined"
                compact
                style={[styles.statusChip, { borderColor: statusColor }]}
                textStyle={{ color: statusColor }}
              >
                {item.status}
              </Chip>
              
              {workstream && (
                <Chip
                  mode="outlined"
                  compact
                  style={[styles.workstreamChip, { borderColor: workstream.color }]}
                  textStyle={{ color: workstream.color }}
                >
                  {workstream.label}
                </Chip>
              )}
            </View>

            {/* Owner and due date */}
            <View style={styles.itemFooter}>
              {owner && (
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  👤 {owner.name}
                </Text>
              )}
              {item.dueDate && (
                <Text
                  variant="bodySmall"
                  style={{
                    color: isDue ? theme.colors.error : theme.colors.onSurfaceVariant,
                  }}
                >
                  📅 {isDue ? 'Overdue: ' : 'Due: '}{formatDate(item.dueDate)}
                </Text>
              )}
            </View>

            {/* AI indicator */}
            {item.ai && (
              <View style={styles.aiIndicator}>
                <Text style={{ color: theme.colors.primary, fontSize: 12 }}>
                  🤖 AI Analyzed ({Math.round((item.ai.confidence || 0) * 100)}% confidence)
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </Pressable>
    );
  }, [workstreams, owners, theme, handleItemPress]);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <WebIcon name="folder-open-outline" size={80} color={theme.colors.onSurfaceVariant} />
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        No RAID items yet
      </Text>
      <Text variant="bodyMedium" style={styles.emptyText}>
        Capture your first risk, assumption, issue, or dependency to get started
      </Text>
      <Button 
        mode="contained" 
        onPress={() => handleCreateItem()}
        style={styles.emptyButton}
        icon="plus"
      >
        Create First Item
      </Button>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          🛡️ RAIDMASTER
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {filteredItems.length} items • AI-Enhanced RAID Management
        </Text>
      </View>

      {/* Search and controls */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search items..."
          onChangeText={handleSearch}
          value={filters.searchText}
          style={styles.searchBar}
          icon="magnify"
        />
        
        <View style={styles.controlsRow}>
          <Button
            mode="outlined"
            compact
            onPress={() => setFilterModalVisible(true)}
            icon="filter-variant"
          >
            Filters
          </Button>
          
          <Menu
            visible={sortMenuVisible}
            onDismiss={() => setSortMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                compact
                onPress={() => setSortMenuVisible(true)}
                icon="sort"
              >
                Sort: {sortBy}
              </Button>
            }
          >
            <Menu.Item
              onPress={() => { setSortBy('priority'); setSortMenuVisible(false); }}
              title="Priority"
            />
            <Menu.Item
              onPress={() => { setSortBy('severity'); setSortMenuVisible(false); }}
              title="Severity"
            />
            <Menu.Item
              onPress={() => { setSortBy('dueDate'); setSortMenuVisible(false); }}
              title="Due Date"
            />
          </Menu>

          <Button
            mode={aiAnalyzing ? "outlined" : "contained-tonal"}
            compact
            onPress={handleQuickAIAnalysis}
            loading={aiAnalyzing}
            disabled={aiAnalyzing}
            icon="robot"
          >
            {aiAnalyzing ? 'Analyzing...' : 'AI Analysis'}
          </Button>
        </View>
      </View>

      {/* Quick filters */}
      <View style={styles.quickFilters}>
        {[
          { key: 'dueSoon', label: 'Due Soon', icon: '⏰' },
          { key: 'overdue', label: 'Overdue', icon: '🚨' },
          { key: 'recentlyUpdated', label: 'Recent', icon: '🔄' },
          { key: 'aiFlagged', label: 'AI Flagged', icon: '🤖' },
        ].map((filter) => (
          <Chip
            key={filter.key}
            mode={filters[filter.key] ? 'flat' : 'outlined'}
            compact
            onPress={() => toggleQuickFilter(filter.key as any)}
            style={styles.quickFilterChip}
          >
            {filter.icon} {filter.label}
          </Chip>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItemCard}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={filteredItems.length === 0 ? styles.emptyListContainer : styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <Portal>
        <FAB.Group
          open={fabOpen}
          icon={fabOpen ? 'close' : 'plus'}
          actions={[
            {
              icon: 'alert-circle',
              label: 'Risk',
              onPress: () => handleCreateItem('Risk'),
              color: theme.colors.error,
            },
            {
              icon: 'help-circle',
              label: 'Assumption',
              onPress: () => handleCreateItem('Assumption'),
              color: theme.colors.primary,
            },
            {
              icon: 'alert',
              label: 'Issue',
              onPress: () => handleCreateItem('Issue'),
              color: '#F97316',
            },
            {
              icon: 'link-variant',
              label: 'Dependency',
              onPress: () => handleCreateItem('Dependency'),
              color: '#8B5CF6',
            },
          ]}
          onStateChange={({ open }) => setFabOpen(open)}
          visible
          style={styles.fab}
        />
      </Portal>

      {/* Filter Modal */}
      <Portal>
        <Modal
          visible={filterModalVisible}
          onDismiss={() => setFilterModalVisible(false)}
          contentContainerStyle={[
            styles.filterModal,
            { backgroundColor: theme.colors.surface }
          ]}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>Filters</Text>
          
          <View style={styles.filterSection}>
            <Text variant="titleMedium">Quick Actions</Text>
            <View style={styles.filterButtons}>
              <Button mode="outlined" onPress={resetFilters}>
                Clear All
              </Button>
              <Button 
                mode="contained" 
                onPress={() => setFilterModalVisible(false)}
              >
                Apply
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchBar: {
    elevation: 0,
    marginBottom: 12,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  quickFilters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
    flexWrap: 'wrap',
  },
  quickFilterChip: {
    height: 32,
  },
  listContainer: {
    paddingBottom: 100,
  },
  emptyListContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    marginTop: 8,
  },
  itemCard: {
    marginHorizontal: 16,
    marginVertical: 6,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeChip: {
    height: 24,
  },
  priorityChip: {
    height: 24,
  },
  itemTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  itemMeta: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  statusChip: {
    height: 24,
  },
  workstreamChip: {
    height: 24,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiIndicator: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  filterModal: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalTitle: {
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
});

export default ProductionRAIDListScreen;