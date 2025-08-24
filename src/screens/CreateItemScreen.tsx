import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import {
  TextInput,
  Button,
  useTheme,
  Text,
  SegmentedButtons,
  Chip,
  HelperText,
  Portal,
  Dialog,
  List,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useStore } from '../store';
import { RootStackParamList } from '../navigation/AppNavigator';
import {
  ItemType,
  ItemStatus,
  Priority,
  Impact,
  Likelihood,
  RAIDItem,
} from '../types';
import {
  ITEM_TYPES,
  ITEM_STATUSES,
  PRIORITIES,
  IMPACTS,
  LIKELIHOODS,
} from '../constants';
import { calculateSeverityScore, validateRequiredFields } from '../utils/helpers';

type NavigationProp = StackNavigationProp<RootStackParamList, 'CreateItem'>;
type RoutePropType = RouteProp<RootStackParamList, 'CreateItem'>;

const CreateItemScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { addItem, workstreams, owners, draftItem, setDraftItem } = useStore();

  // Initialize form state
  const [formData, setFormData] = useState({
    type: (route.params?.type as ItemType) || draftItem?.type || 'Risk',
    title: draftItem?.title || '',
    description: draftItem?.description || '',
    status: draftItem?.status || 'Open',
    priority: draftItem?.priority || 'P2',
    impact: draftItem?.impact || 'Medium',
    likelihood: draftItem?.likelihood || 'Medium',
    workstream: draftItem?.workstream || workstreams[0]?.id || '',
    owner: draftItem?.owner || owners[0]?.id || '',
    governanceTags: draftItem?.governanceTags || [],
    dueDate: draftItem?.dueDate || undefined,
    references: draftItem?.references || [],
    attachments: draftItem?.attachments || [],
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showWorkstreamDialog, setShowWorkstreamDialog] = useState(false);
  const [showOwnerDialog, setShowOwnerDialog] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [newReference, setNewReference] = useState('');

  const steps = ['Basics', 'Details', 'Timeline', 'Governance', 'Review'];

  const updateFormData = useCallback((key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setValidationErrors([]);
  }, []);

  const handleSaveDraft = useCallback(() => {
    setDraftItem(formData as Partial<RAIDItem>);
  }, [formData, setDraftItem]);

  const handleSubmit = useCallback(() => {
    const validation = validateRequiredFields(formData, formData.type);
    if (!validation.valid) {
      setValidationErrors(validation.missing);
      return;
    }

    const severity = calculateSeverityScore(formData.impact, formData.likelihood);
    
    addItem({
      ...formData,
      severityScore: severity.score,
      priority: formData.priority || severity.priority,
      history: [],
    } as Omit<RAIDItem, 'id' | 'createdAt' | 'updatedAt' | 'history'>);

    setDraftItem(null);
    navigation.goBack();
  }, [formData, addItem, setDraftItem, navigation]);

  const renderBasicsStep = () => (
    <View style={styles.stepContainer}>
      <Text variant="titleMedium" style={styles.stepTitle}>
        Basic Information
      </Text>
      
      <Text variant="labelLarge" style={styles.label}>
        Type
      </Text>
      <SegmentedButtons
        value={formData.type}
        onValueChange={(value) => updateFormData('type', value)}
        buttons={ITEM_TYPES.map(type => ({
          value: type,
          label: type,
        }))}
        style={styles.segmentedButtons}
      />

      <TextInput
        label="Title *"
        value={formData.title}
        onChangeText={(text) => updateFormData('title', text)}
        mode="outlined"
        style={styles.input}
        error={validationErrors.includes('title')}
      />
      <HelperText type="error" visible={validationErrors.includes('title')}>
        Title is required
      </HelperText>

      <Text variant="labelLarge" style={styles.label}>
        Workstream *
      </Text>
      <Pressable onPress={() => setShowWorkstreamDialog(true)}>
        <Chip mode="outlined" style={styles.selectionChip}>
          {workstreams.find(ws => ws.id === formData.workstream)?.label || 'Select Workstream'}
        </Chip>
      </Pressable>

      <Text variant="labelLarge" style={styles.label}>
        Owner *
      </Text>
      <Pressable onPress={() => setShowOwnerDialog(true)}>
        <Chip mode="outlined" style={styles.selectionChip}>
          {owners.find(o => o.id === formData.owner)?.name || 'Select Owner'}
        </Chip>
      </Pressable>
    </View>
  );

  const renderDetailsStep = () => {
    const severity = calculateSeverityScore(formData.impact, formData.likelihood);
    
    return (
      <View style={styles.stepContainer}>
        <Text variant="titleMedium" style={styles.stepTitle}>
          Details & Assessment
        </Text>

        <TextInput
          label="Description *"
          value={formData.description}
          onChangeText={(text) => updateFormData('description', text)}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={styles.input}
          error={validationErrors.includes('description')}
        />
        <HelperText type="error" visible={validationErrors.includes('description')}>
          Description is required
        </HelperText>

        <Text variant="labelLarge" style={styles.label}>
          Impact *
        </Text>
        <SegmentedButtons
          value={formData.impact}
          onValueChange={(value) => updateFormData('impact', value)}
          buttons={IMPACTS.map(impact => ({
            value: impact,
            label: impact,
          }))}
          style={styles.segmentedButtons}
        />

        <Text variant="labelLarge" style={styles.label}>
          Likelihood *
        </Text>
        <SegmentedButtons
          value={formData.likelihood}
          onValueChange={(value) => updateFormData('likelihood', value)}
          buttons={LIKELIHOODS.map(likelihood => ({
            value: likelihood,
            label: likelihood,
          }))}
          style={styles.segmentedButtons}
        />

        <View style={styles.severityContainer}>
          <Text variant="labelLarge">Calculated Severity</Text>
          <View style={styles.severityResult}>
            <Text variant="headlineMedium" style={{ color: severity.color }}>
              {severity.score}
            </Text>
            <Chip mode="flat" style={{ backgroundColor: severity.color }}>
              <Text style={{ color: '#FFFFFF' }}>{severity.priority}</Text>
            </Chip>
          </View>
        </View>

        <Text variant="labelLarge" style={styles.label}>
          Priority Override (Optional)
        </Text>
        <SegmentedButtons
          value={formData.priority}
          onValueChange={(value) => updateFormData('priority', value)}
          buttons={PRIORITIES.map(priority => ({
            value: priority,
            label: priority,
          }))}
          style={styles.segmentedButtons}
        />
      </View>
    );
  };

  const renderTimelineStep = () => (
    <View style={styles.stepContainer}>
      <Text variant="titleMedium" style={styles.stepTitle}>
        Timeline
      </Text>

      <Text variant="labelLarge" style={styles.label}>
        Status *
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chipContainer}>
          {ITEM_STATUSES.map(status => (
            <Chip
              key={status}
              mode={formData.status === status ? 'flat' : 'outlined'}
              onPress={() => updateFormData('status', status)}
              style={styles.statusChip}
            >
              {status}
            </Chip>
          ))}
        </View>
      </ScrollView>

      <Text variant="labelLarge" style={styles.label}>
        Due Date {(formData.type === 'Risk' || formData.type === 'Issue') && '*'}
      </Text>
      <Button
        mode="outlined"
        onPress={() => setShowDatePicker(true)}
        style={styles.dateButton}
      >
        {formData.dueDate
          ? new Date(formData.dueDate).toLocaleDateString()
          : 'Select Due Date'}
      </Button>

      {showDatePicker && (
        <DateTimePicker
          value={formData.dueDate ? new Date(formData.dueDate) : new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              updateFormData('dueDate', selectedDate);
            }
          }}
        />
      )}
    </View>
  );

  const renderGovernanceStep = () => (
    <View style={styles.stepContainer}>
      <Text variant="titleMedium" style={styles.stepTitle}>
        Governance & References
      </Text>

      <Text variant="labelLarge" style={styles.label}>
        Governance Tags
      </Text>
      <View style={styles.chipContainer}>
        {['Compliance', 'Security', 'Financial', 'Operational', 'Strategic'].map(tag => (
          <Chip
            key={tag}
            mode={formData.governanceTags.includes(tag) ? 'flat' : 'outlined'}
            onPress={() => {
              const tags = formData.governanceTags.includes(tag)
                ? formData.governanceTags.filter(t => t !== tag)
                : [...formData.governanceTags, tag];
              updateFormData('governanceTags', tags);
            }}
            style={styles.governanceChip}
          >
            {tag}
          </Chip>
        ))}
      </View>

      <Text variant="labelLarge" style={styles.label}>
        References
      </Text>
      <View style={styles.referenceContainer}>
        <TextInput
          label="Add reference URL"
          value={newReference}
          onChangeText={setNewReference}
          mode="outlined"
          right={
            <TextInput.Icon
              icon="plus"
              onPress={() => {
                if (newReference) {
                  updateFormData('references', [...formData.references, newReference]);
                  setNewReference('');
                }
              }}
            />
          }
          style={styles.referenceInput}
        />
        {formData.references.map((ref, index) => (
          <Chip
            key={index}
            mode="outlined"
            onClose={() => {
              updateFormData(
                'references',
                formData.references.filter((_, i) => i !== index)
              );
            }}
            style={styles.referenceChip}
          >
            {ref}
          </Chip>
        ))}
      </View>
    </View>
  );

  const renderReviewStep = () => {
    const severity = calculateSeverityScore(formData.impact, formData.likelihood);
    const selectedWorkstream = workstreams.find(ws => ws.id === formData.workstream);
    const selectedOwner = owners.find(o => o.id === formData.owner);

    return (
      <ScrollView style={styles.stepContainer}>
        <Text variant="titleMedium" style={styles.stepTitle}>
          Review & Submit
        </Text>

        <List.Section>
          <List.Item
            title="Type"
            description={formData.type}
            left={props => <List.Icon {...props} icon="alert-circle" />}
          />
          <List.Item
            title="Title"
            description={formData.title}
            left={props => <List.Icon {...props} icon="format-title" />}
          />
          <List.Item
            title="Status"
            description={formData.status}
            left={props => <List.Icon {...props} icon="progress-check" />}
          />
          <List.Item
            title="Priority"
            description={`${formData.priority} (Severity: ${severity.score})`}
            left={props => <List.Icon {...props} icon="flag" />}
          />
          <List.Item
            title="Impact / Likelihood"
            description={`${formData.impact} / ${formData.likelihood}`}
            left={props => <List.Icon {...props} icon="chart-box" />}
          />
          <List.Item
            title="Workstream"
            description={selectedWorkstream?.label}
            left={props => <List.Icon {...props} icon="folder" />}
          />
          <List.Item
            title="Owner"
            description={selectedOwner?.name}
            left={props => <List.Icon {...props} icon="account" />}
          />
          {formData.dueDate && (
            <List.Item
              title="Due Date"
              description={new Date(formData.dueDate).toLocaleDateString()}
              left={props => <List.Icon {...props} icon="calendar" />}
            />
          )}
        </List.Section>

        {validationErrors.length > 0 && (
          <HelperText type="error" visible={true}>
            Please fill in required fields: {validationErrors.join(', ')}
          </HelperText>
        )}
      </ScrollView>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderBasicsStep();
      case 1:
        return renderDetailsStep();
      case 2:
        return renderTimelineStep();
      case 3:
        return renderGovernanceStep();
      case 4:
        return renderReviewStep();
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        {steps.map((step, index) => (
          <View key={step} style={styles.progressItem}>
            <View
              style={[
                styles.progressDot,
                {
                  backgroundColor:
                    index <= currentStep
                      ? theme.colors.primary
                      : theme.colors.surfaceVariant,
                },
              ]}
            />
            <Text
              variant="labelSmall"
              style={[
                styles.progressLabel,
                {
                  color:
                    index <= currentStep
                      ? theme.colors.primary
                      : theme.colors.onSurfaceVariant,
                },
              ]}
            >
              {step}
            </Text>
          </View>
        ))}
      </View>

      {/* Step content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>

      {/* Navigation buttons */}
      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={() => {
            if (currentStep > 0) {
              setCurrentStep(currentStep - 1);
            } else {
              handleSaveDraft();
              navigation.goBack();
            }
          }}
          style={styles.button}
        >
          {currentStep === 0 ? 'Cancel' : 'Previous'}
        </Button>
        
        {currentStep < steps.length - 1 ? (
          <Button
            mode="contained"
            onPress={() => setCurrentStep(currentStep + 1)}
            style={styles.button}
          >
            Next
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
          >
            Create Item
          </Button>
        )}
      </View>

      {/* Workstream selection dialog */}
      <Portal>
        <Dialog
          visible={showWorkstreamDialog}
          onDismiss={() => setShowWorkstreamDialog(false)}
        >
          <Dialog.Title>Select Workstream</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView>
              {workstreams.map(ws => (
                <List.Item
                  key={ws.id}
                  title={ws.label}
                  onPress={() => {
                    updateFormData('workstream', ws.id);
                    setShowWorkstreamDialog(false);
                  }}
                  left={props => (
                    <List.Icon
                      {...props}
                      icon="circle"
                      color={ws.color}
                    />
                  )}
                />
              ))}
            </ScrollView>
          </Dialog.ScrollArea>
        </Dialog>
      </Portal>

      {/* Owner selection dialog */}
      <Portal>
        <Dialog
          visible={showOwnerDialog}
          onDismiss={() => setShowOwnerDialog(false)}
        >
          <Dialog.Title>Select Owner</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView>
              {owners.map(owner => (
                <List.Item
                  key={owner.id}
                  title={owner.name}
                  description={owner.role}
                  onPress={() => {
                    updateFormData('owner', owner.id);
                    setShowOwnerDialog(false);
                  }}
                  left={props => (
                    <List.Icon {...props} icon="account" />
                  )}
                />
              ))}
            </ScrollView>
          </Dialog.ScrollArea>
        </Dialog>
      </Portal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  progressItem: {
    alignItems: 'center',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 10,
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: 16,
  },
  stepTitle: {
    marginBottom: 16,
  },
  label: {
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusChip: {
    marginRight: 8,
  },
  selectionChip: {
    alignSelf: 'flex-start',
  },
  governanceChip: {
    marginBottom: 8,
  },
  severityContainer: {
    marginVertical: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  severityResult: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  dateButton: {
    alignSelf: 'flex-start',
  },
  referenceContainer: {
    marginTop: 8,
  },
  referenceInput: {
    marginBottom: 8,
  },
  referenceChip: {
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  button: {
    flex: 0.48,
  },
});

export default CreateItemScreen;