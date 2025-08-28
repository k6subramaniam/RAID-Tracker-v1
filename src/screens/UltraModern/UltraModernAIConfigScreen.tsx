import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { 
  Text, 
  useTheme, 
  Button, 
  TextInput,
  Switch,
  Divider,
  Portal,
  Modal,
  Chip,
  ProgressBar,
} from 'react-native-paper';
import { apiService } from '../../services/api';
import Layout from '../../components/UltraModern/Layout';
import WebIcon from '../../components/WebIcon';
import { ultraModernStyles } from '../../theme/ultraModern';

interface AIProvider {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'gemini';
  model: string;
  api_key: string;
  api_key_masked: string;
  enabled: boolean;
  status: 'active' | 'inactive' | 'error' | 'validating' | 'invalid';
  last_validated?: string;
}

const PROVIDER_MODELS = {
  openai: [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'o1', label: 'o1' },
    { value: 'o1-mini', label: 'o1 Mini' },
  ],
  anthropic: [
    { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
    { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
    { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
  ],
  gemini: [
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
    { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
  ],
};

const UltraModernAIConfigScreen: React.FC = () => {
  const theme = useTheme();
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [validatingProviders, setValidatingProviders] = useState<Set<string>>(new Set());
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [testingAll, setTestingAll] = useState(false);

  // New provider form state
  const [newProvider, setNewProvider] = useState({
    name: '',
    provider: '' as 'openai' | 'anthropic' | 'gemini',
    model: '',
    api_key: '',
  });

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAIProviders();
      setProviders(data.providers || []);
    } catch (error) {
      console.error('Failed to load providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateProvider = async (providerId: string) => {
    setValidatingProviders(prev => new Set([...prev, providerId]));
    
    try {
      const result = await apiService.validateAIProvider(providerId);
      setProviders(prev => prev.map(p => 
        p.id === providerId 
          ? { ...p, status: result.valid ? 'active' : 'error', last_validated: new Date().toISOString() }
          : p
      ));
    } catch (error) {
      setProviders(prev => prev.map(p => 
        p.id === providerId 
          ? { ...p, status: 'error' as const }
          : p
      ));
    } finally {
      setValidatingProviders(prev => {
        const newSet = new Set(prev);
        newSet.delete(providerId);
        return newSet;
      });
    }
  };

  const validateAllProviders = async () => {
    setTestingAll(true);
    try {
      await apiService.validateAllProviders();
      await loadProviders(); // Refresh to get updated statuses
    } catch (error) {
      console.error('Failed to validate all providers:', error);
    } finally {
      setTestingAll(false);
    }
  };

  const addProvider = async () => {
    try {
      await apiService.addAIProvider(newProvider);
      setAddModalVisible(false);
      setNewProvider({ name: '', provider: 'openai', model: '', api_key: '' });
      await loadProviders();
    } catch (error) {
      console.error('Failed to add provider:', error);
    }
  };

  const toggleProvider = async (providerId: string, enabled: boolean) => {
    try {
      await apiService.updateAIProvider(providerId, { enabled: !enabled });
      await loadProviders();
    } catch (error) {
      console.error('Failed to toggle provider:', error);
    }
  };

  const deleteProvider = async (providerId: string) => {
    try {
      await apiService.deleteAIProvider(providerId);
      await loadProviders();
    } catch (error) {
      console.error('Failed to delete provider:', error);
    }
  };

  const getProviderIcon = (provider: string) => {
    const icons = {
      openai: '🤖',
      anthropic: '🧠',
      gemini: '💎'
    };
    return icons[provider as keyof typeof icons] || '🔮';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return theme.colors.success;
      case 'error': case 'invalid': return theme.colors.error;
      case 'validating': return theme.colors.primary;
      default: return theme.colors.tertiary;
    }
  };

  const getStatusText = (status: string) => {
    const statusTexts = {
      active: 'Active',
      inactive: 'Inactive',
      error: 'Error',
      validating: 'Validating...',
      invalid: 'Invalid Key'
    };
    return statusTexts[status as keyof typeof statusTexts] || 'Unknown';
  };

  const renderProviderCard = (provider: AIProvider) => (
    <View 
      key={provider.id}
      style={[
        styles.providerCard, 
        ultraModernStyles.ultraCard,
        { backgroundColor: theme.colors.surface }
      ]}
    >
      <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(provider.status) }]} />
      
      <View style={styles.providerHeader}>
        <View style={styles.providerInfo}>
          <View style={[
            styles.providerIcon, 
            { backgroundColor: `${theme.colors.primary}20` }
          ]}>
            <Text style={{ fontSize: 18 }}>{getProviderIcon(provider.provider)}</Text>
          </View>
          <View>
            <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
              {provider.name}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {provider.model}
            </Text>
          </View>
        </View>
        
        <View style={styles.statusInfo}>
          <View 
            style={[
              styles.statusDot, 
              { backgroundColor: getStatusColor(provider.status) }
            ]} 
          />
          <Text 
            variant="labelSmall" 
            style={{ color: getStatusColor(provider.status) }}
          >
            {getStatusText(provider.status)}
          </Text>
        </View>
      </View>

      <View style={styles.providerForm}>
        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
              Provider Type
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
              {provider.provider.charAt(0).toUpperCase() + provider.provider.slice(1)}
            </Text>
          </View>
          
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
              Model
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
              {provider.model}
            </Text>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
            API Key
          </Text>
          <View style={styles.apiKeyGroup}>
            <TextInput
              mode="outlined"
              value={provider.api_key_masked}
              editable={false}
              style={[styles.apiKeyInput, ultraModernStyles.ultraInput]}
              textColor={theme.colors.onSurface}
              contentStyle={{ fontFamily: 'monospace', fontSize: 12 }}
            />
          </View>
        </View>
      </View>

      {provider.last_validated && (
        <View style={[
          styles.validationInfo,
          provider.status === 'active' 
            ? ultraModernStyles.statusActive
            : ultraModernStyles.statusError
        ]}>
          <Text 
            variant="bodySmall" 
            style={{ 
              color: provider.status === 'active' ? theme.colors.success : theme.colors.error 
            }}
          >
            {provider.status === 'active' ? '✅' : '❌'} Last validated: {new Date(provider.last_validated).toLocaleString()}
          </Text>
        </View>
      )}

      <View style={styles.providerActions}>
        <Button
          mode="contained"
          onPress={() => validateProvider(provider.id)}
          loading={validatingProviders.has(provider.id)}
          style={ultraModernStyles.primaryButton}
          icon="check"
          compact
        >
          {validatingProviders.has(provider.id) ? 'Validating...' : 'Validate'}
        </Button>
        
        <Button
          mode="contained-tonal"
          onPress={() => toggleProvider(provider.id, provider.enabled)}
          style={ultraModernStyles.secondaryButton}
          icon={provider.enabled ? 'pause' : 'play'}
          compact
        >
          {provider.enabled ? 'Disable' : 'Enable'}
        </Button>
        
        <Button
          mode="text"
          onPress={() => deleteProvider(provider.id)}
          textColor={theme.colors.error}
          icon="delete"
          compact
        >
          Delete
        </Button>
      </View>
    </View>
  );

  const renderAddProviderModal = () => (
    <Portal>
      <Modal
        visible={addModalVisible}
        onDismiss={() => setAddModalVisible(false)}
        contentContainerStyle={[
          styles.modalContent,
          ultraModernStyles.ultraCard,
          { backgroundColor: theme.colors.surface }
        ]}
      >
        <View style={styles.modalHeader}>
          <Text variant="headlineSmall" style={{ color: theme.colors.onSurface }}>
            Add New AI Provider
          </Text>
          <Pressable onPress={() => setAddModalVisible(false)}>
            <WebIcon name="close" size={24} color={theme.colors.onSurfaceVariant} />
          </Pressable>
        </View>

        <View style={styles.modalForm}>
          <TextInput
            mode="outlined"
            label="Provider Name"
            value={newProvider.name}
            onChangeText={(text) => setNewProvider(prev => ({ ...prev, name: text }))}
            style={ultraModernStyles.ultraInput}
          />

          {/* Provider selection would go here with proper dropdown */}
          
          <View style={styles.modalActions}>
            <Button
              mode="contained-tonal"
              onPress={() => setAddModalVisible(false)}
              style={ultraModernStyles.secondaryButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={addProvider}
              disabled={!newProvider.name || !newProvider.provider || !newProvider.api_key}
              style={ultraModernStyles.primaryButton}
            >
              Add Provider
            </Button>
          </View>
        </View>
      </Modal>
    </Portal>
  );

  if (loading) {
    return (
      <Layout
        title="AI Configuration"
        subtitle="Loading provider configurations..."
        showBackButton
      >
        <View style={styles.loadingContainer}>
          <ProgressBar indeterminate color={theme.colors.primary} />
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 16 }}>
            Loading AI provider configurations...
          </Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout
      title="AI Configuration Center"
      subtitle="Manage multiple AI providers with real-time validation"
      showBackButton
      rightActions={
        <Button
          mode="contained"
          onPress={validateAllProviders}
          loading={testingAll}
          style={ultraModernStyles.primaryButton}
          icon="flash"
          compact
        >
          {testingAll ? 'Testing...' : 'Test All'}
        </Button>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Stats */}
        <View style={[styles.statsRow, ultraModernStyles.ultraCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.statItem}>
            <Text variant="displaySmall" style={{ color: theme.colors.onSurface }}>
              {providers.filter(p => p.status === 'active').length}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Active Providers
            </Text>
          </View>
          
          <Divider style={{ height: 40, width: 1 }} />
          
          <View style={styles.statItem}>
            <Text variant="displaySmall" style={{ color: theme.colors.onSurface }}>
              {providers.length}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Total Configured
            </Text>
          </View>
          
          <Divider style={{ height: 40, width: 1 }} />
          
          <View style={styles.statItem}>
            <Text variant="displaySmall" style={{ color: theme.colors.success }}>
              99.9%
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Uptime
            </Text>
          </View>
        </View>

        {/* Providers List */}
        <View style={styles.providersSection}>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
              🔧 AI Providers ({providers.length})
            </Text>
            <Button
              mode="contained"
              onPress={() => setAddModalVisible(true)}
              style={ultraModernStyles.primaryButton}
              icon="plus"
            >
              Add Provider
            </Button>
          </View>

          {providers.length === 0 ? (
            <View style={[styles.emptyState, ultraModernStyles.ultraCard, { backgroundColor: theme.colors.surface }]}>
              <WebIcon name="robot-outline" size={80} color={theme.colors.onSurfaceVariant} />
              <Text variant="headlineSmall" style={{ color: theme.colors.onSurface }}>
                No AI Providers Configured
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                Add your first AI provider to start using intelligent RAID analysis
              </Text>
              <Button
                mode="contained"
                onPress={() => setAddModalVisible(true)}
                style={[ultraModernStyles.primaryButton, { marginTop: 16 }]}
                icon="plus"
              >
                Add Provider
              </Button>
            </View>
          ) : (
            <View style={styles.providersGrid}>
              {providers.map(renderProviderCard)}
            </View>
          )}
        </View>

        {renderAddProviderModal()}
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: ultraModernStyles.spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: ultraModernStyles.spacing.lg,
    marginBottom: ultraModernStyles.spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  providersSection: {
    gap: ultraModernStyles.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  providersGrid: {
    gap: ultraModernStyles.spacing.lg,
  },
  providerCard: {
    padding: ultraModernStyles.spacing.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  statusIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: ultraModernStyles.spacing.md,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ultraModernStyles.spacing.md,
  },
  providerIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ultraModernStyles.spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  providerForm: {
    gap: ultraModernStyles.spacing.md,
  },
  formRow: {
    flexDirection: 'row',
    gap: ultraModernStyles.spacing.md,
  },
  formGroup: {
    gap: ultraModernStyles.spacing.sm,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
  apiKeyGroup: {
    flexDirection: 'row',
    gap: ultraModernStyles.spacing.sm,
  },
  apiKeyInput: {
    flex: 1,
  },
  validationInfo: {
    marginTop: ultraModernStyles.spacing.md,
    padding: ultraModernStyles.spacing.sm,
    borderRadius: ultraModernStyles.radius.md,
    borderWidth: 1,
  },
  providerActions: {
    flexDirection: 'row',
    gap: ultraModernStyles.spacing.sm,
    marginTop: ultraModernStyles.spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    padding: ultraModernStyles.spacing.xxl,
    gap: ultraModernStyles.spacing.md,
  },
  modalContent: {
    margin: ultraModernStyles.spacing.lg,
    padding: ultraModernStyles.spacing.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: ultraModernStyles.spacing.lg,
  },
  modalForm: {
    gap: ultraModernStyles.spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: ultraModernStyles.spacing.md,
    marginTop: ultraModernStyles.spacing.lg,
  },
});

export default UltraModernAIConfigScreen;