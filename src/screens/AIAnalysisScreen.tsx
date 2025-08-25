import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, Card, Button, useTheme, ProgressBar, List, Chip } from 'react-native-paper';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useStore } from '../store';
import { RootStackParamList } from '../navigation/AppNavigator';
import { apiService } from '../services/api';

type RoutePropType = RouteProp<RootStackParamList, 'AIAnalysis'>;

const AIAnalysisScreen: React.FC = () => {
  const theme = useTheme();
  const route = useRoute<RoutePropType>();
  const { items, updateItem, aiConfig } = useStore();
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const itemsToAnalyze = route.params?.itemIds
    ? items.filter(item => route.params.itemIds?.includes(item.id))
    : items;

  const handleAnalysis = async () => {
    setAnalyzing(true);
    setProgress(0);
    setError(null);
    
    try {
      // First check if API is available
      await apiService.healthCheck();
      
      // Use batch analysis for multiple items or single analysis for one item
      if (itemsToAnalyze.length > 1) {
        const batchResults = await apiService.batchAnalyze(itemsToAnalyze, 'analysis');
        setResults(batchResults.map(result => ({
          itemId: result.itemId,
          itemTitle: result.itemTitle,
          analysis: result.analysis.analysis,
          suggestedPriority: result.analysis.suggestedPriority,
          suggestedStatus: result.analysis.suggestedStatus,
          confidence: result.analysis.confidence,
          flags: result.analysis.flags || [],
        })));
      } else {
        // Single item analysis with progress simulation
        const analysisResults = [];
        
        for (let i = 0; i < itemsToAnalyze.length; i++) {
          const item = itemsToAnalyze[i];
          setProgress((i + 0.5) / itemsToAnalyze.length);
          
          const analysis = await apiService.analyzeItem(item, 'analysis');
          
          analysisResults.push({
            itemId: item.id,
            itemTitle: item.title,
            analysis: analysis.analysis,
            suggestedPriority: analysis.suggestedPriority,
            suggestedStatus: analysis.suggestedStatus,
            confidence: analysis.confidence,
            flags: analysis.flags || [],
          });
          
          setProgress((i + 1) / itemsToAnalyze.length);
        }
        
        setResults(analysisResults);
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze items');
      Alert.alert(
        'Analysis Error', 
        'Failed to connect to AI service. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const applyAnalysis = (result: any) => {
    const aiData = {
      analysis: result.analysis,
      suggestedPriority: result.suggestedPriority,
      validationNotes: '',
      lastAnalyzedAt: new Date(),
      confidence: result.confidence,
      flags: result.flags,
    };
    
    updateItem(result.itemId, { ai: aiData });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            AI Analysis
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Analyze {itemsToAnalyze.length} item(s) with AI
          </Text>

          {!analyzing && results.length === 0 && (
            <>
              <Text variant="bodyMedium" style={styles.description}>
                The AI will analyze your RAID items and provide:
              </Text>
              <List.Item
                title="Priority recommendations"
                left={props => <List.Icon {...props} icon="flag" />}
              />
              <List.Item
                title="Data quality validation"
                left={props => <List.Icon {...props} icon="check-circle" />}
              />
              <List.Item
                title="Risk assessment insights"
                left={props => <List.Icon {...props} icon="lightbulb" />}
              />
              
              <Button
                mode="contained"
                onPress={handleAnalysis}
                style={styles.analyzeButton}
              >
                Start Analysis
              </Button>
            </>
          )}

          {analyzing && (
            <>
              <Text variant="bodyMedium" style={styles.progressText}>
                Analyzing items...
              </Text>
              <ProgressBar progress={progress} style={styles.progressBar} />
              <Text variant="labelSmall" style={styles.progressLabel}>
                {Math.round(progress * 100)}% complete
              </Text>
            </>
          )}

          {!analyzing && results.length > 0 && (
            <>
              <Text variant="titleMedium" style={styles.resultsTitle}>
                Analysis Results
              </Text>
              {results.map((result, index) => (
                <Card key={index} style={styles.resultCard}>
                  <Card.Content>
                    <Text variant="titleSmall" style={styles.resultItemTitle}>
                      {result.itemTitle}
                    </Text>
                    <Text variant="bodySmall" style={styles.resultAnalysis}>
                      {result.analysis}
                    </Text>
                    
                    <View style={styles.resultMeta}>
                      <Chip mode="flat" compact style={styles.confidenceChip}>
                        {Math.round(result.confidence * 100)}% confidence
                      </Chip>
                      {result.suggestedPriority && (
                        <Chip mode="outlined" compact>
                          Suggested: {result.suggestedPriority}
                        </Chip>
                      )}
                    </View>
                    
                    {result.flags.length > 0 && (
                      <View style={styles.flags}>
                        {result.flags.map((flag: any, i: number) => (
                          <Text key={i} variant="labelSmall" style={styles.flag}>
                            ⚠ {flag.message}
                          </Text>
                        ))}
                      </View>
                    )}
                    
                    <Button
                      mode="contained-tonal"
                      onPress={() => applyAnalysis(result)}
                      style={styles.applyButton}
                    >
                      Apply to Item
                    </Button>
                  </Card.Content>
                </Card>
              ))}
              
              <Button
                mode="outlined"
                onPress={() => {
                  setResults([]);
                  setProgress(0);
                }}
                style={styles.newAnalysisButton}
              >
                New Analysis
              </Button>
            </>
          )}
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
  description: {
    marginBottom: 16,
  },
  analyzeButton: {
    marginTop: 24,
  },
  progressText: {
    marginBottom: 16,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressLabel: {
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.7,
  },
  resultsTitle: {
    marginBottom: 16,
  },
  resultCard: {
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
  },
  resultItemTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  resultAnalysis: {
    marginBottom: 12,
  },
  resultMeta: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  confidenceChip: {
    backgroundColor: '#E0F2FE',
  },
  flags: {
    marginBottom: 12,
  },
  flag: {
    color: '#F59E0B',
    marginBottom: 4,
  },
  applyButton: {
    alignSelf: 'flex-start',
  },
  newAnalysisButton: {
    marginTop: 16,
  },
});

export default AIAnalysisScreen;