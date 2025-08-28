import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { 
  Text, 
  Searchbar, 
  Chip, 
  useTheme, 
  Button,
  FAB,
  Portal,
  Menu,
  Divider,
} from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import Layout from '../../components/UltraModern/Layout';
import RAIDItemCard from '../../components/UltraModern/RAIDItemCard';
import DashboardStats from '../../components/UltraModern/DashboardStats';
import AIAnalysisCard from '../../components/UltraModern/AIAnalysisCard';
import WebIcon from '../../components/WebIcon';

import { useStore } from '../../store';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { ultraModernStyles } from '../../theme/ultraModern';
import { apiService } from '../../services/api';
import { 
  sortByPriority, 
  sortBySeverity, 
  sortByDueDate, 
  sortByUpdatedDate 
} from '../../utils/helpers';

type NavigationProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;
type SortOption = 'priority' | 'severity' | 'dueDate' | 'updated';

const UltraModernRAIDListScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const {
    getFilteredItems,
    filters,
    setFilters,
    resetFilters,
    loadItems,
    loadDashboardStats,
    isLoading,
    error,
  } = useStore();

  const [sortBy, setSortBy] = useState<SortOption>('priority');
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [showDashboard, setShowDashboard] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load data on mount
  useFocusEffect(
    React.useCallback(() => {
      loadInitialData();
    }, [])
  );

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadItems(),
        loadDashboardStats()
      ]);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadInitialData();
    } finally {
      setRefreshing(false);
    }
  };

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

  const handleItemPress = (itemId: string) => {
    navigation.navigate('ItemDetail', { itemId });
  };

  const handleCreateItem = (type?: string) => {
    setFabOpen(false);
    navigation.navigate('CreateItem', { type });
  };

  const handleAnalyzeText = async (text: string, providers: string[]) => {
    setIsAnalyzing(true);
    try {
      const result = await apiService.analyzeText(text, providers);
      console.log('Analysis result:', result);
      // Here you could create RAID items from the analysis results
      // For now, just log the results
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSearch = (text: string) => {
    setFilters({ searchText: text });
  };

  const toggleQuickFilter = (
    filterName: 'dueSoon' | 'overdue' | 'recentlyUpdated' | 'aiFlagged'
  ) => {
    setFilters({ [filterName]: !filters[filterName] });
  };

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

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {/* Dashboard Stats (conditionally shown) */}
      {showDashboard && <DashboardStats />}

      {/* AI Analysis Card */}
      <AIAnalysisCard 
        onAnalyze={handleAnalyzeText}
        isAnalyzing={isAnalyzing}
      />

      {/* Error Message */}
      {error && (
        <View style={[styles.errorContainer, { backgroundColor: theme.colors.errorContainer }]}>
          <WebIcon name="alert-circle" size={20} color={theme.colors.error} />
          <Text variant="bodyMedium" style={{ color: theme.colors.error, flex: 1 }}>
            {error}
          </Text>
          <Button
            mode="text"
            onPress={() => handleRefresh()}
            textColor={theme.colors.error}
            compact
          >
            Retry
          </Button>
        </View>
      )}

      {/* Search and Filters */}
      <View style={[styles.searchSection, ultraModernStyles.ultraCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.searchHeader}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            📋 RAID Items Management
          </Text>
          
          <View style={styles.viewToggle}>
            <Pressable
              style={[
                styles.viewToggleButton,
                showDashboard && [styles.viewToggleButtonActive, { backgroundColor: theme.colors.primary }]
              ]}
              onPress={() => setShowDashboard(true)}
            >
              <WebIcon 
                name="view-dashboard" 
                size={16} 
                color={showDashboard ? theme.colors.onPrimary : theme.colors.onSurfaceVariant} 
              />
              <Text 
                style={{ 
                  color: showDashboard ? theme.colors.onPrimary : theme.colors.onSurfaceVariant,
                  fontSize: 12,
                  fontWeight: '500',
                }}
              >
                Dashboard
              </Text>
            </Pressable>
            
            <Pressable
              style={[
                styles.viewToggleButton,
                !showDashboard && [styles.viewToggleButtonActive, { backgroundColor: theme.colors.primary }]
              ]}
              onPress={() => setShowDashboard(false)}
            >
              <WebIcon 
                name="format-list-bulleted" 
                size={16} 
                color={!showDashboard ? theme.colors.onPrimary : theme.colors.onSurfaceVariant} 
              />
              <Text 
                style={{ 
                  color: !showDashboard ? theme.colors.onPrimary : theme.colors.onSurfaceVariant,
                  fontSize: 12,
                  fontWeight: '500',
                }}
              >
                List View
              </Text>
            </Pressable>
          </View>
        </View>

        <Searchbar
          placeholder="Search RAID items..."
          onChangeText={handleSearch}
          value={filters.searchText}
          style={[styles.searchBar, { backgroundColor: theme.colors.surfaceVariant }]}
          inputStyle={{ color: theme.colors.onSurface }}
        />

        <View style={styles.filterControls}>
          <View style={styles.filterRow}>
            {/* Quick Filters */}
            <View style={styles.quickFilters}>
              <Chip
                mode={filters.dueSoon ? 'flat' : 'outlined'}
                compact
                onPress={() => toggleQuickFilter('dueSoon')}
                style={styles.quickFilterChip}
                textStyle={styles.quickFilterText}
              >
                Due Soon
              </Chip>
              <Chip
                mode={filters.overdue ? 'flat' : 'outlined'}
                compact
                onPress={() => toggleQuickFilter('overdue')}
                style={styles.quickFilterChip}
                textStyle={styles.quickFilterText}
              >
                Overdue
              </Chip>
              <Chip
                mode={filters.aiFlagged ? 'flat' : 'outlined'}
                compact
                onPress={() => toggleQuickFilter('aiFlagged')}
                style={styles.quickFilterChip}
                textStyle={styles.quickFilterText}
              >
                AI Flagged
              </Chip>
            </View>

            {/* Sort Menu */}
            <Menu
              visible={sortMenuVisible}
              onDismiss={() => setSortMenuVisible(false)}
              anchor={
                <Button
                  mode="contained-tonal"
                  onPress={() => setSortMenuVisible(true)}
                  style={ultraModernStyles.secondaryButton}
                  contentStyle={styles.buttonContent}
                  icon="sort"
                  compact
                >
                  Sort
                </Button>
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
                title="Updated"
                leadingIcon={sortBy === 'updated' ? 'check' : undefined}
              />
            </Menu>
          </View>

          {/* Active Filter Count */}
          {activeFilterCount > 0 && (
            <View style={styles.activeFiltersRow}>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''}
              </Text>
              <Button
                mode="text"
                onPress={resetFilters}
                compact
                textColor={theme.colors.primary}
              >
                Clear All
              </Button>
            </View>
          )}
        </View>
      </View>

      {/* Items Header */}
      <View style={styles.itemsHeader}>
        <Text variant="titleMedium" style={[styles.itemsTitle, { color: theme.colors.onSurface }]}>
          Items ({items.length})
        </Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <WebIcon name="folder-open-outline" size={80} color={theme.colors.onSurfaceVariant} />
      <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
        No RAID items found
      </Text>
      <Text variant="bodyMedium" style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
        Create your first item to get started with risk management
      </Text>
      <Button 
        mode="contained" 
        onPress={() => handleCreateItem()}
        style={[ultraModernStyles.primaryButton, styles.emptyButton]}
        icon="plus"
      >
        Create First Item
      </Button>
    </View>
  );

  return (
    <Layout
      title="RAID Management"
      subtitle="AI-enhanced risk, assumption, issue & dependency tracking"
      rightActions={
        <Button
          mode="contained"
          onPress={() => navigation.navigate('AIAnalysis', {})}
          style={ultraModernStyles.primaryButton}
          icon="robot"
          compact
        >
          AI Analysis
        </Button>
      }
    >
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RAIDItemCard
            item={item}
            onPress={() => handleItemPress(item.id)}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={items.length === 0 ? styles.emptyListContainer : styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
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
              style: { backgroundColor: theme.colors.riskContainer },
            },
            {
              icon: 'help-circle',
              label: 'Assumption',
              onPress: () => handleCreateItem('Assumption'),
              color: theme.colors.assumption,
              style: { backgroundColor: theme.colors.assumptionContainer },
            },
            {
              icon: 'alert',
              label: 'Issue',
              onPress: () => handleCreateItem('Issue'),
              color: theme.colors.issue,
              style: { backgroundColor: theme.colors.issueContainer },
            },
            {
              icon: 'link-variant',
              label: 'Dependency',
              onPress: () => handleCreateItem('Dependency'),
              color: theme.colors.dependency,
              style: { backgroundColor: theme.colors.dependencyContainer },
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
          fabStyle={[{ backgroundColor: theme.colors.primary }]}
        />
      </Portal>
    </Layout>
  );
};

const styles = StyleSheet.create({
  headerContent: {
    gap: ultraModernStyles.spacing.lg,
    marginBottom: ultraModernStyles.spacing.lg,
  },
  searchSection: {
    padding: ultraModernStyles.spacing.lg,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: ultraModernStyles.spacing.md,
  },
  sectionTitle: {
    fontWeight: '600',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: ultraModernStyles.radius.xxl,
    padding: 2,
  },
  viewToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ultraModernStyles.spacing.xs,
    paddingHorizontal: ultraModernStyles.spacing.md,
    paddingVertical: ultraModernStyles.spacing.sm,
    borderRadius: ultraModernStyles.radius.xl,
  },
  viewToggleButtonActive: {
    // Active styles applied inline
  },
  searchBar: {
    elevation: 0,
    marginBottom: ultraModernStyles.spacing.md,
  },
  filterControls: {
    gap: ultraModernStyles.spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickFilters: {
    flexDirection: 'row',
    gap: ultraModernStyles.spacing.sm,
    flex: 1,
  },
  quickFilterChip: {
    height: 28,
  },
  quickFilterText: {
    fontSize: 11,
  },
  buttonContent: {
    paddingHorizontal: ultraModernStyles.spacing.sm,
  },
  activeFiltersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemsHeader: {
    marginBottom: ultraModernStyles.spacing.sm,
  },
  itemsTitle: {
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 100, // Space for FAB
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: ultraModernStyles.spacing.xxl,
    gap: ultraModernStyles.spacing.md,
  },
  emptyTitle: {
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: ultraModernStyles.spacing.md,
  },
  fab: {
    position: 'absolute',
    margin: ultraModernStyles.spacing.lg,
    right: 0,
    bottom: 0,
  },
});

export default UltraModernRAIDListScreen;