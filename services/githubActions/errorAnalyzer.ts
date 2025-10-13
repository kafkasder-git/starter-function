/**
 * @fileoverview GitHub Actions Error Analyzer
 * @description Service for analyzing and categorizing GitHub Actions workflow errors
 */

import { logger } from '@/lib/logging/logger';

export interface WorkflowError {
  id: string;
  workflowName: string;
  jobName: string;
  stepName: string;
  errorType: 'build' | 'test' | 'deploy' | 'lint' | 'security' | 'dependency' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  stackTrace?: string;
  timestamp: string;
  branch: string;
  commitHash: string;
  resolved: boolean;
  resolution?: string;
}

export interface ErrorPattern {
  pattern: RegExp;
  errorType: WorkflowError['errorType'];
  severity: WorkflowError['severity'];
  description: string;
  suggestedFix: string;
}

export interface ErrorAnalysis {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  topErrors: Array<{ message: string; count: number }>;
  trends: Array<{ date: string; count: number }>;
  recommendations: string[];
}

export interface WorkflowHealth {
  workflowName: string;
  successRate: number;
  averageDuration: number;
  errorRate: number;
  lastRun: string;
  status: 'healthy' | 'warning' | 'critical';
}

class GitHubActionsErrorAnalyzer {
  private static instance: GitHubActionsErrorAnalyzer;
  private errorPatterns: ErrorPattern[] = [];
  private errors: WorkflowError[] = [];

  public static getInstance(): GitHubActionsErrorAnalyzer {
    if (!GitHubActionsErrorAnalyzer.instance) {
      GitHubActionsErrorAnalyzer.instance = new GitHubActionsErrorAnalyzer();
    }
    return GitHubActionsErrorAnalyzer.instance;
  }

  private constructor() {
    this.initializeErrorPatterns();
    logger.info('GitHubActionsErrorAnalyzer initialized');
  }

  /**
   * Initialize error patterns for analysis
   */
  private initializeErrorPatterns(): void {
    this.errorPatterns = [
      // Build errors
      {
        pattern: /Module not found|Cannot resolve module|Import.*not found/i,
        errorType: 'build',
        severity: 'high',
        description: 'Module resolution error',
        suggestedFix: 'Check import paths and ensure all dependencies are installed'
      },
      {
        pattern: /Type.*is not assignable|Type.*does not exist|Property.*does not exist/i,
        errorType: 'build',
        severity: 'high',
        description: 'TypeScript type error',
        suggestedFix: 'Fix type definitions and ensure proper typing'
      },
      {
        pattern: /Syntax error|Unexpected token|Parse error/i,
        errorType: 'build',
        severity: 'critical',
        description: 'Syntax error',
        suggestedFix: 'Fix syntax issues in the code'
      },

      // Test errors
      {
        pattern: /Test.*failed|Assertion.*failed|Expected.*but received/i,
        errorType: 'test',
        severity: 'medium',
        description: 'Test failure',
        suggestedFix: 'Review test logic and expected outcomes'
      },
      {
        pattern: /Timeout|Test.*timed out/i,
        errorType: 'test',
        severity: 'low',
        description: 'Test timeout',
        suggestedFix: 'Increase timeout or optimize test performance'
      },

      // Lint errors
      {
        pattern: /ESLint|Prettier|Lint error/i,
        errorType: 'lint',
        severity: 'low',
        description: 'Code style violation',
        suggestedFix: 'Fix code style issues according to linting rules'
      },

      // Security errors
      {
        pattern: /Security vulnerability|CVE|npm audit/i,
        errorType: 'security',
        severity: 'high',
        description: 'Security vulnerability',
        suggestedFix: 'Update dependencies or apply security patches'
      },

      // Dependency errors
      {
        pattern: /npm install failed|yarn install failed|Package.*not found/i,
        errorType: 'dependency',
        severity: 'medium',
        description: 'Dependency installation error',
        suggestedFix: 'Check package.json and dependency versions'
      },

      // Deploy errors
      {
        pattern: /Deploy.*failed|Build.*failed|Deployment.*error/i,
        errorType: 'deploy',
        severity: 'high',
        description: 'Deployment failure',
        suggestedFix: 'Check deployment configuration and build process'
      }
    ];
  }

  /**
   * Analyze workflow log and extract errors
   */
  async analyzeWorkflowLog(
    workflowName: string,
    logContent: string,
    metadata: {
      branch: string;
      commitHash: string;
      timestamp: string;
    }
  ): Promise<WorkflowError[]> {
    const errors: WorkflowError[] = [];
    const lines = logContent.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Look for error patterns
      for (const pattern of this.errorPatterns) {
        if (pattern.pattern.test(line)) {
          const error: WorkflowError = {
            id: this.generateErrorId(),
            workflowName,
            jobName: this.extractJobName(lines, i),
            stepName: this.extractStepName(lines, i),
            errorType: pattern.errorType,
            severity: pattern.severity,
            message: line.trim(),
            stackTrace: this.extractStackTrace(lines, i),
            timestamp: metadata.timestamp,
            branch: metadata.branch,
            commitHash: metadata.commitHash,
            resolved: false
          };

          errors.push(error);
          this.errors.push(error);
          break; // Only match first pattern
        }
      }
    }

    logger.info(`Analyzed ${workflowName} workflow log, found ${errors.length} errors`);
    return errors;
  }

  /**
   * Get error analysis summary
   */
  getErrorAnalysis(timeRange?: { start: Date; end: Date }): ErrorAnalysis {
    let filteredErrors = this.errors;

    // Filter by time range if provided
    if (timeRange) {
      filteredErrors = this.errors.filter(error => {
        const errorDate = new Date(error.timestamp);
        return errorDate >= timeRange.start && errorDate <= timeRange.end;
      });
    }

    // Calculate statistics
    const totalErrors = filteredErrors.length;
    const errorsByType: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {};
    const errorMessages: Record<string, number> = {};

    filteredErrors.forEach(error => {
      // Count by type
      errorsByType[error.errorType] = (errorsByType[error.errorType] || 0) + 1;
      
      // Count by severity
      errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
      
      // Count by message
      const messageKey = this.normalizeErrorMessage(error.message);
      errorMessages[messageKey] = (errorMessages[messageKey] || 0) + 1;
    });

    // Get top errors
    const topErrors = Object.entries(errorMessages)
      .map(([message, count]) => ({ message, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate trends (last 30 days)
    const trends = this.calculateErrorTrends(filteredErrors);

    // Generate recommendations
    const recommendations = this.generateRecommendations(errorsByType, errorsBySeverity);

    return {
      totalErrors,
      errorsByType,
      errorsBySeverity,
      topErrors,
      trends,
      recommendations
    };
  }

  /**
   * Get workflow health status
   */
  getWorkflowHealth(workflowName: string): WorkflowHealth {
    const workflowErrors = this.errors.filter(e => e.workflowName === workflowName);
    const totalRuns = workflowErrors.length + 10; // Assume some successful runs
    const errorRate = workflowErrors.length / totalRuns;
    const successRate = 1 - errorRate;

    let status: WorkflowHealth['status'] = 'healthy';
    if (errorRate > 0.3) {
      status = 'critical';
    } else if (errorRate > 0.1) {
      status = 'warning';
    }

    const lastRun = workflowErrors.length > 0 
      ? workflowErrors[workflowErrors.length - 1].timestamp
      : new Date().toISOString();

    return {
      workflowName,
      successRate,
      averageDuration: 0, // Would need duration data
      errorRate,
      lastRun,
      status
    };
  }

  /**
   * Mark error as resolved
   */
  markErrorResolved(errorId: string, resolution: string): boolean {
    const error = this.errors.find(e => e.id === errorId);
    
    if (error) {
      error.resolved = true;
      error.resolution = resolution;
      logger.info(`Marked error ${errorId} as resolved`);
      return true;
    }
    
    return false;
  }

  /**
   * Get unresolved errors
   */
  getUnresolvedErrors(workflowName?: string): WorkflowError[] {
    let filtered = this.errors.filter(e => !e.resolved);
    
    if (workflowName) {
      filtered = filtered.filter(e => e.workflowName === workflowName);
    }
    
    return filtered.sort((a, b) => {
      // Sort by severity and timestamp
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      
      if (severityDiff !== 0) return severityDiff;
      
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }

  /**
   * Extract job name from log lines
   */
  private extractJobName(lines: string[], errorLineIndex: number): string {
    // Look backwards for job start
    for (let i = errorLineIndex; i >= Math.max(0, errorLineIndex - 20); i--) {
      const line = lines[i];
      if (line.includes('##[group]')) {
        return line.replace('##[group]', '').trim();
      }
    }
    return 'unknown';
  }

  /**
   * Extract step name from log lines
   */
  private extractStepName(lines: string[], errorLineIndex: number): string {
    // Look backwards for step start
    for (let i = errorLineIndex; i >= Math.max(0, errorLineIndex - 10); i--) {
      const line = lines[i];
      if (line.includes('##[step]')) {
        return line.replace('##[step]', '').trim();
      }
    }
    return 'unknown';
  }

  /**
   * Extract stack trace from log lines
   */
  private extractStackTrace(lines: string[], errorLineIndex: number): string {
    const stackLines: string[] = [];
    
    // Look ahead for stack trace
    for (let i = errorLineIndex + 1; i < Math.min(lines.length, errorLineIndex + 20); i++) {
      const line = lines[i];
      if (line.trim() === '' || line.includes('##[') || line.includes('Error:')) {
        break;
      }
      stackLines.push(line);
    }
    
    return stackLines.join('\n').trim();
  }

  /**
   * Calculate error trends
   */
  private calculateErrorTrends(errors: WorkflowError[]): Array<{ date: string; count: number }> {
    const trends: Record<string, number> = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    errors
      .filter(error => new Date(error.timestamp) >= thirtyDaysAgo)
      .forEach(error => {
        const date = new Date(error.timestamp).toISOString().split('T')[0];
        trends[date] = (trends[date] || 0) + 1;
      });

    return Object.entries(trends)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    errorsByType: Record<string, number>,
    errorsBySeverity: Record<string, number>
  ): string[] {
    const recommendations: string[] = [];

    // High severity errors
    if (errorsBySeverity.critical > 0) {
      recommendations.push('Address critical errors immediately to prevent workflow failures');
    }

    // Build errors
    if (errorsByType.build > 10) {
      recommendations.push('Consider adding pre-commit hooks to catch build errors early');
    }

    // Test errors
    if (errorsByType.test > 5) {
      recommendations.push('Review test suite stability and add retry mechanisms');
    }

    // Security errors
    if (errorsByType.security > 0) {
      recommendations.push('Implement automated security scanning in CI/CD pipeline');
    }

    // Lint errors
    if (errorsByType.lint > 20) {
      recommendations.push('Enforce code formatting with automated tools');
    }

    return recommendations;
  }

  /**
   * Normalize error message for grouping
   */
  private normalizeErrorMessage(message: string): string {
    return message
      .replace(/\d+/g, 'N') // Replace numbers with N
      .replace(/['"]/g, '') // Remove quotes
      .substring(0, 100); // Truncate long messages
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear error history
   */
  clearErrorHistory(): void {
    this.errors = [];
    logger.info('GitHub Actions error history cleared');
  }

  /**
   * Export error data
   */
  exportErrors(): string {
    const exportData = {
      errors: this.errors,
      patterns: this.errorPatterns,
      exportedAt: new Date().toISOString()
    };
    
    return JSON.stringify(exportData, null, 2);
  }
}

// Export singleton instance
export const githubActionsErrorAnalyzer = GitHubActionsErrorAnalyzer.getInstance();
export default githubActionsErrorAnalyzer;
