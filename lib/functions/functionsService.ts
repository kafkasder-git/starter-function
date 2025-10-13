/**
 * @fileoverview Functions Service
 * @description Comprehensive serverless functions service with Appwrite integration
 */

import { functions, ID } from '../appwrite';
import { logger } from '../logging/logger';
import { AppwriteException } from 'appwrite';

export interface FunctionExecutionOptions {
  functionId: string;
  data?: string;
  async?: boolean;
  xpath?: string;
  method?: string;
  headers?: Record<string, string>;
}

export interface FunctionExecutionResult {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  functionId: string;
  trigger: string;
  status: 'waiting' | 'processing' | 'completed' | 'failed';
  statusCode: number;
  response: string;
  stdout: string;
  stderr: string;
  duration: number;
}

export interface FunctionInfo {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  name: string;
  enabled: boolean;
  runtime: string;
  deployment: string;
  vars: FunctionVariable[];
  events: string[];
  schedule: string;
  timeout: number;
  entrypoint: string;
  commands: string;
  installCommand: string;
  provider: string;
  providerRepositoryId: string;
  providerBranch: string;
  providerRootDirectory: string;
  providerSilentMode: boolean;
}

export interface FunctionVariable {
  key: string;
  value: string;
  functionId: string;
}

export interface FunctionListOptions {
  queries?: string[];
  search?: string;
}

export interface FunctionListResult {
  functions: FunctionInfo[];
  total: number;
}

export interface FunctionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  executionId?: string;
}

export interface FunctionStats {
  totalFunctions: number;
  enabledFunctions: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
}

/**
 * Functions Service Class
 */
export class FunctionsService {
  private static instance: FunctionsService;

  private constructor() {}

  static getInstance(): FunctionsService {
    if (!FunctionsService.instance) {
      FunctionsService.instance = new FunctionsService();
    }
    return FunctionsService.instance;
  }

  /**
   * Execute a function
   */
  async executeFunction(
    options: FunctionExecutionOptions
  ): Promise<FunctionResponse<FunctionExecutionResult>> {
    try {
      const { functionId, data, async = false, xpath, method, headers } = options;

      logger.info('Executing function', {
        functionId,
        async,
        hasData: !!data,
        method,
        xpath,
      });

      const executionId = ID.unique();

      const result = await functions.createExecution(
        functionId,
        data,
        async,
        xpath,
        method,
        headers
      );

      logger.info('Function execution started', {
        functionId,
        executionId: result.$id,
        status: result.status,
      });

      return {
        success: true,
        data: result as FunctionExecutionResult,
        executionId: result.$id,
      };
    } catch (error: any) {
      logger.error('Function execution failed', {
        functionId: options.functionId,
        error: error.message,
      });

      let errorMessage = 'Fonksiyon çalıştırılamadı';

      if (error instanceof AppwriteException) {
        switch (error.type) {
          case 'function_not_found':
            errorMessage = 'Fonksiyon bulunamadı';
            break;
          case 'function_disabled':
            errorMessage = 'Fonksiyon devre dışı';
            break;
          case 'function_timeout':
            errorMessage = 'Fonksiyon zaman aşımına uğradı';
            break;
          case 'function_runtime_error':
            errorMessage = 'Fonksiyon çalışma zamanı hatası';
            break;
          case 'function_quota_exceeded':
            errorMessage = 'Fonksiyon kotası aşıldı';
            break;
          default:
            errorMessage = error.message || 'Fonksiyon çalıştırılamadı';
        }
      }

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Execute function with JSON data
   */
  async executeFunctionWithJson(
    functionId: string,
    jsonData: any,
    options: Omit<FunctionExecutionOptions, 'functionId' | 'data'> = {}
  ): Promise<FunctionResponse<FunctionExecutionResult>> {
    try {
      const data = JSON.stringify(jsonData);
      return await this.executeFunction({
        functionId,
        data,
        ...options,
      });
    } catch (error: any) {
      logger.error('Failed to stringify JSON data for function execution', {
        functionId,
        error: error.message,
      });
      return { success: false, error: 'JSON verisi hazırlanamadı' };
    }
  }

  /**
   * Get execution result
   */
  async getExecutionResult(
    functionId: string,
    executionId: string
  ): Promise<FunctionResponse<FunctionExecutionResult>> {
    try {
      logger.info('Getting execution result', { functionId, executionId });

      const result = await functions.getExecution(functionId, executionId);

      logger.info('Execution result retrieved', {
        functionId,
        executionId,
        status: result.status,
      });

      return {
        success: true,
        data: result as FunctionExecutionResult,
      };
    } catch (error: any) {
      logger.error('Failed to get execution result', {
        functionId,
        executionId,
        error: error.message,
      });
      return { success: false, error: 'Çalıştırma sonucu alınamadı' };
    }
  }

  /**
   * List function executions
   */
  async listExecutions(
    functionId: string,
    options: FunctionListOptions = {}
  ): Promise<FunctionResponse<FunctionListResult>> {
    try {
      const { queries = [], search } = options;

      logger.info('Listing function executions', { functionId, search });

      let allQueries = [...queries];
      if (search) {
        allQueries.push(`search("status", "${search}")`);
      }

      const result = await functions.listExecutions(functionId, allQueries);

      logger.info('Function executions listed successfully', {
        functionId,
        executionCount: result.executions.length,
        total: result.total,
      });

      return {
        success: true,
        data: {
          functions: result.executions as FunctionInfo[],
          total: result.total,
        },
      };
    } catch (error: any) {
      logger.error('Failed to list function executions', {
        functionId,
        error: error.message,
      });
      return { success: false, error: 'Fonksiyon çalıştırmaları listelenemedi' };
    }
  }

  /**
   * List all functions
   */
  async listFunctions(
    options: FunctionListOptions = {}
  ): Promise<FunctionResponse<FunctionListResult>> {
    try {
      const { queries = [], search } = options;

      logger.info('Listing functions', { search });

      let allQueries = [...queries];
      if (search) {
        allQueries.push(`search("name", "${search}")`);
      }

      const result = await functions.list(allQueries);

      logger.info('Functions listed successfully', {
        functionCount: result.functions.length,
        total: result.total,
      });

      return {
        success: true,
        data: {
          functions: result.functions as FunctionInfo[],
          total: result.total,
        },
      };
    } catch (error: any) {
      logger.error('Failed to list functions', { error: error.message });
      return { success: false, error: 'Fonksiyonlar listelenemedi' };
    }
  }

  /**
   * Get function information
   */
  async getFunction(functionId: string): Promise<FunctionResponse<FunctionInfo>> {
    try {
      logger.info('Getting function info', { functionId });

      const result = await functions.get(functionId);

      logger.info('Function info retrieved successfully', {
        functionId,
        functionName: result.name,
      });

      return {
        success: true,
        data: result as FunctionInfo,
      };
    } catch (error: any) {
      logger.error('Failed to get function info', {
        functionId,
        error: error.message,
      });
      return { success: false, error: 'Fonksiyon bilgileri alınamadı' };
    }
  }

  /**
   * Create function (admin only)
   */
  async createFunction(
    name: string,
    runtime: string,
    options: {
      enabled?: boolean;
      vars?: Array<{ key: string; value: string }>;
      events?: string[];
      schedule?: string;
      timeout?: number;
      entrypoint?: string;
      commands?: string;
      installCommand?: string;
    } = {}
  ): Promise<FunctionResponse<FunctionInfo>> {
    try {
      logger.info('Creating function', { name, runtime, options });

      const functionId = ID.unique();
      const result = await functions.create(
        functionId,
        name,
        runtime,
        options.enabled,
        options.vars,
        options.events,
        options.schedule,
        options.timeout,
        options.entrypoint,
        options.commands,
        options.installCommand
      );

      logger.info('Function created successfully', { functionId, name });

      return {
        success: true,
        data: result as FunctionInfo,
      };
    } catch (error: any) {
      logger.error('Function creation failed', { name, error: error.message });
      return { success: false, error: 'Fonksiyon oluşturulamadı' };
    }
  }

  /**
   * Update function (admin only)
   */
  async updateFunction(
    functionId: string,
    options: {
      name?: string;
      enabled?: boolean;
      vars?: Array<{ key: string; value: string }>;
      events?: string[];
      schedule?: string;
      timeout?: number;
      entrypoint?: string;
      commands?: string;
      installCommand?: string;
    }
  ): Promise<FunctionResponse<FunctionInfo>> {
    try {
      logger.info('Updating function', { functionId, options });

      const result = await functions.update(
        functionId,
        options.name,
        options.enabled,
        options.vars,
        options.events,
        options.schedule,
        options.timeout,
        options.entrypoint,
        options.commands,
        options.installCommand
      );

      logger.info('Function updated successfully', { functionId });

      return {
        success: true,
        data: result as FunctionInfo,
      };
    } catch (error: any) {
      logger.error('Function update failed', { functionId, error: error.message });
      return { success: false, error: 'Fonksiyon güncellenemedi' };
    }
  }

  /**
   * Delete function (admin only)
   */
  async deleteFunction(functionId: string): Promise<FunctionResponse<void>> {
    try {
      logger.info('Deleting function', { functionId });

      await functions.deleteFunction(functionId);

      logger.info('Function deleted successfully', { functionId });

      return { success: true };
    } catch (error: any) {
      logger.error('Function deletion failed', { functionId, error: error.message });
      return { success: false, error: 'Fonksiyon silinemedi' };
    }
  }

  /**
   * Create deployment (admin only)
   */
  async createDeployment(
    functionId: string,
    code: string,
    activate: boolean = true
  ): Promise<FunctionResponse<any>> {
    try {
      logger.info('Creating deployment', { functionId, activate });

      const deploymentId = ID.unique();
      const result = await functions.createDeployment(functionId, deploymentId, code, activate);

      logger.info('Deployment created successfully', { functionId, deploymentId });

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      logger.error('Deployment creation failed', { functionId, error: error.message });
      return { success: false, error: 'Dağıtım oluşturulamadı' };
    }
  }

  /**
   * List deployments
   */
  async listDeployments(
    functionId: string,
    options: FunctionListOptions = {}
  ): Promise<FunctionResponse<any>> {
    try {
      const { queries = [] } = options;

      logger.info('Listing deployments', { functionId });

      const result = await functions.listDeployments(functionId, queries);

      logger.info('Deployments listed successfully', {
        functionId,
        deploymentCount: result.deployments.length,
      });

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      logger.error('Failed to list deployments', {
        functionId,
        error: error.message,
      });
      return { success: false, error: 'Dağıtımlar listelenemedi' };
    }
  }

  /**
   * Get function statistics
   */
  async getFunctionStats(): Promise<FunctionResponse<FunctionStats>> {
    try {
      logger.info('Getting function statistics');

      const functionsResult = await this.listFunctions();
      if (!functionsResult.success || !functionsResult.data) {
        return { success: false, error: 'Fonksiyonlar listelenemedi' };
      }

      const functions = functionsResult.data.functions;
      const enabledFunctions = functions.filter((f) => f.enabled).length;

      let totalExecutions = 0;
      let successfulExecutions = 0;
      let failedExecutions = 0;
      let totalExecutionTime = 0;

      // Get execution stats for each function
      for (const func of functions) {
        try {
          const executionsResult = await this.listExecutions(func.$id, { queries: ['limit(100)'] });
          if (executionsResult.success && executionsResult.data) {
            // Note: This is a simplified calculation
            // In a real scenario, you might want to aggregate this data differently
            totalExecutions += executionsResult.data.total;
          }
        } catch (error) {
          logger.warn('Failed to get execution stats for function', {
            functionId: func.$id,
            error: (error as Error).message,
          });
        }
      }

      const stats: FunctionStats = {
        totalFunctions: functions.length,
        enabledFunctions,
        totalExecutions,
        successfulExecutions,
        failedExecutions,
        averageExecutionTime: totalExecutions > 0 ? totalExecutionTime / totalExecutions : 0,
      };

      logger.info('Function statistics retrieved', {
        totalFunctions: functions.length,
        enabledFunctions,
      });

      return { success: true, data: stats };
    } catch (error: any) {
      logger.error('Failed to get function statistics', { error: error.message });
      return { success: false, error: 'Fonksiyon istatistikleri alınamadı' };
    }
  }

  /**
   * Test function connection
   */
  async testFunctions(): Promise<FunctionResponse<boolean>> {
    try {
      logger.info('Testing functions connection');

      // Try to list functions
      await functions.list();

      logger.info('Functions connection test successful');
      return { success: true, data: true };
    } catch (error: any) {
      logger.error('Functions connection test failed', { error: error.message });
      return { success: false, error: 'Fonksiyonlar bağlantısı test edilemedi' };
    }
  }

  /**
   * Wait for function execution to complete
   */
  async waitForExecution(
    functionId: string,
    executionId: string,
    timeout: number = 30000,
    pollInterval: number = 1000
  ): Promise<FunctionResponse<FunctionExecutionResult>> {
    try {
      logger.info('Waiting for function execution to complete', {
        functionId,
        executionId,
        timeout,
      });

      const startTime = Date.now();

      while (Date.now() - startTime < timeout) {
        const result = await this.getExecutionResult(functionId, executionId);

        if (result.success && result.data) {
          const status = result.data.status;

          if (status === 'completed') {
            logger.info('Function execution completed successfully', {
              functionId,
              executionId,
              duration: result.data.duration,
            });
            return result;
          } else if (status === 'failed') {
            logger.error('Function execution failed', {
              functionId,
              executionId,
              stderr: result.data.stderr,
            });
            return {
              success: false,
              error: `Fonksiyon çalıştırması başarısız: ${result.data.stderr}`,
            };
          }

          // Still processing, wait and try again
          await new Promise((resolve) => setTimeout(resolve, pollInterval));
        } else {
          return result;
        }
      }

      logger.warn('Function execution timeout', { functionId, executionId, timeout });
      return { success: false, error: 'Fonksiyon çalıştırması zaman aşımına uğradı' };
    } catch (error: any) {
      logger.error('Error waiting for function execution', {
        functionId,
        executionId,
        error: error.message,
      });
      return { success: false, error: 'Fonksiyon çalıştırması beklenirken hata oluştu' };
    }
  }
}

// Export singleton instance
export const functionsService = FunctionsService.getInstance();

// Export convenience functions
export const executeFunction = (options: FunctionExecutionOptions) =>
  functionsService.executeFunction(options);

export const executeFunctionWithJson = (
  functionId: string,
  jsonData: any,
  options?: Omit<FunctionExecutionOptions, 'functionId' | 'data'>
) => functionsService.executeFunctionWithJson(functionId, jsonData, options);

export const getExecutionResult = (functionId: string, executionId: string) =>
  functionsService.getExecutionResult(functionId, executionId);

export const listFunctions = (options?: FunctionListOptions) =>
  functionsService.listFunctions(options);

export const getFunction = (functionId: string) => functionsService.getFunction(functionId);

export const testFunctions = () => functionsService.testFunctions();

export const waitForExecution = (
  functionId: string,
  executionId: string,
  timeout?: number,
  pollInterval?: number
) => functionsService.waitForExecution(functionId, executionId, timeout, pollInterval);

export default functionsService;
