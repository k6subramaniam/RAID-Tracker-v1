import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { 
  Text, 
  useTheme, 
  Button, 
  TextInput, 
  ProgressBar,
  Chip,
  Divider,
  Portal,
  Modal,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import WebIcon from '../WebIcon';
import FileUpload from './FileUpload';
import { ultraModernStyles } from '../../theme/ultraModern';
import { apiService } from '../../services/api';
import { validateRequired, formatErrorMessage } from '../../utils/validation';

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
  const [analysisMode, setAnalysisMode] = useState<'text' | 'file'>('text');
  const [errors, setErrors] = useState<string[]>([]);
  const [consensusModalVisible, setConsensusModalVisible] = useState(false);
  const [consensus, setConsensus] = useState<any>(null);
  const navigation = useNavigation();
  
  // Load available providers on mount
  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const data = await apiService.getAIProviders();
      setAvailableProviders(data.providers?.filter(p => p.status === 'active') || []);
      
      // Update selected providers to only include active ones
      const activeProviderIds = data.providers?.filter(p => p.status === 'active').map(p => p.id) || [];
      setSelectedProviders(prev => prev.filter(id => activeProviderIds.includes(id)));
    } catch (error) {
      console.error('Failed to load providers:', error);
      setErrors(['Failed to load AI providers. Please check your configuration.']);
    }
  };

  const validateInputs = (): boolean => {
    const newErrors: string[] = [];
    
    if (analysisMode === 'text') {
      const textValidation = validateRequired(inputText.trim(), 'Analysis text');
      if (textValidation) {
        newErrors.push(textValidation.message);
      } else if (inputText.trim().length < 10) {
        newErrors.push('Analysis text must be at least 10 characters long');
      }
    }
    
    if (selectedProviders.length === 0) {
      newErrors.push('Please select at least one AI provider');
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleAnalyze = async () => {
    if (!validateInputs()) {
      Alert.alert('Validation Error', formatErrorMessage(errors.map(e => ({ field: 'general', message: e }))));
      return;
    }

    if (onAnalyze && inputText.trim() && selectedProviders.length > 0) {
      try {
        setErrors([]);
        const result = await apiService.analyzeText(inputText, selectedProviders);
        setAnalysisResults(result.results);
        setConsensus(result.consensus);
        
        // Show consensus modal if we have multiple results
        if (result.results.length > 1) {
          setConsensusModalVisible(true);
        }
        
        await onAnalyze(inputText, selectedProviders);
      } catch (error) {
        console.error('Analysis failed:', error);
        setErrors(['Analysis failed. Please try again or check your AI provider configuration.']);
        Alert.alert('Analysis Error', 'Failed to analyze text. Please try again.');
      }
    }
  };

  const handleFileUploaded = (file: any) => {
    console.log('File uploaded:', file);
  };

  const handleTextExtracted = (text: string, filename: string) => {
    setInputText(text);
    setAnalysisMode('text');
    Alert.alert(
      'Text Extracted', 
      `Text has been extracted from ${filename} and added to the analysis area.`,
      [{ text: 'OK' }]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Content',
      'This will clear all text and analysis results. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            setInputText('');
            setAnalysisResults([]);
            setConsensus(null);
            setErrors([]);
          }
        }
      ]
    );
  };

  const handleCreateRAIDItems = () => {
    if (consensus && consensus.risks?.length > 0) {
      // Navigate to batch create screen with AI suggestions
      navigation.navigate('BatchCreate', { 
        aiSuggestions: {
          risks: consensus.risks,
          assumptions: consensus.assumptions,
          issues: consensus.issues,
          dependencies: consensus.dependencies
        }
      });
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
      <View style={styles.analysisMethodSelector}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          📄 Choose Analysis Method
        </Text>
        
        <View style={styles.methodButtons}>
          <Pressable
            style={[
              styles.methodButton,
              analysisMode === 'text' && [styles.methodButtonActive, { backgroundColor: theme.colors.primary }],
              { backgroundColor: analysisMode === 'text' ? theme.colors.primary : theme.colors.surfaceVariant }
            ]}
            onPress={() => setAnalysisMode('text')}
          >
            <WebIcon 
              name="text-box" 
              size={20} 
              color={analysisMode === 'text' ? theme.colors.onPrimary : theme.colors.onSurfaceVariant} 
            />
            <Text 
              style={{ 
                color: analysisMode === 'text' ? theme.colors.onPrimary : theme.colors.onSurfaceVariant,
                fontWeight: '600'
              }}
            >
              Text Input
            </Text>
          </Pressable>
          
          <Pressable
            style={[
              styles.methodButton,
              analysisMode === 'file' && [styles.methodButtonActive, { backgroundColor: theme.colors.primary }],
              { backgroundColor: analysisMode === 'file' ? theme.colors.primary : theme.colors.surfaceVariant }
            ]}
            onPress={() => setAnalysisMode('file')}
          >
            <WebIcon 
              name="file-upload" 
              size={20} 
              color={analysisMode === 'file' ? theme.colors.onPrimary : theme.colors.onSurfaceVariant} 
            />
            <Text 
              style={{ 
                color: analysisMode === 'file' ? theme.colors.onPrimary : theme.colors.onSurfaceVariant,
                fontWeight: '600'
              }}
            >
              File Upload
            </Text>
          </Pressable>
        </View>
      </View>

      {analysisMode === 'file' ? (
        <FileUpload
          onFileUploaded={handleFileUploaded}
          onTextExtracted={handleTextExtracted}
        />
      ) : (
        <View style={[styles.textArea, { backgroundColor: theme.colors.surfaceContainer }]}>
          <View style={styles.textHeader}>
            <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
              Enter your text for analysis
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
            maxLength={10000}
            error={errors.some(e => e.includes('text'))}
          />
        </View>
      )}

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
  resultsSection: {
    marginTop: ultraModernStyles.spacing.lg,
  },
  resultsGrid: {
    flexDirection: 'row',
    gap: ultraModernStyles.spacing.md,
  },
  resultCard: {
    width: 250,
    padding: ultraModernStyles.spacing.md,
    borderRadius: ultraModernStyles.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ultraModernStyles.spacing.sm,
  },
});

export default AIAnalysisCard;