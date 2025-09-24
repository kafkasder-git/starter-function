// Minimal performance monitoring service stub

export const performanceMonitoringService = {
  getPerformanceReport: async () => ({ metrics: [], generatedAt: new Date().toISOString() }),
  getActiveAlerts: async () => [],
  getMetricsHistory: async () => [],
  exportPerformanceData: async () => ({ url: '/download/performance.json' }),
  updatePerformanceConfig: async () => true,
};

export default performanceMonitoringService;

