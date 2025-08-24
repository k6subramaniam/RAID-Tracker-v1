import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Button, List, useTheme, Chip } from 'react-native-paper';
import { useStore } from '../store';
import { generateExecutiveSummary, exportToText } from '../utils/helpers';
import * as Clipboard from 'expo-clipboard';

const ReportsScreen: React.FC = () => {
  const theme = useTheme();
  const { items, getFilteredItems } = useStore();
  const [copiedReport, setCopiedReport] = useState<string | null>(null);

  const handleExportReport = async (reportType: string) => {
    let reportData = '';
    const filteredItems = getFilteredItems();
    
    switch (reportType) {
      case 'executive':
        reportData = generateExecutiveSummary(filteredItems);
        break;
      case 'full':
        reportData = exportToText(filteredItems, 'Full RAID Report');
        break;
      case 'critical':
        const criticalItems = filteredItems.filter(item => 
          item.priority === 'P0' || item.priority === 'P1'
        );
        reportData = exportToText(criticalItems, 'Critical Items Report');
        break;
      default:
        reportData = exportToText(filteredItems);
    }
    
    await Clipboard.setStringAsync(reportData);
    setCopiedReport(reportType);
    setTimeout(() => setCopiedReport(null), 3000);
  };

  const stats = {
    total: items.length,
    open: items.filter(i => i.status === 'Open').length,
    inProgress: items.filter(i => i.status === 'In Progress').length,
    resolved: items.filter(i => i.status === 'Resolved').length,
    critical: items.filter(i => i.priority === 'P0' || i.priority === 'P1').length,
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            Quick Stats
          </Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text variant="displaySmall" style={styles.statNumber}>
                {stats.total}
              </Text>
              <Text variant="bodyMedium">Total Items</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text variant="displaySmall" style={[styles.statNumber, { color: theme.colors.open }]}>
                {stats.open}
              </Text>
              <Text variant="bodyMedium">Open</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text variant="displaySmall" style={[styles.statNumber, { color: theme.colors.inProgress }]}>
                {stats.inProgress}
              </Text>
              <Text variant="bodyMedium">In Progress</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text variant="displaySmall" style={[styles.statNumber, { color: theme.colors.resolved }]}>
                {stats.resolved}
              </Text>
              <Text variant="bodyMedium">Resolved</Text>
            </View>
          </View>
          
          {stats.critical > 0 && (
            <Chip mode="flat" style={styles.criticalChip}>
              {stats.critical} Critical Items Require Attention
            </Chip>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            Generate Reports
          </Text>
          
          <List.Item
            title="Executive Summary"
            description="High-level overview with key metrics"
            left={props => <List.Icon {...props} icon="file-document" />}
            right={() => (
              <Button
                mode={copiedReport === 'executive' ? 'contained-tonal' : 'contained'}
                onPress={() => handleExportReport('executive')}
              >
                {copiedReport === 'executive' ? 'Copied!' : 'Export'}
              </Button>
            )}
          />
          
          <List.Item
            title="Full Report"
            description="Complete list of all RAID items"
            left={props => <List.Icon {...props} icon="file-document-multiple" />}
            right={() => (
              <Button
                mode={copiedReport === 'full' ? 'contained-tonal' : 'contained'}
                onPress={() => handleExportReport('full')}
              >
                {copiedReport === 'full' ? 'Copied!' : 'Export'}
              </Button>
            )}
          />
          
          <List.Item
            title="Critical Items"
            description="P0 and P1 priority items only"
            left={props => <List.Icon {...props} icon="alert-circle" />}
            right={() => (
              <Button
                mode={copiedReport === 'critical' ? 'contained-tonal' : 'contained'}
                onPress={() => handleExportReport('critical')}
              >
                {copiedReport === 'critical' ? 'Copied!' : 'Export'}
              </Button>
            )}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            Saved Reports
          </Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            No saved reports yet. Generate and save reports for quick access.
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 16,
  },
  title: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: 16,
  },
  statNumber: {
    fontWeight: '700',
    marginBottom: 4,
  },
  criticalChip: {
    backgroundColor: '#FEE2E2',
  },
  emptyText: {
    opacity: 0.7,
    textAlign: 'center',
    paddingVertical: 16,
  },
});

export default ReportsScreen;