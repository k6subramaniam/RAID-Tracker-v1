import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, SegmentedButtons, Button, useTheme, Chip } from 'react-native-paper';
import { Impact, Likelihood, Priority } from '../types';
import { IMPACTS, LIKELIHOODS } from '../constants';
import { calculateSeverityScore, getSLA } from '../utils/helpers';

const CalculatorScreen: React.FC = () => {
  const theme = useTheme();
  const [impact, setImpact] = useState<Impact>('Medium');
  const [likelihood, setLikelihood] = useState<Likelihood>('Medium');
  
  const severity = calculateSeverityScore(impact, likelihood);
  const sla = getSLA(severity.priority);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            Severity Calculator
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Calculate priority based on impact and likelihood
          </Text>

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.label}>Impact</Text>
            <SegmentedButtons
              value={impact}
              onValueChange={(value) => setImpact(value as Impact)}
              buttons={IMPACTS.map(i => ({ value: i, label: i }))}
            />
          </View>

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.label}>Likelihood</Text>
            <SegmentedButtons
              value={likelihood}
              onValueChange={(value) => setLikelihood(value as Likelihood)}
              buttons={LIKELIHOODS.map(l => ({ value: l, label: l }))}
            />
          </View>

          <View style={[styles.resultCard, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Text variant="titleLarge" style={styles.resultTitle}>Results</Text>
            
            <View style={styles.resultRow}>
              <Text variant="bodyLarge">Severity Score:</Text>
              <Text variant="headlineMedium" style={{ color: severity.color }}>
                {severity.score}
              </Text>
            </View>

            <View style={styles.resultRow}>
              <Text variant="bodyLarge">Recommended Priority:</Text>
              <Chip mode="flat" style={{ backgroundColor: severity.color }}>
                <Text style={{ color: '#FFFFFF' }}>{severity.priority}</Text>
              </Chip>
            </View>

            <View style={styles.resultRow}>
              <Text variant="bodyLarge">SLA Expectation:</Text>
              <Text variant="titleMedium">{sla} hours</Text>
            </View>
          </View>

          <Button mode="contained" style={styles.applyButton}>
            Apply to New Item
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.title}>
            Severity Matrix Reference
          </Text>
          
          <View style={styles.matrix}>
            <View style={styles.matrixHeader}>
              <View style={styles.matrixCorner} />
              {IMPACTS.map(i => (
                <View key={i} style={styles.matrixHeaderCell}>
                  <Text variant="labelSmall">{i}</Text>
                </View>
              ))}
            </View>
            
            {LIKELIHOODS.reverse().map(l => (
              <View key={l} style={styles.matrixRow}>
                <View style={styles.matrixRowHeader}>
                  <Text variant="labelSmall">{l}</Text>
                </View>
                {IMPACTS.map(i => {
                  const cellSeverity = calculateSeverityScore(i, l);
                  return (
                    <View
                      key={`${i}-${l}`}
                      style={[
                        styles.matrixCell,
                        { backgroundColor: cellSeverity.color + '40' },
                        impact === i && likelihood === l && styles.selectedCell
                      ]}
                    >
                      <Text variant="labelSmall" style={{ color: cellSeverity.color }}>
                        {cellSeverity.score}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
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
  section: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 12,
  },
  resultCard: {
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  resultTitle: {
    marginBottom: 16,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  applyButton: {
    marginTop: 24,
  },
  matrix: {
    marginTop: 16,
  },
  matrixHeader: {
    flexDirection: 'row',
  },
  matrixCorner: {
    width: 60,
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
    width: 60,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matrixCell: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedCell: {
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
});

export default CalculatorScreen;