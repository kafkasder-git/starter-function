/**
 * @fileoverview Advanced Security Service
 * @description Gelişmiş güvenlik ve tehdit algılama servisi
 */

import React from 'react';
import { monitoring } from './monitoringService';

// Güvenlik olay türleri
export type SecurityEventType =
  | 'authentication_failure'
  | 'authorization_violation'
  | 'suspicious_activity'
  | 'data_breach_attempt'
  | 'malicious_request'
  | 'rate_limit_exceeded'
  | 'sql_injection_attempt'
  | 'xss_attempt'
  | 'csrf_attempt'
  | 'brute_force_attack'
  | 'privilege_escalation'
  | 'data_exfiltration';

// Güvenlik seviyeleri
export type SecurityLevel = 'low' | 'medium' | 'high' | 'critical';

// Güvenlik olayı
export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  level: SecurityLevel;
  timestamp: Date;
  source: {
    ip: string;
    userAgent: string;
    userId?: string;
    sessionId?: string;
  };
  details: {
    description: string;
    endpoint?: string;
    method?: string;
    payload?: any;
    headers?: Record<string, string>;
    userRole?: string;
    attemptedAction?: string;
  };
  response: {
    action: 'blocked' | 'allowed' | 'monitored' | 'escalated';
    reason: string;
    additionalMeasures?: string[];
  };
  metadata: {
    riskScore: number; // 0-100
    confidence: number; // 0-100
    falsePositive: boolean;
    tags: string[];
  };
}

// Güvenlik kuralı
export interface SecurityRule {
  id: string;
  name: string;
  description: string;
  type: SecurityEventType;
  conditions: {
    field: string;
    operator: 'equals' | 'contains' | 'regex' | 'greater_than' | 'less_than' | 'in' | 'not_in';
    value: any;
  }[];
  actions: {
    type: 'block' | 'alert' | 'log' | 'rate_limit' | 'captcha' | '2fa';
    config: any;
  }[];
  enabled: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

// Güvenlik istatistikleri
export interface SecurityStats {
  totalEvents: number;
  eventsByType: Record<SecurityEventType, number>;
  eventsByLevel: Record<SecurityLevel, number>;
  blockedRequests: number;
  allowedRequests: number;
  riskScore: number;
  topThreats: {
    type: SecurityEventType;
    count: number;
    trend: 'up' | 'down' | 'stable';
  }[];
  topSources: {
    ip: string;
    count: number;
    riskScore: number;
  }[];
}

class AdvancedSecurityService {
  private readonly events: SecurityEvent[] = [];
  private rules: SecurityRule[] = [];
  private readonly blockedIPs = new Set<string>();
  private readonly rateLimitMap = new Map<string, { count: number; resetTime: number }>();
  private suspiciousPatterns: RegExp[] = [];
  private isMonitoring = false;

  constructor() {
    this.initializeSecurityRules();
    this.initializeSuspiciousPatterns();
    this.startMonitoring();
  }

  /**
   * Güvenlik kurallarını başlat
   */
  private initializeSecurityRules(): void {
    // SQL Injection koruması
    this.rules.push({
      id: 'sql-injection-001',
      name: 'SQL Injection Koruması',
      description: 'SQL injection saldırılarını tespit eder ve engeller',
      type: 'sql_injection_attempt',
      conditions: [
        {
          field: 'payload',
          operator: 'regex',
          value:
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)|(\b(OR|AND)\s+\d+\s*=\s*\d+)|(\b(OR|AND)\s+['"]\s*=\s*['"])/i,
        },
      ],
      actions: [
        { type: 'block', config: { duration: 3600000 } }, // 1 saat
        { type: 'alert', config: { level: 'critical' } },
        { type: 'log', config: { detailed: true } },
      ],
      enabled: true,
      priority: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // XSS koruması
    this.rules.push({
      id: 'xss-protection-001',
      name: 'XSS Koruması',
      description: 'Cross-site scripting saldırılarını tespit eder',
      type: 'xss_attempt',
      conditions: [
        {
          field: 'payload',
          operator: 'regex',
          value: /<script[^>]*>.*?<\/script>|<iframe[^>]*>.*?<\/iframe>|javascript:|on\w+\s*=/i,
        },
      ],
      actions: [
        { type: 'block', config: { duration: 1800000 } }, // 30 dakika
        { type: 'alert', config: { level: 'high' } },
      ],
      enabled: true,
      priority: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Brute Force koruması
    this.rules.push({
      id: 'brute-force-001',
      name: 'Brute Force Koruması',
      description: 'Brute force saldırılarını tespit eder',
      type: 'brute_force_attack',
      conditions: [
        {
          field: 'failed_attempts',
          operator: 'greater_than',
          value: 5,
        },
        {
          field: 'time_window',
          operator: 'less_than',
          value: 300000, // 5 dakika
        },
      ],
      actions: [
        { type: 'block', config: { duration: 1800000 } }, // 30 dakika
        { type: 'rate_limit', config: { requests: 1, window: 60000 } }, // 1 dakikada 1 istek
        { type: 'alert', config: { level: 'high' } },
      ],
      enabled: true,
      priority: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Rate Limiting
    this.rules.push({
      id: 'rate-limit-001',
      name: 'Rate Limiting',
      description: 'Aşırı istek oranını sınırlar',
      type: 'rate_limit_exceeded',
      conditions: [
        {
          field: 'request_count',
          operator: 'greater_than',
          value: 100,
        },
        {
          field: 'time_window',
          operator: 'less_than',
          value: 60000, // 1 dakika
        },
      ],
      actions: [
        { type: 'rate_limit', config: { requests: 10, window: 60000 } },
        { type: 'captcha', config: { required: true } },
      ],
      enabled: true,
      priority: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Şüpheli desenleri başlat
   */
  private initializeSuspiciousPatterns(): void {
    this.suspiciousPatterns = [
      // SQL Injection patterns
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
      /(\b(OR|AND)\s+['"]\s*=\s*['"])/i,

      // XSS patterns
      /<script[^>]*>.*?<\/script>/i,
      /<iframe[^>]*>.*?<\/iframe>/i,
      /javascript:/i,
      /on\w+\s*=/i,

      // Path traversal
      /\.\.\//g,
      /\.\.\\/g,

      // Command injection
      /[;&|`$(){}[\]]/,

      // LDAP injection
      /[()=*!&|]/,

      // NoSQL injection
      /\$where|\$ne|\$gt|\$lt|\$regex/i,
    ];
  }

  /**
   * Güvenlik izlemeyi başlat
   */
  private startMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Request interceptor
    this.interceptRequests();

    // Error monitoring
    this.monitorErrors();

    // User behavior monitoring
    this.monitorUserBehavior();

    this.isMonitoring = true;
    console.log('[Security] Advanced security monitoring initialized');
  }

  /**
   * HTTP isteklerini yakala
   */
  private interceptRequests(): void {
    const originalFetch = window.fetch;
    const originalXHR = XMLHttpRequest.prototype.open;

    // Fetch API interceptor
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = new Request(input, init);
      const securityCheck = await this.analyzeRequest({
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
        body: await this.getRequestBody(request),
      });

      if (securityCheck.blocked) {
        throw new Error('Request blocked by security policy');
      }

      return originalFetch(input, init);
    };

    // XMLHttpRequest interceptor
    XMLHttpRequest.prototype.open = function (method: string, url: string | URL, ...args: any[]) {
      // Security check burada yapılabilir
      originalXHR.call(this, method, url, ...args);
    };
  }

  /**
   * Hataları izle
   */
  private monitorErrors(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.analyzeError(event.error, {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Unhandled promise rejection
    window.addEventListener('unhandledrejection', (event) => {
      this.analyzeError(event.reason, {
        type: 'unhandled_promise_rejection',
      });
    });
  }

  /**
   * Kullanıcı davranışını izle
   */
  private monitorUserBehavior(): void {
    let mouseMovements: { x: number; y: number; timestamp: number }[] = [];
    let keystrokes: { key: string; timestamp: number }[] = [];

    // Mouse movement tracking
    document.addEventListener('mousemove', (event) => {
      mouseMovements.push({
        x: event.clientX,
        y: event.clientY,
        timestamp: Date.now(),
      });

      // Son 100 hareketi sakla
      if (mouseMovements.length > 100) {
        mouseMovements = mouseMovements.slice(-100);
      }
    });

    // Keystroke tracking
    document.addEventListener('keydown', (event) => {
      keystrokes.push({
        key: event.key,
        timestamp: Date.now(),
      });

      // Son 50 tuş vuruşunu sakla
      if (keystrokes.length > 50) {
        keystrokes = keystrokes.slice(-50);
      }
    });

    // Periyodik analiz
    setInterval(() => {
      this.analyzeUserBehavior(mouseMovements, keystrokes);
    }, 30000); // Her 30 saniyede
  }

  /**
   * İstek analizi
   */
  private async analyzeRequest(request: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: any;
  }): Promise<{ blocked: boolean; reason?: string; riskScore: number }> {
    let riskScore = 0;
    let blocked = false;
    let reason = '';

    // URL analizi
    if (this.containsSuspiciousPattern(request.url)) {
      riskScore += 50;
      blocked = true;
      reason = 'Suspicious URL pattern detected';
    }

    // Method analizi
    if (request.method === 'DELETE' || request.method === 'PUT') {
      riskScore += 10;
    }

    // Header analizi
    if (this.analyzeHeaders(request.headers)) {
      riskScore += 30;
    }

    // Body analizi
    if (request.body && this.containsSuspiciousPattern(JSON.stringify(request.body))) {
      riskScore += 40;
      blocked = true;
      reason = 'Suspicious payload detected';
    }

    // Rate limiting kontrolü
    const clientIP = this.getClientIP();
    if (this.isRateLimited(clientIP)) {
      riskScore += 60;
      blocked = true;
      reason = 'Rate limit exceeded';
    }

    // Güvenlik kurallarını kontrol et
    for (const rule of this.rules) {
      if (this.evaluateRule(rule, request)) {
        riskScore += rule.priority * 10;
        blocked = true;
        reason = rule.description;
        break;
      }
    }

    // Güvenlik olayı kaydet
    if (riskScore > 30) {
      await this.recordSecurityEvent({
        type: blocked ? 'malicious_request' : 'suspicious_activity',
        level: this.getRiskLevel(riskScore),
        timestamp: new Date(),
        source: {
          ip: clientIP,
          userAgent: navigator.userAgent,
          sessionId: this.getSessionId(),
        },
        details: {
          description: reason || 'Suspicious request detected',
          endpoint: request.url,
          method: request.method,
          payload: request.body,
          headers: request.headers,
        },
        response: {
          action: blocked ? 'blocked' : 'monitored',
          reason: reason || 'Risk score threshold exceeded',
        },
        metadata: {
          riskScore,
          confidence: Math.min(riskScore, 100),
          falsePositive: false,
          tags: ['automated_detection'],
        },
      });
    }

    return { blocked, reason, riskScore };
  }

  /**
   * Hata analizi
   */
  private analyzeError(error: any, context: any): void {
    const errorMessage = error?.message || error?.toString() || 'Unknown error';

    // Güvenlik açığı gösterebilecek hatalar
    if (this.containsSuspiciousPattern(errorMessage)) {
      this.recordSecurityEvent({
        type: 'data_breach_attempt',
        level: 'high',
        timestamp: new Date(),
        source: {
          ip: this.getClientIP(),
          userAgent: navigator.userAgent,
          sessionId: this.getSessionId(),
        },
        details: {
          description: 'Suspicious error pattern detected',
          attemptedAction: 'error_exploitation',
          payload: errorMessage,
        },
        response: {
          action: 'monitored',
          reason: 'Potential security vulnerability exploitation',
        },
        metadata: {
          riskScore: 70,
          confidence: 80,
          falsePositive: false,
          tags: ['error_analysis'],
        },
      });
    }
  }

  /**
   * Kullanıcı davranış analizi
   */
  private analyzeUserBehavior(
    mouseMovements: { x: number; y: number; timestamp: number }[],
    keystrokes: { key: string; timestamp: number }[],
  ): void {
    // Bot davranışı tespiti
    const isBotBehavior = this.detectBotBehavior(mouseMovements, keystrokes);

    if (isBotBehavior) {
      this.recordSecurityEvent({
        type: 'suspicious_activity',
        level: 'medium',
        timestamp: new Date(),
        source: {
          ip: this.getClientIP(),
          userAgent: navigator.userAgent,
          sessionId: this.getSessionId(),
        },
        details: {
          description: 'Bot-like behavior detected',
          attemptedAction: 'automated_interaction',
        },
        response: {
          action: 'monitored',
          reason: 'Suspicious user behavior pattern',
        },
        metadata: {
          riskScore: 40,
          confidence: 60,
          falsePositive: true, // Yüksek false positive oranı
          tags: ['behavior_analysis'],
        },
      });
    }
  }

  /**
   * Bot davranışı tespiti
   */
  private detectBotBehavior(
    mouseMovements: { x: number; y: number; timestamp: number }[],
    keystrokes: { key: string; timestamp: number }[],
  ): boolean {
    // Çok düzenli mouse hareketleri
    if (mouseMovements.length > 10) {
      const intervals = [];
      for (let i = 1; i < mouseMovements.length; i++) {
        intervals.push(mouseMovements[i].timestamp - mouseMovements[i - 1].timestamp);
      }

      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance =
        intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) /
        intervals.length;

      // Çok düşük varyans = bot davranışı
      if (variance < 100) return true;
    }

    // Çok hızlı tuş vuruşları
    if (keystrokes.length > 5) {
      const avgKeystrokeInterval =
        (keystrokes[keystrokes.length - 1].timestamp - keystrokes[0].timestamp) / keystrokes.length;
      if (avgKeystrokeInterval < 50) return true; // 50ms'den hızlı
    }

    return false;
  }

  /**
   * Şüpheli desen kontrolü
   */
  private containsSuspiciousPattern(text: string): boolean {
    return this.suspiciousPatterns.some((pattern) => pattern.test(text));
  }

  /**
   * Header analizi
   */
  private analyzeHeaders(headers: Record<string, string>): boolean {
    // Şüpheli header'lar
    const suspiciousHeaders = [
      'x-forwarded-for',
      'x-real-ip',
      'x-originating-ip',
      'x-remote-ip',
      'x-remote-addr',
    ];

    return Object.keys(headers).some((header) => suspiciousHeaders.includes(header.toLowerCase()));
  }

  /**
   * Rate limiting kontrolü
   */
  private isRateLimited(ip: string): boolean {
    const now = Date.now();
    const rateLimitData = this.rateLimitMap.get(ip);

    if (!rateLimitData) {
      this.rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
      return false;
    }

    if (now > rateLimitData.resetTime) {
      this.rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
      return false;
    }

    rateLimitData.count++;
    return rateLimitData.count > 100; // 100 istek/dakika limit
  }

  /**
   * Güvenlik kuralı değerlendirme
   */
  private evaluateRule(rule: SecurityRule, request: any): boolean {
    if (!rule.enabled) return false;

    return rule.conditions.every((condition) => {
      const fieldValue = this.getFieldValue(request, condition.field);
      return this.evaluateCondition(fieldValue, condition.operator, condition.value);
    });
  }

  /**
   * Alan değeri alma
   */
  private getFieldValue(obj: any, field: string): any {
    const fields = field.split('.');
    let value = obj;

    for (const f of fields) {
      value = value?.[f];
    }

    return value;
  }

  /**
   * Koşul değerlendirme
   */
  private evaluateCondition(value: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'equals':
        return value === expected;
      case 'contains':
        return String(value).includes(String(expected));
      case 'regex':
        return new RegExp(expected).test(String(value));
      case 'greater_than':
        return Number(value) > Number(expected);
      case 'less_than':
        return Number(value) < Number(expected);
      case 'in':
        return Array.isArray(expected) && expected.includes(value);
      case 'not_in':
        return Array.isArray(expected) && !expected.includes(value);
      default:
        return false;
    }
  }

  /**
   * Güvenlik olayı kaydet
   */
  private async recordSecurityEvent(eventData: Omit<SecurityEvent, 'id'>): Promise<void> {
    const event: SecurityEvent = {
      id: this.generateEventId(),
      ...eventData,
    };

    this.events.push(event);

    // Monitor security event
    monitoring.trackEvent('security_event', {
      event_type: event.type,
      severity_level: event.level,
      risk_score: event.metadata.riskScore,
      source_ip: event.source.ip,
      timestamp: event.timestamp.toISOString(),
    });

    // Kritik olaylar için ek önlemler
    if (event.level === 'critical') {
      await this.handleCriticalEvent(event);
    }

    console.log('[Security] Event recorded:', event);
  }

  /**
   * Kritik olay işleme
   */
  private async handleCriticalEvent(event: SecurityEvent): Promise<void> {
    // IP'yi engelle
    this.blockedIPs.add(event.source.ip);

    // Admin'e bildirim gönder
    await this.sendSecurityAlert(event);

    // Otomatik önlemler
    if (event.type === 'brute_force_attack') {
      // Kullanıcı hesabını geçici olarak kilitle
      await this.lockUserAccount(event.source.userId);
    }
  }

  /**
   * Güvenlik uyarısı gönder
   */
  private async sendSecurityAlert(event: SecurityEvent): Promise<void> {
    // Bu kısım gerçek uygulamada e-posta, SMS, Slack vb. entegrasyonları içerebilir
    console.log('[Security] Critical security alert:', event);
  }

  /**
   * Kullanıcı hesabını kilitle
   */
  private async lockUserAccount(userId?: string): Promise<void> {
    if (userId) {
      // Kullanıcı hesabını kilitleme işlemi
      console.log('[Security] User account locked:', userId);
    }
  }

  /**
   * Yardımcı fonksiyonlar
   */
  private generateEventId(): string {
    return `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getRiskLevel(riskScore: number): SecurityLevel {
    if (riskScore >= 80) return 'critical';
    if (riskScore >= 60) return 'high';
    if (riskScore >= 40) return 'medium';
    return 'low';
  }

  private getSentryLevel(level: SecurityLevel): 'error' | 'warning' | 'info' {
    switch (level) {
      case 'critical':
        return 'error';
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
    }
  }

  private getClientIP(): string {
    // Gerçek uygulamada bu bilgi server-side'dan gelir
    return '127.0.0.1';
  }

  private getSessionId(): string {
    // Session ID'yi al
    return sessionStorage.getItem('sessionId') || 'unknown';
  }

  private async getRequestBody(request: Request): Promise<any> {
    try {
      const clone = request.clone();
      return await clone.text();
    } catch {
      return null;
    }
  }

  /**
   * Public API
   */
  public getSecurityStats(): SecurityStats {
    const totalEvents = this.events.length;
    const eventsByType: Record<SecurityEventType, number> = {} as any;
    const eventsByLevel: Record<SecurityLevel, number> = {} as any;

    // İstatistikleri hesapla
    this.events.forEach((event) => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
      eventsByLevel[event.level] = (eventsByLevel[event.level] || 0) + 1;
    });

    const blockedRequests = this.events.filter((e) => e.response.action === 'blocked').length;
    const allowedRequests = this.events.filter((e) => e.response.action === 'allowed').length;

    const avgRiskScore =
      this.events.length > 0
        ? this.events.reduce((sum, e) => sum + e.metadata.riskScore, 0) / this.events.length
        : 0;

    return {
      totalEvents,
      eventsByType,
      eventsByLevel,
      blockedRequests,
      allowedRequests,
      riskScore: Math.round(avgRiskScore),
      topThreats: this.getTopThreats(),
      topSources: this.getTopSources(),
    };
  }

  private getTopThreats(): {
    type: SecurityEventType;
    count: number;
    trend: 'up' | 'down' | 'stable';
  }[] {
    const threatCounts: Record<SecurityEventType, number> = {} as any;

    this.events.forEach((event) => {
      threatCounts[event.type] = (threatCounts[event.type] || 0) + 1;
    });

    return Object.entries(threatCounts)
      .map(([type, count]) => ({
        type: type as SecurityEventType,
        count,
        trend: 'stable' as const, // Basit implementasyon
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private getTopSources(): { ip: string; count: number; riskScore: number }[] {
    const sourceCounts: Record<string, { count: number; totalRisk: number }> = {};

    this.events.forEach((event) => {
      const {ip} = event.source;
      if (!sourceCounts[ip]) {
        sourceCounts[ip] = { count: 0, totalRisk: 0 };
      }
      sourceCounts[ip].count++;
      sourceCounts[ip].totalRisk += event.metadata.riskScore;
    });

    return Object.entries(sourceCounts)
      .map(([ip, data]) => ({
        ip,
        count: data.count,
        riskScore: Math.round(data.totalRisk / data.count),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  public getRecentEvents(limit = 50): SecurityEvent[] {
    return this.events
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  public isIPBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  public unblockIP(ip: string): void {
    this.blockedIPs.delete(ip);
  }

  public getBlockedIPs(): string[] {
    return Array.from(this.blockedIPs);
  }

  public addSecurityRule(rule: Omit<SecurityRule, 'id' | 'createdAt' | 'updatedAt'>): void {
    const newRule: SecurityRule = {
      ...rule,
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.rules.push(newRule);
  }

  public updateSecurityRule(ruleId: string, updates: Partial<SecurityRule>): void {
    const ruleIndex = this.rules.findIndex((r) => r.id === ruleId);
    if (ruleIndex !== -1) {
      this.rules[ruleIndex] = {
        ...this.rules[ruleIndex],
        ...updates,
        updatedAt: new Date(),
      };
    }
  }

  public deleteSecurityRule(ruleId: string): void {
    this.rules = this.rules.filter((r) => r.id !== ruleId);
  }

  public getSecurityRules(): SecurityRule[] {
    return [...this.rules];
  }

  public stopMonitoring(): void {
    this.isMonitoring = false;
    console.log('[Security] Security monitoring stopped');
  }

  public isMonitoringActive(): boolean {
    return this.isMonitoring;
  }
}

// Singleton instance
export const advancedSecurityService = new AdvancedSecurityService();

// React hook for security monitoring
export const useSecurityMonitoring = () => {
  const [stats, setStats] = React.useState(advancedSecurityService.getSecurityStats());
  const [recentEvents, setRecentEvents] = React.useState(advancedSecurityService.getRecentEvents());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStats(advancedSecurityService.getSecurityStats());
      setRecentEvents(advancedSecurityService.getRecentEvents());
    }, 10000); // Her 10 saniyede güncelle

    return () => {
      clearInterval(interval);
    };
  }, []);

  return {
    stats,
    recentEvents,
    isIPBlocked: (ip: string) => advancedSecurityService.isIPBlocked(ip),
    unblockIP: (ip: string) => {
      advancedSecurityService.unblockIP(ip);
    },
    getBlockedIPs: () => advancedSecurityService.getBlockedIPs(),
    getSecurityRules: () => advancedSecurityService.getSecurityRules(),
    addSecurityRule: (rule: any) => {
      advancedSecurityService.addSecurityRule(rule);
    },
    updateSecurityRule: (id: string, updates: any) => {
      advancedSecurityService.updateSecurityRule(id, updates);
    },
    deleteSecurityRule: (id: string) => {
      advancedSecurityService.deleteSecurityRule(id);
    },
  };
};

export default advancedSecurityService;
