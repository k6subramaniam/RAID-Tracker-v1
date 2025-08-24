import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, TextInput, Button, useTheme, SegmentedButtons, Slider } from 'react-native-paper';
import { useStore } from '../store';
import { DEFAULT_AI_CONFIG } from '../constants';

const AIConfigScreen: React.FC = () => {
  const theme = useTheme();
  const { aiConfig, updateAIConfig, resetAIConfig } = useStore();
  const [localConfig, setLocalConfig] = useState(aiConfig);

  const handleSave = () => {
    updateAIConfig(localConfig);
  };

  const handleReset = () => {
    setLocalConfig(DEFAULT_AI_CONFIG);
    resetAIConfig();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            AI Configuration
          </Text>

          <TextInput
            label="System Instruction"
            value={localConfig.systemInstruction}
            onChangeText={(text) => setLocalConfig({ ...localConfig, systemInstruction: text })}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
          />

          <TextInput
            label="Analysis Prompt Template"
            value={localConfig.analysisPromptTemplate}
            onChangeText={(text) => setLocalConfig({ ...localConfig, analysisPromptTemplate: text })}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
          />

          <TextInput
            label="Validation Prompt Template"
            value={localConfig.validationPromptTemplate}
            onChangeText={(text) => setLocalConfig({ ...localConfig, validationPromptTemplate: text })}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
          />

          <Text variant="titleMedium" style={styles.sectionTitle}>
            Tone
          </Text>
          <SegmentedButtons
            value={localConfig.tone}
            onValueChange={(value) => setLocalConfig({ ...localConfig, tone: value as any })}
            buttons={[
              { value: 'conservative', label: 'Conservative' },
              { value: 'balanced', label: 'Balanced' },
              { value: 'assertive', label: 'Assertive' },
            ]}
            style={styles.segmented}
          />

          <Text variant="titleMedium" style={styles.sectionTitle}>
            Auto-Apply Threshold: {(localConfig.autoApplyThreshold * 100).toFixed(0)}%
          </Text>
          <Slider
            value={localConfig.autoApplyThreshold}
            onValueChange={(value) => setLocalConfig({ ...localConfig, autoApplyThreshold: value })}
            minimumValue={0.5}
            maximumValue={1}
            step={0.05}
            style={styles.slider}
          />

          <Text variant="titleMedium" style={styles.sectionTitle}>
            Validation Strictness
          </Text>
          <SegmentedButtons
            value={localConfig.validationStrictness}
            onValueChange={(value) => setLocalConfig({ ...localConfig, validationStrictness: value as any })}
            buttons={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
            ]}
            style={styles.segmented}
          />

          <View style={styles.buttonRow}>
            <Button mode="outlined" onPress={handleReset} style={styles.button}>
              Reset to Defaults
            </Button>
            <Button mode="contained" onPress={handleSave} style={styles.button}>
              Save Configuration
            </Button>
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
    marginBottom: 24,
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 12,
  },
  input: {
    marginBottom: 16,
  },
  segmented: {
    marginBottom: 16,
  },
  slider: {
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
  },
});

export default AIConfigScreen;