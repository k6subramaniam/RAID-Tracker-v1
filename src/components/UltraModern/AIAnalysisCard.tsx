import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { 
  Text, 
  useTheme, 
  Button, 
  TextInput, 
  ProgressBar,
  Chip,
  Divider 
} from 'react-native-paper';
import WebIcon from '../WebIcon';
import { ultraModernStyles } from '../../theme/ultraModern';
import { apiService } from '../../services/api';

interface AIAnalysisCardProps {
  onAnalyze?: (text: string, providers: string[]) => Promise<void>;
  isAnalyzing?: boolean;
  results?: any[];
}

interface AIAnalysisResult {
  provider: string;
  model: string;
  analysis: any;
  confidence: number;
  processing_time: number;
}

const AIAnalysisCard: React.FC<AIAnalysisCardProps> = ({
  onAnalyze,
  isAnalyzing = false,
  results = [],
}) => {
  const theme = useTheme();
  const [inputText, setInputText] = useState('');
  const [selectedProviders, setSelectedProviders] = useState<string[]>(['openai', 'claude', 'gemini']);
  const [analysisResults, setAnalysisResults] = useState<AIAnalysisResult[]>([]);
  const [availableProviders, setAvailableProviders] = useState<any[]>([]);
  
  // Load available providers on mount
  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const data = await apiService.getAIProviders();
      setAvailableProviders(data.providers || []);
    } catch (error) {
      console.error('Failed to load providers:', error);
    }
  };

  const handleAnalyze = async () => {
    if (onAnalyze && inputText.trim() && selectedProviders.length > 0) {
      try {
        const result = await apiService.analyzeText(inputText, selectedProviders);
        setAnalysisResults(result.results);
        await onAnalyze(inputText, selectedProviders);
      } catch (error) {
        console.error('Analysis failed:', error);
      }
    }
  };

  const toggleProvider = (providerId: string) => {
    setSelectedProviders(prev => 
      prev.includes(providerId) 
        ? prev.filter(p => p !== providerId)
        : [...prev, providerId]
    );
  };

  return (
    <View style={[styles.container, ultraModernStyles.ultraCard, { backgroundColor: theme.colors.surface }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <View style={[styles.aiIcon, { backgroundColor: theme.colors.secondaryContainer }]}>
            <WebIcon name="robot" size={20} color="white" />
          </View>
          <View>
            <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
              AI-Enhanced RAID Analysis
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Intelligent analysis and recommendations powered by multiple AI providers
            </Text>
          </View>
        </View>
        
        <Button 
          mode="contained"
          onPress={() => {/* Navigate to AI Config */}}
          style={[ultraModernStyles.primaryButton, styles.configButton]}
          contentStyle={styles.buttonContent}
          icon="cog"
        >
          Configure
        </Button>
      </View>

      {/* Upload Area */}
      <Pressable 
        style={[
          styles.uploadArea, 
          { 
            backgroundColor: theme.colors.surfaceVariant,
            borderColor: theme.colors.outline,
          }
        ]}
      >
        <View style={[styles.uploadIcon, { backgroundColor: theme.colors.surfaceContainer }]}>
          <WebIcon name="cloud-upload" size={20} color={theme.colors.primary} />
        </View>
        <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
          Drop files here or click to browse
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          Support for PDF, DOC, TXT and other document formats
        </Text>
      </Pressable>

      {/* Text Analysis Area */}
      <View style={[styles.textArea, { backgroundColor: theme.colors.surfaceContainer }]}>
        <View style={styles.textHeader}>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
            Or paste your text for analysis
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.tertiary }}>
            {inputText.length} / 10,000 characters
          </Text>
        </View>
        
        <TextInput
          mode="flat"
          multiline
          numberOfLines={8}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Enter your project documentation, meeting notes, or any text that might contain risks, assumptions, issues, or dependencies..."
          placeholderTextColor={theme.colors.tertiary}
          style={[
            styles.textInput,
            ultraModernStyles.ultraInput,
            { backgroundColor: theme.colors.surfaceVariant }
          ]}
          contentStyle={{ color: theme.colors.onSurface }}
        />
      </View>

      {/* Provider Selection */}
      <View style={styles.providerSection}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          AI Providers
        </Text>
        <View style={styles.providerGrid}>
          {availableProviders.map((provider) => (
            <Pressable
              key={provider.id}
              style={[
                styles.providerChip,
                selectedProviders.includes(provider.id) && styles.providerChipSelected,
                { 
                  backgroundColor: selectedProviders.includes(provider.id) 
                    ? `${theme.colors.primary}20` 
                    : theme.colors.surfaceVariant,
                  borderColor: selectedProviders.includes(provider.id)
                    ? theme.colors.primary
                    : theme.colors.outline,
                }
              ]}
              onPress={() => toggleProvider(provider.id)}
            >
              <Text style={{ fontSize: 16 }}>
                {provider.provider === 'openai' ? '🤖' : 
                 provider.provider === 'anthropic' ? '🧠' : '💎'}
              </Text>
              <Text 
                variant="labelMedium" 
                style={{ 
                  color: selectedProviders.includes(provider.id) 
                    ? theme.colors.primary 
                    : theme.colors.onSurfaceVariant 
                }}
              >
                {provider.name}
              </Text>
              <View 
                style={[
                  styles.statusDot, 
                  { backgroundColor: provider.status === 'active' ? theme.colors.success : theme.colors.error }
                ]} 
              />
            </Pressable>
          ))}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button 
          mode="contained-tonal"
          style={ultraModernStyles.secondaryButton}
          contentStyle={styles.buttonContent}
          icon="broom"
        >
          Clear All
        </Button>
        <Button 
          mode="contained"
          onPress={handleAnalyze}
          loading={isAnalyzing}
          disabled={!inputText.trim() || selectedProviders.length === 0}
          style={[ultraModernStyles.primaryButton, styles.analyzeButton]}
          contentStyle={styles.buttonContent}
          icon="flash"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
        </Button>
      </View>

      {/* Progress Bar */}
      {isAnalyzing && (
        <View style={styles.progressSection}>
          <ProgressBar 
            progress={0.7} 
            color={theme.colors.primary}
            style={styles.progressBar}
          />
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
            Analyzing with multiple AI providers... 70% complete
          </Text>
        </View>
      )}

      {/* Analysis Results */}
      {analysisResults.length > 0 && (
        <View style={styles.resultsSection}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            📊 Analysis Results
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.resultsGrid}>
              {analysisResults.map((result, index) => (
                <View key={index} style={[styles.resultCard, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <View style={styles.resultHeader}>
                    <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
                      {result.provider.charAt(0).toUpperCase() + result.provider.slice(1)}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
                      {Math.round(result.confidence * 100)}% confidence
                    </Text>
                  </View>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
                    Model: {result.model}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurface }}>
                    Processing time: {result.processing_time}ms
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: ultraModernStyles.spacing.xl,
    marginBottom: ultraModernStyles.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: ultraModernStyles.spacing.lg,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ultraModernStyles.spacing.md,
    flex: 1,
  },
  aiIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  configButton: {
    borderRadius: ultraModernStyles.radius.md,
  },
  buttonContent: {
    paddingHorizontal: ultraModernStyles.spacing.sm,
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: ultraModernStyles.radius.lg,
    padding: ultraModernStyles.spacing.xxl,
    alignItems: 'center',
    marginBottom: ultraModernStyles.spacing.lg,
  },
  uploadIcon: {
    width: 48,
    height: 48,
    borderRadius: ultraModernStyles.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ultraModernStyles.spacing.md,
  },
  textArea: {
    borderRadius: ultraModernStyles.radius.lg,
    padding: ultraModernStyles.spacing.lg,
    marginBottom: ultraModernStyles.spacing.lg,
  },
  textHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ultraModernStyles.spacing.md,
  },
  textInput: {
    minHeight: 200,
    textAlignVertical: 'top',
  },
  providerSection: {
    marginBottom: ultraModernStyles.spacing.lg,
  },
  sectionTitle: {
    marginBottom: ultraModernStyles.spacing.md,
    fontWeight: '600',
  },
  providerGrid: {
    flexDirection: 'row',
    gap: ultraModernStyles.spacing.md,
    flexWrap: 'wrap',
  },
  providerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ultraModernStyles.spacing.sm,
    paddingHorizontal: ultraModernStyles.spacing.md,
    paddingVertical: ultraModernStyles.spacing.sm,
    borderRadius: ultraModernStyles.radius.md,
    borderWidth: 1,
    position: 'relative',
  },
  providerChipSelected: {
    // Additional styles for selected state
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: ultraModernStyles.spacing.md,
    marginBottom: ultraModernStyles.spacing.md,
  },
  analyzeButton: {
    flex: 1,
  },
  progressSection: {
    gap: ultraModernStyles.spacing.sm,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
});

export default AIAnalysisCard;