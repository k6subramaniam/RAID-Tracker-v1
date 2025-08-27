import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { 
  Text, 
  useTheme, 
  Button, 
  Chip,
  Divider,
  ProgressBar,
  Portal,
  Modal,
  TextInput,
} from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import Layout from '../../components/UltraModern/Layout';
import WebIcon from '../../components/WebIcon';
import { useStore } from '../../store';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { ultraModernStyles } from '../../theme/ultraModern';
import { apiService } from '../../services/api';
import { RAIDItem, HistoryEntry } from '../../types';
import { formatDate } from '../../utils/helpers';

type ItemDetailRouteProp = RouteProp<RootStackParamList, 'ItemDetail'>;
type ItemDetailNavigationProp = StackNavigationProp<RootStackParamList, 'ItemDetail'>;

const UltraModernItemDetailScreen: React.FC = () => {
  const theme = useTheme();
  const route = useRoute<ItemDetailRouteProp>();
  const navigation = useNavigation<ItemDetailNavigationProp>();
  const { itemId } = route.params;
  
  const { items, updateItem, deleteItem, workstreams, owners } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'ai' | 'history'>('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const item = items.find(i => i.id === itemId);
  
  if (!item) {
    return (
      <Layout title="Item Not Found" showBackButton>
        <View style={styles.notFoundContainer}>
          <WebIcon name="alert-circle-outline" size={80} color={theme.colors.onSurfaceVariant} />
          <Text variant="headlineSmall" style={{ color: theme.colors.onSurface, marginTop: 16 }}>
            Item Not Found
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 8 }}>
            The requested RAID item could not be found.
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.goBack()}
            style={[ultraModernStyles.primaryButton, { marginTop: 20 }]}
          >
            Go Back
          </Button>
        </View>
      </Layout>
    );
  }

  const workstream = workstreams.find(ws => ws.id === item.workstream);
  const owner = owners.find(o => o.id === item.owner);

  const getTypeConfig = () => {
    switch (item.type) {
      case 'Risk':
        return { color: theme.colors.risk, backgroundColor: theme.colors.riskContainer, icon: 'alert-circle' };
      case 'Issue':
        return { color: theme.colors.issue, backgroundColor: theme.colors.issueContainer, icon: 'alert' };
      case 'Assumption':
        return { color: theme.colors.assumption, backgroundColor: theme.colors.assumptionContainer, icon: 'help-circle' };
      case 'Dependency':
        return { color: theme.colors.dependency, backgroundColor: theme.colors.dependencyContainer, icon: 'link-variant' };
      default:
        return { color: theme.colors.onSurfaceVariant, backgroundColor: theme.colors.surfaceVariant, icon: 'circle' };
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

  const handleAnalyzeWithAI = async () => {
    setIsAnalyzing(true);
    try {
      const analysis = await apiService.analyzeItem(item);
      updateItem(item.id, { ai: analysis });
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const typeConfig = getTypeConfig();
  const priorityColor = getPriorityColor();

  const renderItemHeader = () => (
    <View style={[styles.itemHeader, ultraModernStyles.ultraCard, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.headerAccent, { backgroundColor: typeConfig.color }]} />
      
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View style={styles.typeAndPriority}>
            <Chip
              mode="flat"
              style={[styles.typeChip, { backgroundColor: typeConfig.backgroundColor }]}
              textStyle={{ color: typeConfig.color, fontWeight: '600', fontSize: 12 }}
              icon={() => <WebIcon name={typeConfig.icon} size={14} color={typeConfig.color} />}
            >
              {item.type.toUpperCase()}
            </Chip>
            
            <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]}>
              <Text style={styles.priorityText}>{item.priority}</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <Button
              mode="contained-tonal"
              onPress={() => setEditModalVisible(true)}
              style={ultraModernStyles.secondaryButton}
              icon="pencil"
              compact
            >
              Edit
            </Button>
          </View>
        </View>

        <Text variant="headlineSmall" style={[styles.itemTitle, { color: theme.colors.onSurface }]}>
          {item.title}
        </Text>

        <View style={styles.metaInfo}>
          <View style={styles.metaItem}>
            <WebIcon name="speedometer" size={16} color={priorityColor} />
            <Text style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
              Severity Score: {item.severityScore}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <WebIcon name="account" size={16} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
              {owner?.name || 'Unassigned'}
            </Text>
          </View>

          {workstream && (
            <View style={styles.metaItem}>
              <WebIcon name="folder" size={16} color={workstream.color} />
              <Text style={[styles.metaText, { color: workstream.color }]}>
                {workstream.label}
              </Text>
            </View>
          )}

          {item.dueDate && (
            <View style={styles.metaItem}>
              <WebIcon name="calendar" size={16} color={theme.colors.onSurfaceVariant} />
              <Text style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
                Due: {formatDate(item.dueDate)}
              </Text>
            </View>
          )}
        </View>
      </div>
    </View>
  );

  const renderTabNavigation = () => (
    <View style={[styles.tabNavigation, ultraModernStyles.ultraCard, { backgroundColor: theme.colors.surface }]}>
      {[
        { id: 'overview', label: 'Overview', icon: 'information' },
        { id: 'ai', label: 'AI Insights', icon: 'robot' },
        { id: 'history', label: 'History', icon: 'history' },
      ].map((tab) => (
        <Pressable
          key={tab.id}
          style={[
            styles.tabButton,
            activeTab === tab.id && [styles.tabButtonActive, { backgroundColor: theme.colors.primary }]
          ]}
          onPress={() => setActiveTab(tab.id as any)}
        >
          <WebIcon 
            name={tab.icon} 
            size={16} 
            color={activeTab === tab.id ? theme.colors.onPrimary : theme.colors.onSurfaceVariant} 
          />
          <Text 
            variant="labelMedium"
            style={{ 
              color: activeTab === tab.id ? theme.colors.onPrimary : theme.colors.onSurfaceVariant,
              fontWeight: activeTab === tab.id ? '600' : '500'
            }}
          >
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  const renderOverviewTab = () => (
    <View style={[styles.tabContent, ultraModernStyles.ultraCard, { backgroundColor: theme.colors.surface }]}>
      <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        📋 Description
      </Text>
      <Text variant="bodyMedium" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
        {item.description}
      </Text>

      <Divider style={styles.divider} />

      <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        📊 Risk Assessment
      </Text>
      <View style={styles.assessmentGrid}>
        <View style={styles.assessmentItem}>
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>Impact</Text>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>{item.impact}</Text>
        </View>
        <View style={styles.assessmentItem}>
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>Likelihood</Text>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>{item.likelihood}</Text>
        </View>
        <View style={styles.assessmentItem}>
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>Status</Text>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>{item.status}</Text>
        </View>
      </View>
    </View>
  );

  const renderAITab = () => (
    <View style={[styles.tabContent, ultraModernStyles.ultraCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.aiHeader}>
        <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
          🤖 AI Analysis & Insights
        </Text>
        <Button
          mode="contained"
          onPress={handleAnalyzeWithAI}
          loading={isAnalyzing}
          style={ultraModernStyles.primaryButton}
          icon="robot"
          compact
        >
          {isAnalyzing ? 'Analyzing...' : item.ai ? 'Re-analyze' : 'Analyze'}
        </Button>
      </View>

      {isAnalyzing && (
        <View style={styles.analysisProgress}>
          <ProgressBar indeterminate color={theme.colors.primary} />
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 8 }}>
            Running AI analysis...
          </Text>
        </View>
      )}

      {item.ai ? (
        <View style={styles.aiContent}>
          <View style={styles.confidenceSection}>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              AI Confidence Score
            </Text>
            <Text variant="displaySmall" style={{ color: theme.colors.primary, fontWeight: '700' }}>
              {Math.round(item.ai.confidence * 100)}%
            </Text>
          </View>

          <Divider style={styles.divider} />

          <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Analysis Results
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, lineHeight: 22 }}>
            {item.ai.analysis}
          </Text>

          {item.ai.flags && item.ai.flags.length > 0 && (
            <>
              <Divider style={styles.divider} />
              <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                AI Flags
              </Text>
              <View style={styles.flagsContainer}>
                {item.ai.flags.map((flag, index) => (
                  <Chip
                    key={index}
                    mode="flat"
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
                      fontSize: 12,
                    }}
                  >
                    {flag.message}
                  </Chip>
                ))}
              </View>
            </>
          )}
        </View>
      ) : (
        <View style={styles.noAIContent}>
          <WebIcon name="robot-outline" size={64} color={theme.colors.onSurfaceVariant} />
          <Text variant="titleMedium" style={[styles.noAITitle, { color: theme.colors.onSurface }]}>
            No AI Analysis Yet
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
            Run AI analysis to get intelligent insights and recommendations for this item.
          </Text>
        </View>
      )}
    </View>
  );

  const renderHistoryTab = () => (
    <View style={[styles.tabContent, ultraModernStyles.ultraCard, { backgroundColor: theme.colors.surface }]}>
      <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        📈 Change History
      </Text>
      
      {item.history && item.history.length > 0 ? (
        <View style={styles.historyList}>
          {item.history.slice().reverse().map((entry: HistoryEntry, index) => (
            <View key={entry.id} style={styles.historyItem}>
              <View style={[styles.historyDot, { backgroundColor: theme.colors.primary }]} />
              <View style={styles.historyContent}>
                <View style={styles.historyHeader}>
                  <Text variant="labelMedium" style={{ color: theme.colors.onSurface, fontWeight: '600' }}>
                    {entry.action}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {formatDate(entry.timestamp)}
                  </Text>
                </View>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  by {entry.actor}
                </Text>
                {entry.note && (
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurface, marginTop: 4 }}>
                    {entry.note}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.noHistoryContent}>
          <WebIcon name="history" size={48} color={theme.colors.onSurfaceVariant} />
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
            No history available for this item.
          </Text>
        </View>
      )}
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'ai':
        return renderAITab();
      case 'history':
        return renderHistoryTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <Layout
      title={item.title}
      subtitle={`${item.type} • ${item.status}`}
      showBackButton
      rightActions={
        <Button
          mode="text"
          onPress={() => {/* Handle delete */}}
          textColor={theme.colors.error}
          icon="delete"
          compact
        >
          Delete
        </Button>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderItemHeader()}
        {renderTabNavigation()}
        {renderContent()}
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: ultraModernStyles.spacing.xl,
  },
  itemHeader: {
    padding: ultraModernStyles.spacing.lg,
    marginBottom: ultraModernStyles.spacing.md,
    position: 'relative',
    overflow: 'hidden',
  },
  headerAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  headerContent: {
    gap: ultraModernStyles.spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeAndPriority: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ultraModernStyles.spacing.sm,
  },
  typeChip: {
    height: 28,
  },
  priorityBadge: {
    paddingHorizontal: ultraModernStyles.spacing.sm,
    paddingVertical: 4,
    borderRadius: ultraModernStyles.radius.sm,
    minWidth: 32,
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    gap: ultraModernStyles.spacing.sm,
  },
  itemTitle: {
    fontWeight: '700',
    lineHeight: 28,
  },
  metaInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ultraModernStyles.spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ultraModernStyles.spacing.xs,
  },
  metaText: {
    fontSize: 13,
  },
  tabNavigation: {
    flexDirection: 'row',
    padding: 4,
    marginBottom: ultraModernStyles.spacing.md,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ultraModernStyles.spacing.xs,
    paddingVertical: ultraModernStyles.spacing.md,
    paddingHorizontal: ultraModernStyles.spacing.sm,
    borderRadius: ultraModernStyles.radius.md,
  },
  tabButtonActive: {
    // Active styles applied inline
  },
  tabContent: {
    padding: ultraModernStyles.spacing.lg,
    marginBottom: ultraModernStyles.spacing.md,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: ultraModernStyles.spacing.md,
  },
  description: {
    lineHeight: 22,
  },
  divider: {
    marginVertical: ultraModernStyles.spacing.lg,
  },
  assessmentGrid: {
    flexDirection: 'row',
    gap: ultraModernStyles.spacing.lg,
  },
  assessmentItem: {
    flex: 1,
    alignItems: 'center',
    padding: ultraModernStyles.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: ultraModernStyles.radius.md,
  },
  aiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ultraModernStyles.spacing.md,
  },
  analysisProgress: {
    marginBottom: ultraModernStyles.spacing.lg,
  },
  aiContent: {
    gap: ultraModernStyles.spacing.md,
  },
  confidenceSection: {
    alignItems: 'center',
    padding: ultraModernStyles.spacing.lg,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: ultraModernStyles.radius.lg,
  },
  flagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ultraModernStyles.spacing.sm,
  },
  flagChip: {
    height: 24,
  },
  noAIContent: {
    alignItems: 'center',
    padding: ultraModernStyles.spacing.xl,
    gap: ultraModernStyles.spacing.md,
  },
  noAITitle: {
    textAlign: 'center',
  },
  historyList: {
    gap: ultraModernStyles.spacing.md,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: ultraModernStyles.spacing.md,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  historyContent: {
    flex: 1,
    gap: ultraModernStyles.spacing.xs,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noHistoryContent: {
    alignItems: 'center',
    padding: ultraModernStyles.spacing.xl,
    gap: ultraModernStyles.spacing.md,
  },
});

export default UltraModernItemDetailScreen;