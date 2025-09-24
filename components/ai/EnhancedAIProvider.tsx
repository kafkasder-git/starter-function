/**
 * @fileoverview Enhanced AI Provider Component
 * @description Centralized AI functionality provider with context management
 */

import type { ReactNode } from 'react';
import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { environment } from '../../lib/environment';
import { monitoring } from '../../services/monitoringService';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface AIConfig {
  provider: 'openrouter' | 'freeai' | 'openai' | 'anthropic';
  model: string;
  temperature: number;
  maxTokens: number;
  apiKey?: string;
  baseUrl?: string;
  // Yeni gelişmiş özellikler
  enableStreaming?: boolean;
  enableMemory?: boolean;
  enableContext?: boolean;
  customInstructions?: string;
  language?: 'tr' | 'en' | 'auto';
  responseFormat?: 'text' | 'json' | 'markdown';
}

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost?: number;
  };
  metadata?: {
    model: string;
    provider: string;
    processingTime: number;
    timestamp: Date;
  };
  // Yeni gelişmiş özellikler
  suggestions?: string[];
  confidence?: number;
  sources?: string[];
  actionItems?: {
    type: 'navigate' | 'create' | 'update' | 'delete';
    target: string;
    description: string;
  }[];
  sentiment?: 'positive' | 'negative' | 'neutral';
  category?: 'question' | 'request' | 'complaint' | 'suggestion';
}

export interface AIError {
  code: string;
  message: string;
  details?: any;
}

export interface AIContextType {
  // State
  isLoading: boolean;
  isInitialized: boolean;
  error: AIError | null;
  // Yeni gelişmiş state'ler
  conversationHistory: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    metadata?: any;
  }[];
  currentContext: string;
  memory: Map<string, any>;
  isStreaming: boolean;

  // Configuration
  config: AIConfig;
  setConfig: (config: Partial<AIConfig>) => void;

  // Core AI Functions
  generateText: (prompt: string, options?: Partial<AIConfig>) => Promise<AIResponse>;
  trackAIUsage: (action: string, data?: any) => void;
  generateCode: (
    prompt: string,
    language: string,
    options?: Partial<AIConfig>,
  ) => Promise<AIResponse>;
  analyzeData: (data: any, question: string, options?: Partial<AIConfig>) => Promise<AIResponse>;
  translateText: (
    text: string,
    targetLanguage: string,
    options?: Partial<AIConfig>,
  ) => Promise<AIResponse>;

  // Specialized Functions
  generateReport: (data: any, reportType: string) => Promise<AIResponse>;
  analyzeBeneficiary: (beneficiaryData: any) => Promise<AIResponse>;
  generateDonationReceipt: (donationData: any) => Promise<AIResponse>;
  createKumbaraCollectionPlan: (areaData: any) => Promise<AIResponse>;

  // Utility Functions
  validatePrompt: (prompt: string) => boolean;
  estimateCost: (prompt: string, config?: Partial<AIConfig>) => Promise<number>;
  getUsageStats: () => Promise<any>;

  // Error Handling
  clearError: () => void;
  retry: () => Promise<void>;
}

export interface AIProviderProps {
  children: ReactNode;
  config?: Partial<AIConfig>;
  onNavigate?: (module: string, page?: string, subPage?: string) => void;
  currentModule?: string;
  currentPage?: string;
  currentSubPage?: string;
}

// =============================================================================
// DEFAULT CONFIGURATION
// =============================================================================

const DEFAULT_CONFIG: AIConfig = {
  provider: 'openrouter',
  model: 'anthropic/claude-3-haiku',
  temperature: 0.7,
  maxTokens: 4000,
  apiKey: environment.features.ai ? undefined : 'demo-key',
  baseUrl: undefined,
};

// =============================================================================
// AI CONTEXT
// =============================================================================

const AIContext = createContext<AIContextType | undefined>(undefined);

// =============================================================================
// AI SERVICE CLASS
// =============================================================================

class AIService {
  private config: AIConfig;

  constructor(config: AIConfig = DEFAULT_CONFIG) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AIConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Validate prompt
   */
  validatePrompt(prompt: string): boolean {
    if (!prompt || prompt.trim().length === 0) {
      return false;
    }

    if (prompt.length > 10000) {
      return false;
    }

    // Basic XSS check
    if (/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(prompt)) {
      return false;
    }

    return true;
  }

  /**
   * Generate text using AI
   */
  async generateText(prompt: string, options?: Partial<AIConfig>): Promise<AIResponse> {
    const startTime = Date.now();
    const config = { ...this.config, ...options };

    try {
      // Input validation
      if (!this.validatePrompt(prompt)) {
        throw new Error('Invalid prompt provided');
      }

      // Track API call
      monitoring.trackApiCall('ai/generate-text', 'POST', 0, 0, {
        provider: config.provider,
        model: config.model,
      });

      let response: AIResponse;

      switch (config.provider) {
        case 'openrouter':
          response = await this.callOpenRouter(prompt, config);
          break;
        case 'freeai':
          response = await this.callFreeAI(prompt, config);
          break;
        default:
          throw new Error(`Unsupported AI provider: ${config.provider}`);
      }

      const processingTime = Date.now() - startTime;

      // Track success
      monitoring.trackApiCall('ai/generate-text', 'POST', processingTime, 200, {
        provider: config.provider,
        model: config.model,
        tokens: response.usage?.totalTokens || 0,
      });

      return {
        ...response,
        metadata: {
          model: response.metadata?.model || 'unknown',
          provider: response.metadata?.provider || 'unknown',
          processingTime,
          timestamp: new Date(),
        },
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;

      // Track error
      monitoring.trackApiCall('ai/generate-text', 'POST', processingTime, 500, {
        provider: config.provider,
        model: config.model,
        error: (error as Error).message,
      });

      throw error;
    }
  }

  /**
   * Call OpenRouter API
   */
  private async callOpenRouter(prompt: string, config: AIConfig): Promise<AIResponse> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Kafkas Derneği Yönetim Sistemi',
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      content: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
        cost: data.usage.cost || 0,
      },
      metadata: {
        model: config.model,
        provider: 'openrouter',
        processingTime: 0,
        timestamp: new Date(),
      },
    };
  }

  /**
   * Call FreeAI API
   */
  private async callFreeAI(prompt: string, config: AIConfig): Promise<AIResponse> {
    // Mock implementation for FreeAI
    // In real implementation, this would call the FreeAI service
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

    return {
      content: `AI Response for: ${prompt.substring(0, 100)}...`,
      usage: {
        promptTokens: prompt.length,
        completionTokens: 150,
        totalTokens: prompt.length + 150,
        cost: 0,
      },
      metadata: {
        model: config.model,
        provider: 'freeai',
        processingTime: 0,
        timestamp: new Date(),
      },
    };
  }

  /**
   * Generate code
   */
  async generateCode(
    prompt: string,
    language: string,
    options?: Partial<AIConfig>,
  ): Promise<AIResponse> {
    const codePrompt = `Generate ${language} code for: ${prompt}`;

    return this.generateText(codePrompt, {
      ...options,
      temperature: 0.3,
      maxTokens: 2000,
    });
  }

  /**
   * Analyze data
   */
  async analyzeData(data: any, question: string, options?: Partial<AIConfig>): Promise<AIResponse> {
    const analysisPrompt = `Analyze the following data and answer: ${question}\n\nData: ${JSON.stringify(data, null, 2)}`;

    return this.generateText(analysisPrompt, {
      ...options,
      temperature: 0.1,
      maxTokens: 1000,
    });
  }

  /**
   * Translate text
   */
  async translateText(
    text: string,
    targetLanguage: string,
    options?: Partial<AIConfig>,
  ): Promise<AIResponse> {
    const translatePrompt = `Translate the following text to ${targetLanguage}: ${text}`;

    return this.generateText(translatePrompt, {
      ...options,
      temperature: 0.3,
      maxTokens: 2000,
    });
  }

  /**
   * Generate report
   */
  async generateReport(data: any, reportType: string): Promise<AIResponse> {
    const reportPrompt = `Generate a ${reportType} report based on the following data: ${JSON.stringify(data, null, 2)}`;

    return this.generateText(reportPrompt, {
      temperature: 0.4,
      maxTokens: 3000,
    });
  }

  /**
   * Analyze beneficiary data
   */
  async analyzeBeneficiary(beneficiaryData: any): Promise<AIResponse> {
    const analysisPrompt = `Analyze beneficiary data and provide insights: ${JSON.stringify(beneficiaryData, null, 2)}`;

    return this.generateText(analysisPrompt, {
      temperature: 0.2,
      maxTokens: 1500,
    });
  }

  /**
   * Generate donation receipt
   */
  async generateDonationReceipt(donationData: any): Promise<AIResponse> {
    const receiptPrompt = `Generate a professional donation receipt for: ${JSON.stringify(donationData, null, 2)}`;

    return this.generateText(receiptPrompt, {
      temperature: 0.1,
      maxTokens: 1000,
    });
  }

  /**
   * Create kumbara collection plan
   */
  async createKumbaraCollectionPlan(areaData: any): Promise<AIResponse> {
    const planPrompt = `Create an optimized collection plan for kumbara based on area data: ${JSON.stringify(areaData, null, 2)}`;

    return this.generateText(planPrompt, {
      temperature: 0.5,
      maxTokens: 2000,
    });
  }

  /**
   * Estimate cost
   */
  async estimateCost(prompt: string, config?: Partial<AIConfig>): Promise<number> {
    const configToUse = { ...this.config, ...config };

    // Rough estimation based on token count and provider
    const estimatedTokens = Math.ceil(prompt.length / 4); // Rough token estimation
    const costPerToken = configToUse.provider === 'openrouter' ? 0.000001 : 0;

    return estimatedTokens * costPerToken;
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(): Promise<any> {
    // This would typically fetch from an analytics service
    return {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      averageResponseTime: 0,
      successRate: 100,
    };
  }
}

// =============================================================================
// AI PROVIDER COMPONENT
// =============================================================================

export const EnhancedAIProvider: React.FC<AIProviderProps> = ({
  children,
  config: initialConfig,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<AIError | null>(null);
  const [config, setConfigState] = useState<AIConfig>({ ...DEFAULT_CONFIG, ...initialConfig });
  const [aiService] = useState(() => new AIService(config));

  // Initialize AI service
  useEffect(() => {
    const initializeAI = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Update service config
        aiService.updateConfig(config);

        // Test connection
        await aiService.estimateCost('test');

        setIsInitialized(true);

        monitoring.trackFeatureUsage('ai', 'initialize', {
          provider: config.provider,
          model: config.model,
        });
      } catch (err) {
        const aiError: AIError = {
          code: 'INITIALIZATION_FAILED',
          message: (err as Error).message,
          details: err,
        };
        setError(aiError);
        console.error('AI initialization failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAI();
  }, [config, aiService]);

  // Context value
  const contextValue: AIContextType = {
    // State
    isLoading,
    isInitialized,
    error,
    conversationHistory: [], // TODO: Implement conversation history
    currentContext: '', // TODO: Implement current context
    memory: new Map(), // TODO: Implement memory
    isStreaming: false, // TODO: Implement streaming

    // Configuration
    config,
    setConfig: useCallback(
      (newConfig: Partial<AIConfig>) => {
        setConfigState((prev) => ({ ...prev, ...newConfig }));
        aiService.updateConfig(newConfig);
      },
      [aiService],
    ),

    // Core AI Functions
    trackAIUsage: useCallback((action: string, data?: any) => {
      console.log('AI Usage tracked:', { action, data, timestamp: new Date() });
    }, []),
    generateText: useCallback(
      async (prompt: string, options?: Partial<AIConfig>) => {
        setIsLoading(true);
        setError(null);

        try {
          const result = await aiService.generateText(prompt, options);
          return result;
        } catch (err) {
          const aiError: AIError = {
            code: 'GENERATION_FAILED',
            message: (err as Error).message,
            details: err,
          };
          setError(aiError);
          throw err;
        } finally {
          setIsLoading(false);
        }
      },
      [aiService],
    ),

    generateCode: useCallback(
      async (prompt: string, language: string, options?: Partial<AIConfig>) => {
        setIsLoading(true);
        setError(null);

        try {
          return await aiService.generateCode(prompt, language, options);
        } catch (err) {
          const aiError: AIError = {
            code: 'CODE_GENERATION_FAILED',
            message: (err as Error).message,
            details: err,
          };
          setError(aiError);
          throw err;
        } finally {
          setIsLoading(false);
        }
      },
      [aiService],
    ),

    analyzeData: useCallback(
      async (data: any, question: string, options?: Partial<AIConfig>) => {
        setIsLoading(true);
        setError(null);

        try {
          return await aiService.analyzeData(data, question, options);
        } catch (err) {
          const aiError: AIError = {
            code: 'ANALYSIS_FAILED',
            message: (err as Error).message,
            details: err,
          };
          setError(aiError);
          throw err;
        } finally {
          setIsLoading(false);
        }
      },
      [aiService],
    ),

    translateText: useCallback(
      async (text: string, targetLanguage: string, options?: Partial<AIConfig>) => {
        setIsLoading(true);
        setError(null);

        try {
          return await aiService.translateText(text, targetLanguage, options);
        } catch (err) {
          const aiError: AIError = {
            code: 'TRANSLATION_FAILED',
            message: (err as Error).message,
            details: err,
          };
          setError(aiError);
          throw err;
        } finally {
          setIsLoading(false);
        }
      },
      [aiService],
    ),

    // Specialized Functions
    generateReport: useCallback(
      async (data: any, reportType: string) => {
        setIsLoading(true);
        setError(null);

        try {
          return await aiService.generateReport(data, reportType);
        } catch (err) {
          const aiError: AIError = {
            code: 'REPORT_GENERATION_FAILED',
            message: (err as Error).message,
            details: err,
          };
          setError(aiError);
          throw err;
        } finally {
          setIsLoading(false);
        }
      },
      [aiService],
    ),

    analyzeBeneficiary: useCallback(
      async (beneficiaryData: any) => {
        setIsLoading(true);
        setError(null);

        try {
          return await aiService.analyzeBeneficiary(beneficiaryData);
        } catch (err) {
          const aiError: AIError = {
            code: 'BENEFICIARY_ANALYSIS_FAILED',
            message: (err as Error).message,
            details: err,
          };
          setError(aiError);
          throw err;
        } finally {
          setIsLoading(false);
        }
      },
      [aiService],
    ),

    generateDonationReceipt: useCallback(
      async (donationData: any) => {
        setIsLoading(true);
        setError(null);

        try {
          return await aiService.generateDonationReceipt(donationData);
        } catch (err) {
          const aiError: AIError = {
            code: 'RECEIPT_GENERATION_FAILED',
            message: (err as Error).message,
            details: err,
          };
          setError(aiError);
          throw err;
        } finally {
          setIsLoading(false);
        }
      },
      [aiService],
    ),

    createKumbaraCollectionPlan: useCallback(
      async (areaData: any) => {
        setIsLoading(true);
        setError(null);

        try {
          return await aiService.createKumbaraCollectionPlan(areaData);
        } catch (err) {
          const aiError: AIError = {
            code: 'PLAN_GENERATION_FAILED',
            message: (err as Error).message,
            details: err,
          };
          setError(aiError);
          throw err;
        } finally {
          setIsLoading(false);
        }
      },
      [aiService],
    ),

    // Utility Functions
    validatePrompt: useCallback((prompt: string) => aiService.validatePrompt(prompt), [aiService]),
    estimateCost: useCallback(
      (prompt: string, config?: Partial<AIConfig>) => aiService.estimateCost(prompt, config),
      [aiService],
    ),
    getUsageStats: useCallback(() => aiService.getUsageStats(), [aiService]),

    // Error Handling
    clearError: useCallback(() => {
      setError(null);
    }, []),
    retry: useCallback(async () => {
      // Re-initialize AI service
      setIsLoading(true);
      setError(null);

      try {
        await aiService.estimateCost('test');
        setIsInitialized(true);
      } catch (err) {
        const aiError: AIError = {
          code: 'RETRY_FAILED',
          message: (err as Error).message,
          details: err,
        };
        setError(aiError);
      } finally {
        setIsLoading(false);
      }
    }, [aiService]),
  };

  return <AIContext.Provider value={contextValue}>{children}</AIContext.Provider>;
};

// =============================================================================
// HOOK FOR USING AI CONTEXT
// =============================================================================

export const useAI = (): AIContextType => {
  const context = useContext(AIContext);

  if (context === undefined) {
    throw new Error('useAI must be used within an EnhancedAIProvider');
  }

  return context;
};

// =============================================================================
// UTILITY HOOKS
// =============================================================================

export const useAIGeneration = () => {
  const ai = useAI();

  return {
    generateText: ai.generateText,
    generateCode: ai.generateCode,
    isLoading: ai.isLoading,
    error: ai.error,
    clearError: ai.clearError,
  };
};

export const useAIAnalysis = () => {
  const ai = useAI();

  return {
    analyzeData: ai.analyzeData,
    analyzeBeneficiary: ai.analyzeBeneficiary,
    isLoading: ai.isLoading,
    error: ai.error,
    clearError: ai.clearError,
  };
};

export const useAIReporting = () => {
  const ai = useAI();

  return {
    generateReport: ai.generateReport,
    generateDonationReceipt: ai.generateDonationReceipt,
    isLoading: ai.isLoading,
    error: ai.error,
    clearError: ai.clearError,
  };
};

export default EnhancedAIProvider;
