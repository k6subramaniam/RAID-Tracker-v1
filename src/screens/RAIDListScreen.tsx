import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Pressable,
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
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useStore } from '../store';
import ItemCard from '../components/ItemCard';
import { RootStackParamList } from '../navigation/AppNavigator';
import { 
  sortByPriority, 
  sortBySeverity, 
  sortByDueDate, 
  sortByUpdatedDate 
} from '../utils/helpers';
import { ItemType, ItemStatus, Priority } from '../types';
import { ITEM_TYPES, ITEM_STATUSES, PRIORITIES } from '../constants';

type NavigationProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

type SortOption = 'priority' | 'severity' | 'dueDate' | 'updated';

const RAIDListScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const {
    getFilteredItems,
    filters,
    setFilters,
    resetFilters,
    workstreams,
    owners,
  } = useStore();

  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('priority');
  const [fabOpen, setFabOpen] = useState(false);

  // Get filtered and sorted items
  const items = useMemo(() => {
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

  const toggleFilter = useCallback((
    filterType: 'types' | 'statuses' | 'priorities' | 'workstreams' | 'owners',
    value: string
  ) => {
    const currentValues = filters[filterType] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    setFilters({ [filterType]: newValues });
  }, [filters, setFilters]);

  const toggleQuickFilter = useCallback((
    filterName: 'dueSoon' | 'overdue' | 'recentlyUpdated' | 'aiFlagged'
  ) => {
    setFilters({ [filterName]: !filters[filterName] });
  }, [filters, setFilters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.types.length > 0) count += filters.types.length;
    if (filters.statuses.length > 0) count += filters.statuses.length;
    if (filters.priorities.length > 0) count += filters.priorities.length;
    if (filters.workstreams.length > 0) count += filters.workstreams.length;
    if (filters.owners.length > 0) count += filters.owners.length;
    if (filters.dueSoon) count++;
    if (filters.overdue) count++;
    if (filters.recentlyUpdated) count++;
    if (filters.aiFlagged) count++;
    return count;
  }, [filters]);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="folder-open-outline" size={80} color={theme.colors.onSurfaceVariant} />
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        No RAID items yet
      </Text>
      <Text variant="bodyMedium" style={styles.emptyText}>
        Capture your first risk to get started
      </Text>
      <Button 
        mode="contained" 
        onPress={() => handleCreateItem()}
        style={styles.emptyButton}
      >
        Create First Item
      </Button>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search and filter bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search items..."
          onChangeText={handleSearch}
          value={filters.searchText}
          style={styles.searchBar}
        />
        <View style={styles.filterRow}>
          <IconButton
            icon="filter-variant"
            size={24}
            onPress={() => setFilterModalVisible(true)}
          />
          {activeFilterCount > 0 && (
            <Chip 
              mode="flat" 
              compact 
              style={styles.filterCountChip}
            >
              {activeFilterCount}
            </Chip>
          )}
          
          <Menu
            visible={sortMenuVisible}
            onDismiss={() => setSortMenuVisible(false)}
            anchor={
              <IconButton
                icon="sort"
                size={24}
                onPress={() => setSortMenuVisible(true)}
              />
            }
          >
            <Menu.Item
              onPress={() => {
                setSortBy('priority');
                setSortMenuVisible(false);
              }}
              title="Priority"
              leadingIcon={sortBy === 'priority' ? 'check' : undefined}
            />
            <Menu.Item
              onPress={() => {
                setSortBy('severity');
                setSortMenuVisible(false);
              }}
              title="Severity"
              leadingIcon={sortBy === 'severity' ? 'check' : undefined}
            />
            <Menu.Item
              onPress={() => {
                setSortBy('dueDate');
                setSortMenuVisible(false);
              }}
              title="Due Date"
              leadingIcon={sortBy === 'dueDate' ? 'check' : undefined}
            />
            <Menu.Item
              onPress={() => {
                setSortBy('updated');
                setSortMenuVisible(false);
              }}
              title="Recently Updated"
              leadingIcon={sortBy === 'updated' ? 'check' : undefined}
            />
          </Menu>

          <IconButton
            icon="matrix"
            size={24}
            onPress={() => navigation.navigate('Matrix')}
          />
          
          <IconButton
            icon="robot"
            size={24}
            onPress={() => navigation.navigate('AIAnalysis', {})}
          />
        </View>
      </View>

      {/* Quick filters */}
      <View style={styles.quickFilters}>
        <Chip
          mode={filters.dueSoon ? 'flat' : 'outlined'}
          compact
          onPress={() => toggleQuickFilter('dueSoon')}
          style={styles.quickFilterChip}
        >
          Due Soon
        </Chip>
        <Chip
          mode={filters.overdue ? 'flat' : 'outlined'}
          compact
          onPress={() => toggleQuickFilter('overdue')}
          style={styles.quickFilterChip}
        >
          Overdue
        </Chip>
        <Chip
          mode={filters.recentlyUpdated ? 'flat' : 'outlined'}
          compact
          onPress={() => toggleQuickFilter('recentlyUpdated')}
          style={styles.quickFilterChip}
        >
          Recently Updated
        </Chip>
        <Chip
          mode={filters.aiFlagged ? 'flat' : 'outlined'}
          compact
          onPress={() => toggleQuickFilter('aiFlagged')}
          style={styles.quickFilterChip}
        >
          AI Flagged
        </Chip>
      </View>

      {/* List */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ItemCard
            item={item}
            onPress={() => handleItemPress(item.id)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={items.length === 0 ? styles.emptyListContainer : styles.listContainer}
        ListEmptyComponent={renderEmptyState}
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
              color: theme.colors.risk,
            },
            {
              icon: 'help-circle',
              label: 'Assumption',
              onPress: () => handleCreateItem('Assumption'),
              color: theme.colors.assumption,
            },
            {
              icon: 'alert',
              label: 'Issue',
              onPress: () => handleCreateItem('Issue'),
              color: theme.colors.issue,
            },
            {
              icon: 'link-variant',
              label: 'Dependency',
              onPress: () => handleCreateItem('Dependency'),
              color: theme.colors.dependency,
            },
          ]}
          onStateChange={({ open }) => setFabOpen(open)}
          onPress={() => {
            if (fabOpen) {
              handleCreateItem();
            }
          }}
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
          <View style={styles.filterHeader}>
            <Text variant="titleLarge">Filters</Text>
            <Button onPress={resetFilters}>Clear All</Button>
          </View>
          
          <Divider />
          
          {/* Filter sections would go here - truncated for brevity */}
          
          <Button
            mode="contained"
            onPress={() => setFilterModalVisible(false)}
            style={styles.applyButton}
          >
            Apply Filters
          </Button>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchBar: {
    elevation: 0,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  filterCountChip: {
    marginLeft: -8,
    height: 20,
  },
  quickFilters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
    flexWrap: 'wrap',
  },
  quickFilterChip: {
    height: 28,
  },
  listContainer: {
    paddingBottom: 80,
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
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  applyButton: {
    marginTop: 16,
  },
});

export default RAIDListScreen;