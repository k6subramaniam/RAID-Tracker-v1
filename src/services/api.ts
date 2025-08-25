import { RAIDItem, AIAnalysis } from '../types';

const API_BASE_URL = 'http://localhost:8001/api';

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

  // Analyze single item
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