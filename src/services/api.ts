import { RAIDItem, AIAnalysis } from '../types';

// Dynamic API URL based on environment
const getApiBaseUrl = (): string => {
  // For development, try different possible backend URLs
  if (__DEV__) {
    // Try localhost first, then fallback to other possibilities
    return 'http://localhost:8001/api';
  }
  // For production, use environment variable or default
  return process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';
};

const API_BASE_URL = getApiBaseUrl();

interface AIAnalysisRequest {
  item: RAIDItem;
  analysisType: 'analysis' | 'validation';
}

interface AIAnalysisResponse {
  analysis: string;
  suggestedPriority: string;
  suggestedStatus?: string;
  confidence: number;
  flags: Array<{
    code: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
    field?: string;
  }>;
}

interface AIBatchRequest {
  items: RAIDItem[];
  analysisType: 'analysis' | 'validation';
}

interface AIBatchResponse {
  results: Array<{
    itemId: string;
    itemTitle: string;
    analysis: string;
    suggestedPriority: string;
    suggestedStatus?: string;
    confidence: number;
    flags: any[];
  }>;
}

// AI Provider Management Interfaces
interface AIProvider {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'gemini';
  model: string;
  api_key?: string;
  api_key_masked: string;
  enabled: boolean;
  status: 'active' | 'inactive' | 'error' | 'validating' | 'invalid';
  last_validated?: string;
}

interface AIProvidersResponse {
  providers: AIProvider[];
  total: number;
  active: number;
}

interface ValidationResponse {
  valid: boolean;
  status: string;
  error?: string;
  model_info?: any;
}

// RAID Item Interfaces
interface RAIDItemsResponse {
  items: RAIDItem[];
  total: number;
}

interface DashboardStats {
  total: number;
  by_type: Record<string, number>;
  by_status: Record<string, number>;
  by_priority: Record<string, number>;
  recent_activity: number;
  overdue: number;
  active_items: number;
}

interface FileUploadResponse {
  message: string;
  file: {
    id: string;
    original_name: string;
    filename: string;
    size: number;
    content_type: string;
    uploaded_at: string;
  };
}

class APIService {
  private baseUrl = API_BASE_URL;

  // Health check
  async healthCheck(): Promise<{ status: string; service: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return await response.json();
    } catch (error) {
      throw new Error(`Health check failed: ${error}`);
    }
  }

  // ============================================================================
  // RAID ITEMS API
  // ============================================================================

  async getRaidItems(): Promise<RAIDItemsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/raid-items`);
      if (!response.ok) {
        throw new Error(`Failed to get RAID items: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Get RAID items error:', error);
      throw error;
    }
  }

  async getRaidItem(itemId: string): Promise<RAIDItem> {
    try {
      const response = await fetch(`${this.baseUrl}/raid-items/${itemId}`);
      if (!response.ok) {
        throw new Error(`Failed to get RAID item: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Get RAID item error:', error);
      throw error;
    }
  }

  async createRaidItem(itemData: Omit<RAIDItem, 'id' | 'createdAt' | 'updatedAt' | 'history' | 'severityScore' | 'ai' | 'attachments'>): Promise<RAIDItem> {
    try {
      const response = await fetch(`${this.baseUrl}/raid-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create RAID item: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.item;
    } catch (error) {
      console.error('Create RAID item error:', error);
      throw error;
    }
  }

  async updateRaidItem(itemId: string, updates: Partial<RAIDItem>): Promise<RAIDItem> {
    try {
      const response = await fetch(`${this.baseUrl}/raid-items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update RAID item: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.item;
    } catch (error) {
      console.error('Update RAID item error:', error);
      throw error;
    }
  }

  async deleteRaidItem(itemId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/raid-items/${itemId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete RAID item: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Delete RAID item error:', error);
      throw error;
    }
  }

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await fetch(`${this.baseUrl}/raid-items/stats/dashboard`);
      if (!response.ok) {
        throw new Error(`Failed to get dashboard stats: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      throw error;
    }
  }

  // ============================================================================
  // FILE UPLOAD API
  // ============================================================================

  async uploadFile(file: File): Promise<FileUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload file: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  async getUploadedFile(fileId: string): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/upload/${fileId}`);
      if (!response.ok) {
        throw new Error(`Failed to get uploaded file: ${response.statusText}`);
      }
      return await response.blob();
    } catch (error) {
      console.error('Get uploaded file error:', error);
      throw error;
    }
  }

  // AI Provider Management
  async getAIProviders(): Promise<AIProvidersResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/providers`);
      if (!response.ok) {
        throw new Error(`Failed to get AI providers: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Get AI providers error:', error);
      throw error;
    }
  }

  async addAIProvider(provider: {
    name: string;
    provider: string;
    model: string;
    api_key: string;
  }): Promise<AIProvider> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/providers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(provider),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to add AI provider: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Add AI provider error:', error);
      throw error;
    }
  }

  async updateAIProvider(providerId: string, updates: Partial<AIProvider>): Promise<AIProvider> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/providers/${providerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update AI provider: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Update AI provider error:', error);
      throw error;
    }
  }

  async deleteAIProvider(providerId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/providers/${providerId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete AI provider: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Delete AI provider error:', error);
      throw error;
    }
  }

  async validateAIProvider(providerId: string): Promise<ValidationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/providers/${providerId}/validate`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to validate AI provider: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Validate AI provider error:', error);
      throw error;
    }
  }

  async validateAllProviders(): Promise<{ results: ValidationResponse[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/providers/validate-all`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to validate all providers: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Validate all providers error:', error);
      throw error;
    }
  }

  // Text Analysis (Multi-Provider)
  async analyzeText(text: string, providers: string[] = []): Promise<{
    results: Array<{
      provider: string;
      model: string;
      analysis: any;
      confidence: number;
      processing_time: number;
    }>;
    consensus: {
      risks: string[];
      assumptions: string[];
      issues: string[];
      dependencies: string[];
      confidence_score: number;
    };
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/analyze-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, providers }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to analyze text: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Analyze text error:', error);
      throw error;
    }
  }

  // Analyze single item (legacy support)
  async analyzeItem(item: RAIDItem, analysisType: 'analysis' | 'validation' = 'analysis'): Promise<AIAnalysis> {
    try {
      const request: AIAnalysisRequest = { item, analysisType };
      
      const response = await fetch(`${this.baseUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const result: AIAnalysisResponse = await response.json();
      
      // Convert to our expected format
      return {
        analysis: result.analysis,
        suggestedPriority: result.suggestedPriority as any,
        suggestedStatus: result.suggestedStatus as any,
        validationNotes: result.flags.map(f => f.message).join('; '),
        lastAnalyzedAt: new Date(),
        confidence: result.confidence,
        flags: result.flags,
      };
    } catch (error) {
      console.error('AI Analysis error:', error);
      throw error;
    }
  }

  // Batch analyze multiple items
  async batchAnalyze(
    items: RAIDItem[], 
    analysisType: 'analysis' | 'validation' = 'analysis'
  ): Promise<Array<{
    itemId: string;
    itemTitle: string;
    analysis: AIAnalysis;
    error?: string;
  }>> {
    try {
      const request: AIBatchRequest = { items, analysisType };
      
      const response = await fetch(`${this.baseUrl}/batch-analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Batch analysis failed: ${response.statusText}`);
      }

      const result: AIBatchResponse = await response.json();
      
      // Convert to our expected format
      return result.results.map(item => ({
        itemId: item.itemId,
        itemTitle: item.itemTitle,
        analysis: {
          analysis: item.analysis,
          suggestedPriority: item.suggestedPriority as any,
          suggestedStatus: item.suggestedStatus as any,
          validationNotes: item.flags.map(f => f.message).join('; '),
          lastAnalyzedAt: new Date(),
          confidence: item.confidence,
          flags: item.flags,
        },
      }));
    } catch (error) {
      console.error('Batch AI Analysis error:', error);
      throw error;
    }
  }

  // Validate item for data quality
  async validateItem(item: RAIDItem): Promise<AIAnalysis> {
    return this.analyzeItem(item, 'validation');
  }

  // Get AI configuration
  async getAIConfig(): Promise<{
    model: string;
    provider: string;
    available: boolean;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/config`);
      return await response.json();
    } catch (error) {
      console.error('Get AI config error:', error);
      throw error;
    }
  }

  // Generate executive summary (mock for now)
  async generateExecutiveSummary(items: RAIDItem[]): Promise<string> {
    // This could be extended to use AI for executive summary generation
    const total = items.length;
    const byType = items.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const critical = items.filter(item => item.priority === 'P0' || item.priority === 'P1').length;
    
    let summary = `Executive Summary\n\n`;
    summary += `Total RAID items: ${total}\n\n`;
    
    if (critical > 0) {
      summary += `⚠️ ${critical} critical items require immediate attention.\n\n`;
    }
    
    summary += `Distribution by type:\n`;
    Object.entries(byType).forEach(([type, count]) => {
      summary += `- ${type}: ${count}\n`;
    });

    return summary;
  }
}

export const apiService = new APIService();
export default apiService;