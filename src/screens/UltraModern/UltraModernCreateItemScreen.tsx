import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { 
  Text, 
  useTheme, 
  Button, 
  TextInput,
  SegmentedButtons,
  Chip,
  ProgressBar,
  Portal,
  Modal,
  Divider,
} from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import Layout from '../../components/UltraModern/Layout';
import WebIcon from '../../components/WebIcon';
import { useStore } from '../../store';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { ultraModernStyles } from '../../theme/ultraModern';
import { RAIDItem, ItemType, Priority, Impact, Likelihood, ItemStatus } from '../../types';
import { generateId, calculateSeverityScore } from '../../utils/helpers';

type CreateItemRouteProp = RouteProp<RootStackParamList, 'CreateItem'>;
type CreateItemNavigationProp = StackNavigationProp<RootStackParamList, 'CreateItem'>;

interface FormData {
  type: ItemType;
  title: string;
  description: string;
  impact: Impact;
  likelihood: Likelihood;
  priority: Priority;
  status: ItemStatus;
  workstream: string;
  owner: string;
  dueDate?: Date;
  targetDate?: Date;
  governanceTags: string[];
  references: string[];
}

const UltraModernCreateItemScreen: React.FC = () => {
  const theme = useTheme();
  const route = useRoute<CreateItemRouteProp>();
  const navigation = useNavigation<CreateItemNavigationProp>();
  const { type: initialType } = route.params || {};
  
  const { addItem, workstreams, owners, setDraftItem, draftItem } = useStore();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    type: (initialType as ItemType) || 'Risk',
    title: '',
    description: '',
    impact: 'Medium',
    likelihood: 'Medium',
    priority: 'P2',
    status: 'Open',
    workstream: workstreams[0]?.id || '',
    owner: owners[0]?.id || '',
    governanceTags: [],
    references: [],
  });
  
  const [isCreating, setIsCreating] = useState(false);
  const [workstreamModalVisible, setWorkstreamModalVisible] = useState(false);
  const [ownerModalVisible, setOwnerModalVisible] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const steps = [
    { id: 0, title: 'Type & Basics', icon: 'information' },
    { id: 1, title: 'Details', icon: 'text-box' },
    { id: 2, title: 'Assessment', icon: 'chart-line' },
    { id: 3, title: 'Assignment', icon: 'account-group' },
    { id: 4, title: 'Review', icon: 'check-circle' },
  ];

  // Load draft data on mount
  useEffect(() => {
    if (draftItem && Object.keys(draftItem).length > 0) {
      setFormData(prev => ({ ...prev, ...draftItem }));
    }
  }, [draftItem]);

  // Auto-save draft
  useEffect(() => {
    const timer = setTimeout(() => {
      setDraftItem(formData);
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData, setDraftItem]);

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
    
    // Clear validation errors for updated fields
    const updatedFields = Object.keys(updates);
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      updatedFields.forEach(field => {
        delete newErrors[field];
      });
      return newErrors;
    });
  };

  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string> = {};
    
    switch (currentStep) {
      case 0: // Type & Basics
        if (!formData.type) errors.type = 'Please select a type';
        if (!formData.title.trim()) errors.title = 'Title is required';
        else if (formData.title.length < 3) errors.title = 'Title must be at least 3 characters';
        else if (formData.title.length > 200) errors.title = 'Title must be less than 200 characters';
        break;
        
      case 1: // Details  
        if (!formData.description.trim()) errors.description = 'Description is required';
        else if (formData.description.length < 10) errors.description = 'Description must be at least 10 characters';
        else if (formData.description.length > 2000) errors.description = 'Description must be less than 2000 characters';
        break;
        
      case 2: // Assessment
        if (!formData.impact) errors.impact = 'Please select an impact level';
        if (!formData.likelihood) errors.likelihood = 'Please select a likelihood';
        if (!formData.priority) errors.priority = 'Please select a priority';
        break;
        
      case 3: // Assignment
        if (!formData.workstream) errors.workstream = 'Please select a workstream';
        if (!formData.owner) errors.owner = 'Please select an owner';
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getTypeConfig = (type: ItemType) => {
    switch (type) {
      case 'Risk':
        return { color: theme.colors.risk, backgroundColor: theme.colors.riskContainer, icon: 'alert-circle' };
      case 'Issue':
        return { color: theme.colors.issue, backgroundColor: theme.colors.issueContainer, icon: 'alert' };
      case 'Assumption':
        return { color: theme.colors.assumption, backgroundColor: theme.colors.assumptionContainer, icon: 'help-circle' };
      case 'Dependency':
        return { color: theme.colors.dependency, backgroundColor: theme.colors.dependencyContainer, icon: 'link-variant' };
    }
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      Alert.alert('Validation Error', 'Please fix the errors before proceeding.');
      return;
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreate = async () => {
    if (!validateCurrentStep()) {
      Alert.alert('Validation Error', 'Please fix all errors before creating the item.');
      return;
    }

    setIsCreating(true);
    try {
      const itemId = await addItem(formData);
      setDraftItem(null); // Clear draft
      setHasUnsavedChanges(false);
      
      Alert.alert(
        'Success', 
        'RAID item created successfully!',
        [
          {
            text: 'View Item',
            onPress: () => navigation.navigate('ItemDetail', { itemId })
          }
        ]
      );
    } catch (error) {
      console.error('Failed to create item:', error);
      Alert.alert('Error', 'Failed to create RAID item. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return formData.type && formData.title.trim().length >= 3;
      case 1: return formData.description.trim().length >= 10;
      case 2: return formData.impact && formData.likelihood && formData.priority;
      case 3: return formData.workstream && formData.owner;
      case 4: return true;
      default: return false;
    }
  };

  const handleBackNavigation = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Do you want to save as draft or discard?',
        [
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              setDraftItem(null);
              navigation.goBack();
            }
          },
          {
            text: 'Save Draft',
            onPress: () => {
              setDraftItem(formData);
              navigation.goBack();
            }
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const renderProgressIndicator = () => (
    <View style={[styles.progressContainer, ultraModernStyles.ultraCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.progressHeader}>
        <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
          Create New {formData.type}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          Step {currentStep + 1} of {steps.length}
        </Text>
      </View>
      
      <ProgressBar 
        progress={(currentStep + 1) / steps.length} 
        color={theme.colors.primary}
        style={styles.progressBar}
      />
      
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <View key={step.id} style={styles.stepItem}>
            <View 
              style={[
                styles.stepCircle,
                index <= currentStep 
                  ? { backgroundColor: theme.colors.primary } 
                  : { backgroundColor: theme.colors.surfaceVariant }
              ]}
            >
              <WebIcon 
                name={step.icon} 
                size={16} 
                color={index <= currentStep ? theme.colors.onPrimary : theme.colors.onSurfaceVariant} 
              />
            </View>
            <Text 
              variant="bodySmall" 
              style={{ 
                color: index <= currentStep ? theme.colors.onSurface : theme.colors.onSurfaceVariant,
                textAlign: 'center',
                marginTop: 4
              }}
            >
              {step.title}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderTypeBasicsStep = () => (
    <View style={[styles.stepContent, ultraModernStyles.ultraCard, { backgroundColor: theme.colors.surface }]}>
      <Text variant="titleMedium" style={[styles.stepTitle, { color: theme.colors.onSurface }]}>
        🎯 What type of item are you creating?
      </Text>
      
      <View style={styles.typeGrid}>
        {(['Risk', 'Issue', 'Assumption', 'Dependency'] as ItemType[]).map((type) => {
          const config = getTypeConfig(type);
          const isSelected = formData.type === type;
          
          return (
            <Pressable
              key={type}
              style={[
                styles.typeCard,
                isSelected && { borderColor: config.color, backgroundColor: config.backgroundColor }
              ]}
              onPress={() => updateFormData({ type })}
            >
              <WebIcon name={config.icon} size={32} color={config.color} />
              <Text 
                variant="titleMedium" 
                style={[
                  styles.typeTitle,
                  { color: isSelected ? config.color : theme.colors.onSurface }
                ]}
              >
                {type}
              </Text>
              <Text 
                variant="bodySmall" 
                style={{ 
                  color: theme.colors.onSurfaceVariant, 
                  textAlign: 'center',
                  lineHeight: 16
                }}
              >
                {type === 'Risk' && 'Potential negative events'}
                {type === 'Issue' && 'Current problems to solve'}
                {type === 'Assumption' && 'Things we believe to be true'}
                {type === 'Dependency' && 'External requirements'}
              </Text>
            </Pressable>
          );
        })}
      </View>
      
      <Divider style={styles.divider} />
      
      <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        📝 Title
      </Text>
      <TextInput
        mode="outlined"
        value={formData.title}
        onChangeText={(text) => updateFormData({ title: text })}
        placeholder={`Enter ${formData.type.toLowerCase()} title...`}
        style={ultraModernStyles.ultraInput}
        error={!!validationErrors.title}
        maxLength={200}
      />
      {validationErrors.title && (
        <Text variant="bodySmall" style={{ color: theme.colors.error, marginTop: 4 }}>
          {validationErrors.title}
        </Text>
      )}
    </View>
  );

  const renderDetailsStep = () => (
    <View style={[styles.stepContent, ultraModernStyles.ultraCard, { backgroundColor: theme.colors.surface }]}>
      <Text variant="titleMedium" style={[styles.stepTitle, { color: theme.colors.onSurface }]}>
        📋 Provide detailed description
      </Text>
      
      <TextInput
        mode="outlined"
        value={formData.description}
        onChangeText={(text) => updateFormData({ description: text })}
        placeholder={`Describe the ${formData.type.toLowerCase()} in detail...`}
        multiline
        numberOfLines={8}
        style={[ultraModernStyles.ultraInput, styles.descriptionInput]}
      />
      
      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
        {formData.description.length} / 1000 characters
      </Text>
      
      <Divider style={styles.divider} />
      
      <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        🔗 References (Optional)
      </Text>
      <TextInput
        mode="outlined"
        placeholder="Add references, links, or related documents..."
        style={ultraModernStyles.ultraInput}
      />
    </View>
  );

  const renderAssessmentStep = () => (
    <View style={[styles.stepContent, ultraModernStyles.ultraCard, { backgroundColor: theme.colors.surface }]}>
      <Text variant="titleMedium" style={[styles.stepTitle, { color: theme.colors.onSurface }]}>
        📊 Risk Assessment
      </Text>
      
      <View style={styles.assessmentSection}>
        <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Impact Level
        </Text>
        <SegmentedButtons
          value={formData.impact}
          onValueChange={(value) => updateFormData({ impact: value as Impact })}
          buttons={[
            { value: 'Low', label: 'Low' },
            { value: 'Medium', label: 'Medium' },
            { value: 'High', label: 'High' },
            { value: 'Critical', label: 'Critical' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>
      
      <View style={styles.assessmentSection}>
        <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Likelihood
        </Text>
        <SegmentedButtons
          value={formData.likelihood}
          onValueChange={(value) => updateFormData({ likelihood: value as Likelihood })}
          buttons={[
            { value: 'Low', label: 'Low' },
            { value: 'Medium', label: 'Medium' },
            { value: 'High', label: 'High' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>
      
      <View style={styles.severityDisplay}>
        <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          Calculated Severity Score
        </Text>
        <Text variant="displaySmall" style={{ color: theme.colors.primary, fontWeight: '700' }}>
          {calculateSeverityScore(formData.impact, formData.likelihood)}
        </Text>
      </View>
      
      <Divider style={styles.divider} />
      
      <View style={styles.assessmentSection}>
        <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Priority Level
        </Text>
        <SegmentedButtons
          value={formData.priority}
          onValueChange={(value) => updateFormData({ priority: value as Priority })}
          buttons={[
            { value: 'P0', label: 'P0' },
            { value: 'P1', label: 'P1' },
            { value: 'P2', label: 'P2' },
            { value: 'P3', label: 'P3' },
          ]}
          style={styles.segmentedButtons}
        />
      </div>
    </View>
  );

  const renderAssignmentStep = () => {
    const selectedWorkstream = workstreams.find(ws => ws.id === formData.workstream);
    const selectedOwner = owners.find(o => o.id === formData.owner);
    
    return (
      <View style={[styles.stepContent, ultraModernStyles.ultraCard, { backgroundColor: theme.colors.surface }]}>
        <Text variant="titleMedium" style={[styles.stepTitle, { color: theme.colors.onSurface }]}>
          👥 Assignment & Governance
        </Text>
        
        <View style={styles.assignmentSection}>
          <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Workstream
          </Text>
          <Pressable 
            style={[styles.selectionButton, { backgroundColor: theme.colors.surfaceVariant }]}
            onPress={() => setWorkstreamModalVisible(true)}
          >
            <View style={styles.selectionContent}>
              {selectedWorkstream ? (
                <>
                  <View style={[styles.colorDot, { backgroundColor: selectedWorkstream.color }]} />
                  <Text style={{ color: theme.colors.onSurface }}>{selectedWorkstream.label}</Text>
                </>
              ) : (
                <Text style={{ color: theme.colors.onSurfaceVariant }}>Select workstream...</Text>
              )}
            </View>
            <WebIcon name="chevron-right" size={20} color={theme.colors.onSurfaceVariant} />
          </Pressable>
        </View>
        
        <View style={styles.assignmentSection}>
          <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Owner
          </Text>
          <Pressable 
            style={[styles.selectionButton, { backgroundColor: theme.colors.surfaceVariant }]}
            onPress={() => setOwnerModalVisible(true)}
          >
            <View style={styles.selectionContent}>
              {selectedOwner ? (
                <>
                  <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
                    <Text style={{ color: theme.colors.onPrimary, fontSize: 12, fontWeight: '600' }}>
                      {selectedOwner.initials || selectedOwner.name.substring(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={{ color: theme.colors.onSurface }}>{selectedOwner.name}</Text>
                </>
              ) : (
                <Text style={{ color: theme.colors.onSurfaceVariant }}>Select owner...</Text>
              )}
            </View>
            <WebIcon name="chevron-right" size={20} color={theme.colors.onSurfaceVariant} />
          </Pressable>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.assessmentSection}>
          <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Initial Status
          </Text>
          <SegmentedButtons
            value={formData.status}
            onValueChange={(value) => updateFormData({ status: value as ItemStatus })}
            buttons={[
              { value: 'Proposed', label: 'Proposed' },
              { value: 'Open', label: 'Open' },
              { value: 'In Progress', label: 'In Progress' },
            ]}
            style={styles.segmentedButtons}
          />
        </View>
      </View>
    );
  };

  const renderReviewStep = () => {
    const typeConfig = getTypeConfig(formData.type);
    const selectedWorkstream = workstreams.find(ws => ws.id === formData.workstream);
    const selectedOwner = owners.find(o => o.id === formData.owner);
    
    return (
      <View style={[styles.stepContent, ultraModernStyles.ultraCard, { backgroundColor: theme.colors.surface }]}>
        <Text variant="titleMedium" style={[styles.stepTitle, { color: theme.colors.onSurface }]}>
          ✅ Review & Create
        </Text>
        
        <View style={[styles.reviewCard, { backgroundColor: theme.colors.surfaceVariant }]}>
          <View style={styles.reviewHeader}>
            <Chip
              mode="flat"
              style={{ backgroundColor: typeConfig.backgroundColor }}
              textStyle={{ color: typeConfig.color, fontWeight: '600' }}
              icon={() => <WebIcon name={typeConfig.icon} size={14} color={typeConfig.color} />}
            >
              {formData.type.toUpperCase()}
            </Chip>
            
            <View style={[styles.priorityBadge, { backgroundColor: theme.colors.p2 }]}>
              <Text style={styles.priorityText}>{formData.priority}</Text>
            </View>
          </View>
          
          <Text variant="titleMedium" style={[styles.reviewTitle, { color: theme.colors.onSurface }]}>
            {formData.title}
          </Text>
          
          <Text variant="bodyMedium" style={[styles.reviewDescription, { color: theme.colors.onSurfaceVariant }]}>
            {formData.description}
          </Text>
          
          <View style={styles.reviewMeta}>
            <View style={styles.reviewMetaItem}>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Severity Score
              </Text>
              <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
                {calculateSeverityScore(formData.impact, formData.likelihood)}
              </Text>
            </View>
            
            <View style={styles.reviewMetaItem}>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Impact / Likelihood
              </Text>
              <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
                {formData.impact} / {formData.likelihood}
              </Text>
            </View>
          </View>
          
          <Divider style={{ marginVertical: 12 }} />
          
          <View style={styles.reviewAssignments}>
            {selectedWorkstream && (
              <View style={styles.assignmentRow}>
                <View style={[styles.colorDot, { backgroundColor: selectedWorkstream.color }]} />
                <Text style={{ color: theme.colors.onSurface }}>{selectedWorkstream.label}</Text>
              </View>
            )}
            
            {selectedOwner && (
              <View style={styles.assignmentRow}>
                <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
                  <Text style={{ color: theme.colors.onPrimary, fontSize: 10, fontWeight: '600' }}>
                    {selectedOwner.initials || selectedOwner.name.substring(0, 2).toUpperCase()}
                  </Text>
                </View>
                <Text style={{ color: theme.colors.onSurface }}>{selectedOwner.name}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderTypeBasicsStep();
      case 1: return renderDetailsStep();
      case 2: return renderAssessmentStep();
      case 3: return renderAssignmentStep();
      case 4: return renderReviewStep();
      default: return renderTypeBasicsStep();
    }
  };

  const renderNavigationButtons = () => (
    <View style={[styles.navigationButtons, ultraModernStyles.ultraCard, { backgroundColor: theme.colors.surface }]}>
      <Button
        mode="outlined"
        onPress={handlePrevious}
        disabled={currentStep === 0}
        style={ultraModernStyles.secondaryButton}
        icon="arrow-left"
      >
        Previous
      </Button>
      
      {currentStep === steps.length - 1 ? (
        <Button
          mode="contained"
          onPress={handleCreate}
          loading={isCreating}
          disabled={!canProceed()}
          style={[ultraModernStyles.primaryButton, { flex: 1 }]}
          icon="check"
        >
          {isCreating ? 'Creating...' : 'Create Item'}
        </Button>
      ) : (
        <Button
          mode="contained"
          onPress={handleNext}
          disabled={!canProceed()}
          style={[ultraModernStyles.primaryButton, { flex: 1 }]}
          icon="arrow-right"
          contentStyle={{ flexDirection: 'row-reverse' }}
        >
          Next
        </Button>
      )}
    </View>
  );

  return (
    <Layout
      title="Create New Item"
      subtitle={`Step ${currentStep + 1} of ${steps.length}`}
      showBackButton
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderProgressIndicator()}
        {renderCurrentStep()}
      </ScrollView>
      
      {renderNavigationButtons()}
      
      {/* Selection Modals */}
      <Portal>
        <Modal
          visible={workstreamModalVisible}
          onDismiss={() => setWorkstreamModalVisible(false)}
          contentContainerStyle={[styles.modalContent, { backgroundColor: theme.colors.surface }]}
        >
          <Text variant="titleLarge" style={{ color: theme.colors.onSurface, marginBottom: 16 }}>
            Select Workstream
          </Text>
          {workstreams.map((ws) => (
            <Pressable
              key={ws.id}
              style={[styles.modalOption, { backgroundColor: theme.colors.surfaceVariant }]}
              onPress={() => {
                updateFormData({ workstream: ws.id });
                setWorkstreamModalVisible(false);
              }}
            >
              <View style={[styles.colorDot, { backgroundColor: ws.color }]} />
              <Text style={{ color: theme.colors.onSurface, flex: 1 }}>{ws.label}</Text>
              {formData.workstream === ws.id && (
                <WebIcon name="check" size={20} color={theme.colors.primary} />
              )}
            </Pressable>
          ))}
        </Modal>
        
        <Modal
          visible={ownerModalVisible}
          onDismiss={() => setOwnerModalVisible(false)}
          contentContainerStyle={[styles.modalContent, { backgroundColor: theme.colors.surface }]}
        >
          <Text variant="titleLarge" style={{ color: theme.colors.onSurface, marginBottom: 16 }}>
            Select Owner
          </Text>
          {owners.map((owner) => (
            <Pressable
              key={owner.id}
              style={[styles.modalOption, { backgroundColor: theme.colors.surfaceVariant }]}
              onPress={() => {
                updateFormData({ owner: owner.id });
                setOwnerModalVisible(false);
              }}
            >
              <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
                <Text style={{ color: theme.colors.onPrimary, fontSize: 10, fontWeight: '600' }}>
                  {owner.initials || owner.name.substring(0, 2).toUpperCase()}
                </Text>
              </View>
              <Text style={{ color: theme.colors.onSurface, flex: 1 }}>{owner.name}</Text>
              {formData.owner === owner.id && (
                <WebIcon name="check" size={20} color={theme.colors.primary} />
              )}
            </Pressable>
          ))}
        </Modal>
      </Portal>
    </Layout>
  );
};

const styles = StyleSheet.create({
  progressContainer: {
    padding: ultraModernStyles.spacing.lg,
    marginBottom: ultraModernStyles.spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ultraModernStyles.spacing.md,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: ultraModernStyles.spacing.lg,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepContent: {
    padding: ultraModernStyles.spacing.lg,
    marginBottom: ultraModernStyles.spacing.md,
  },
  stepTitle: {
    fontWeight: '600',
    marginBottom: ultraModernStyles.spacing.lg,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: ultraModernStyles.spacing.sm,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ultraModernStyles.spacing.md,
    marginBottom: ultraModernStyles.spacing.lg,
  },
  typeCard: {
    flex: 1,
    minWidth: 150,
    padding: ultraModernStyles.spacing.lg,
    borderRadius: ultraModernStyles.radius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    gap: ultraModernStyles.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  typeTitle: {
    fontWeight: '600',
  },
  descriptionInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  divider: {
    marginVertical: ultraModernStyles.spacing.lg,
  },
  assessmentSection: {
    marginBottom: ultraModernStyles.spacing.lg,
  },
  segmentedButtons: {
    marginBottom: ultraModernStyles.spacing.sm,
  },
  severityDisplay: {
    alignItems: 'center',
    padding: ultraModernStyles.spacing.lg,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: ultraModernStyles.radius.lg,
    marginBottom: ultraModernStyles.spacing.lg,
  },
  assignmentSection: {
    marginBottom: ultraModernStyles.spacing.lg,
  },
  selectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: ultraModernStyles.spacing.md,
    borderRadius: ultraModernStyles.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ultraModernStyles.spacing.sm,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewCard: {
    padding: ultraModernStyles.spacing.lg,
    borderRadius: ultraModernStyles.radius.lg,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ultraModernStyles.spacing.md,
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
  reviewTitle: {
    fontWeight: '600',
    marginBottom: ultraModernStyles.spacing.sm,
  },
  reviewDescription: {
    lineHeight: 20,
    marginBottom: ultraModernStyles.spacing.md,
  },
  reviewMeta: {
    flexDirection: 'row',
    gap: ultraModernStyles.spacing.lg,
  },
  reviewMetaItem: {
    flex: 1,
    alignItems: 'center',
  },
  reviewAssignments: {
    gap: ultraModernStyles.spacing.sm,
  },
  assignmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ultraModernStyles.spacing.sm,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: ultraModernStyles.spacing.md,
    padding: ultraModernStyles.spacing.lg,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalContent: {
    margin: ultraModernStyles.spacing.lg,
    padding: ultraModernStyles.spacing.lg,
    borderRadius: ultraModernStyles.radius.lg,
    maxHeight: '70%',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ultraModernStyles.spacing.sm,
    padding: ultraModernStyles.spacing.md,
    borderRadius: ultraModernStyles.radius.md,
    marginBottom: ultraModernStyles.spacing.sm,
  },
});

export default UltraModernCreateItemScreen;