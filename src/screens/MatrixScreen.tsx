import React from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Text, Card, useTheme } from 'react-native-paper';
import { useStore } from '../store';
import { Impact, Likelihood } from '../types';
import { IMPACTS, LIKELIHOODS } from '../constants';
import { calculateSeverityScore } from '../utils/helpers';

const MatrixScreen: React.FC = () => {
  const theme = useTheme();
  const { items } = useStore();

  const getItemCount = (impact: Impact, likelihood: Likelihood) => {
    return items.filter(
      item => item.impact === impact && item.likelihood === likelihood
    ).length;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            Risk Assessment Matrix
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Probability vs Impact visualization
          </Text>

          <View style={styles.matrix}>
            {/* Y-axis label */}
            <View style={styles.yAxisLabel}>
              <Text variant="labelSmall" style={styles.axisLabelText}>
                Likelihood →
              </Text>
            </View>

            {/* Matrix header */}
            <View style={styles.matrixHeader}>
              <View style={styles.matrixCorner} />
              {IMPACTS.map(impact => (
                <View key={impact} style={styles.matrixHeaderCell}>
                  <Text variant="labelSmall">{impact}</Text>
                </View>
              ))}
            </View>

            {/* Matrix rows */}
            {LIKELIHOODS.reverse().map(likelihood => (
              <View key={likelihood} style={styles.matrixRow}>
                <View style={styles.matrixRowHeader}>
                  <Text variant="labelSmall">{likelihood}</Text>
                </View>
                {IMPACTS.map(impact => {
                  const count = getItemCount(impact, likelihood);
                  const severity = calculateSeverityScore(impact, likelihood);
                  
                  return (
                    <Pressable
                      key={`${impact}-${likelihood}`}
                      style={[
                        styles.matrixCell,
                        { backgroundColor: severity.color + '20' },
                      ]}
                    >
                      <View style={styles.cellContent}>
                        <Text
                          variant="titleLarge"
                          style={[styles.cellCount, { color: severity.color }]}
                        >
                          {count}
                        </Text>
                        <Text
                          variant="labelSmall"
                          style={[styles.cellSeverity, { color: severity.color }]}
                        >
                          {severity.priority}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ))}

            {/* X-axis label */}
            <View style={styles.xAxisLabel}>
              <Text variant="labelSmall" style={styles.axisLabelText}>
                Impact →
              </Text>
            </View>
          </View>

          <View style={styles.legend}>
            <Text variant="titleMedium" style={styles.legendTitle}>
              Legend
            </Text>
            <View style={styles.legendItems}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#DC2626' }]} />
                <Text variant="bodySmall">P0 - Critical</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#EA580C' }]} />
                <Text variant="bodySmall">P1 - High</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#F59E0B' }]} />
                <Text variant="bodySmall">P2 - Medium</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#6B7280' }]} />
                <Text variant="bodySmall">P3 - Low</Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.title}>
            Summary
          </Text>
          <Text variant="bodyMedium">
            Total items in matrix: {items.length}
          </Text>
          <Text variant="bodyMedium">
            High risk quadrant (High/Critical): {getItemCount('Critical', 'High') + getItemCount('High', 'High')} items
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
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
    opacity: 0.7,
  },
  matrix: {
    marginVertical: 16,
  },
  yAxisLabel: {
    position: 'absolute',
    left: -30,
    top: '50%',
    transform: [{ rotate: '-90deg' }],
  },
  xAxisLabel: {
    alignItems: 'center',
    marginTop: 8,
  },
  axisLabelText: {
    opacity: 0.6,
  },
  matrixHeader: {
    flexDirection: 'row',
  },
  matrixCorner: {
    width: 80,
    height: 30,
  },
  matrixHeaderCell: {
    flex: 1,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matrixRow: {
    flexDirection: 'row',
  },
  matrixRowHeader: {
    width: 80,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matrixCell: {
    flex: 1,
    height: 60,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cellContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellCount: {
    fontWeight: '700',
  },
  cellSeverity: {
    marginTop: 2,
  },
  legend: {
    marginTop: 24,
  },
  legendTitle: {
    marginBottom: 12,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
});

export default MatrixScreen;