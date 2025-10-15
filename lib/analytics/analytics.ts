/**
 * @fileoverview Analytics Service
 * @description Google Analytics 4 integration with custom event tracking
 */

import {
  AnalyticsConfig,
  PageViewEvent,
  CustomEvent,
  UserProperties,
  ErrorEvent,
  PerformanceEvent,
  ConversionEvent,
  EcommerceEvent,
  AnalyticsProvider,
  AnalyticsContext,
  AnalyticsOptions,
  AnalyticsSession,
  AnalyticsUser,
  AnalyticsConsent
} from './types';

// Google Analytics 4 (gtag) type declarations
declare global {
  interface Window {
    gtag: (
      command: string,
      targetId: string,
      config?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
}

class AnalyticsService implements AnalyticsProvider {
  private config: AnalyticsConfig | null = null;
  private session: AnalyticsSession | null = null;
  private user: AnalyticsUser | null = null;
  private consent: AnalyticsConsent | null = null;
  private isInitialized = false;
  private queue: any[] = [];
  private isFlushing = false;

  constructor() {
    this.initializeSession();
    this.initializeUser();
    this.initializeConsent();
  }

  /**
   * Initialize analytics service
   */
  async init(config: AnalyticsConfig): Promise<void> {
    this.config = config;

    if (!config.enabled) {
      console.log('Analytics disabled');
      return;
    }

    try {
      // Load Google Analytics script
      await this.loadGoogleAnalytics(config.measurementId);
      
      // Initialize gtag
      this.initializeGtag(config);
      
      // Set user properties if available
      if (this.user?.isIdentified) {
        await this.setUserProperties(this.user.traits || {});
      }

      // Flush queued events
      await this.flush();

      this.isInitialized = true;
      
      if (config.debug) {
        console.log('Analytics initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  /**
   * Track page view
   */
  async trackPageView(event: PageViewEvent): Promise<void> {
    if (!this.isInitialized || !this.hasAnalyticsConsent()) {
      this.queue.push({ type: 'page_view', data: event });
      return;
    }

    try {
      window.gtag('config', this.config!.measurementId, {
        page_title: event.page_title,
        page_location: event.page_location,
        page_path: event.page_path,
        custom_map: this.config?.customDimensions
      });

      // Track custom page view event
      window.gtag('event', 'page_view', {
        page_title: event.page_title,
        page_location: event.page_location,
        page_path: event.page_path,
        user_id: event.user_id || this.user?.id,
        session_id: event.session_id || this.session?.id
      });

      // Update session
      this.session?.update();
      
      if (this.config?.debug) {
        console.log('Page view tracked:', event);
      }
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  }

  /**
   * Track custom event
   */
  async trackEvent(event: CustomEvent): Promise<void> {
    if (!this.isInitialized || !this.hasAnalyticsConsent()) {
      this.queue.push({ type: 'custom_event', data: event });
      return;
    }

    try {
      const eventData = {
        event_name: event.event_name,
        ...event.parameters,
        user_id: event.user_id || this.user?.id,
        session_id: event.session_id || this.session?.id,
        timestamp: event.timestamp || Date.now()
      };

      window.gtag('event', event.event_name, eventData);

      // Update session
      this.session?.update();
      
      if (this.config?.debug) {
        console.log('Custom event tracked:', event);
      }
    } catch (error) {
      console.error('Failed to track custom event:', error);
    }
  }

  /**
   * Set user properties
   */
  async setUserProperties(properties: UserProperties): Promise<void> {
    if (!this.isInitialized || !this.hasAnalyticsConsent()) {
      return;
    }

    try {
      // Set user properties in gtag
      window.gtag('config', this.config!.measurementId, {
        user_properties: properties
      });

      // Update internal user object
      if (this.user) {
        this.user.identify(properties);
      }
      
      if (this.config?.debug) {
        console.log('User properties set:', properties);
      }
    } catch (error) {
      console.error('Failed to set user properties:', error);
    }
  }

  /**
   * Track error
   */
  async trackError(event: ErrorEvent): Promise<void> {
    const errorEvent: CustomEvent = {
      event_name: 'error',
      parameters: {
        error_message: event.error_message,
        error_stack: event.error_stack,
        error_file: event.error_file,
        error_line: event.error_line,
        error_column: event.error_column,
        page_url: event.page_url,
        user_agent: event.user_agent
      },
      user_id: event.user_id,
      session_id: event.session_id
    };

    await this.trackEvent(errorEvent);
  }

  /**
   * Track performance metrics
   */
  async trackPerformance(event: PerformanceEvent): Promise<void> {
    const performanceEvent: CustomEvent = {
      event_name: 'performance_metric',
      parameters: {
        metric_name: event.metric_name,
        metric_value: event.metric_value,
        metric_unit: event.metric_unit,
        page_url: event.page_url
      },
      user_id: event.user_id,
      session_id: event.session_id
    };

    await this.trackEvent(performanceEvent);
  }

  /**
   * Track conversion
   */
  async trackConversion(event: ConversionEvent): Promise<void> {
    const conversionEvent: CustomEvent = {
      event_name: 'conversion',
      parameters: {
        conversion_name: event.conversion_name,
        conversion_value: event.conversion_value,
        currency: event.currency,
        transaction_id: event.transaction_id,
        items: event.items
      },
      user_id: event.user_id,
      session_id: event.session_id
    };

    await this.trackEvent(conversionEvent);
  }

  /**
   * Track ecommerce event
   */
  async trackEcommerce(event: EcommerceEvent): Promise<void> {
    const ecommerceEvent: CustomEvent = {
      event_name: 'purchase',
      parameters: {
        transaction_id: event.transaction_id,
        value: event.value,
        currency: event.currency,
        items: event.items
      },
      user_id: event.user_id,
      session_id: event.session_id
    };

    await this.trackEvent(ecommerceEvent);
  }

  /**
   * Set user ID
   */
  async setUserId(userId: string): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      window.gtag('config', this.config!.measurementId, {
        user_id: userId
      });

      if (this.user) {
        this.user.identify({ user_id: userId });
      }
      
      if (this.config?.debug) {
        console.log('User ID set:', userId);
      }
    } catch (error) {
      console.error('Failed to set user ID:', error);
    }
  }

  /**
   * Set session ID
   */
  async setSessionId(sessionId: string): Promise<void> {
    if (this.session) {
      this.session.id = sessionId;
    }
  }

  /**
   * Flush queued events
   */
  async flush(): Promise<void> {
    if (this.isFlushing || !this.isInitialized) {
      return;
    }

    this.isFlushing = true;

    try {
      while (this.queue.length > 0) {
        const event = this.queue.shift();
        
        switch (event.type) {
          case 'page_view':
            await this.trackPageView(event.data);
            break;
          case 'custom_event':
            await this.trackEvent(event.data);
            break;
        }
      }
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * Update consent settings
   */
  updateConsent(consent: Partial<AnalyticsConsent>): void {
    if (this.consent) {
      this.consent.update(consent);
      
      if (this.isInitialized) {
        window.gtag('consent', 'update', {
          analytics_storage: consent.analytics ? 'granted' : 'denied'
        });
      }
    }
  }

  /**
   * Get current session
   */
  getSession(): AnalyticsSession | null {
    return this.session;
  }

  /**
   * Get current user
   */
  getUser(): AnalyticsUser | null {
    return this.user;
  }

  /**
   * Get consent status
   */
  getConsent(): AnalyticsConsent | null {
    return this.consent;
  }

  // Private methods

  private async loadGoogleAnalytics(measurementId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.gtag) {
        resolve();
        return;
      }

      // Initialize dataLayer
      window.dataLayer = window.dataLayer || [];

      // Define gtag function
      window.gtag = function() {
        window.dataLayer.push(arguments);
      };

      // Set initial timestamp
      window.gtag('js', new Date());

      // Load Google Analytics script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Analytics'));
      
      document.head.appendChild(script);
    });
  }

  private initializeGtag(config: AnalyticsConfig): void {
    // Initialize with measurement ID
    window.gtag('config', config.measurementId, {
      anonymize_ip: true,
      allow_google_signals: false,
      send_page_view: false, // We'll send page views manually
      ...config.customDimensions
    });

    // Set consent mode
    window.gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      wait_for_update: 500
    });
  }

  private initializeSession(): void {
    this.session = {
      id: this.generateSessionId(),
      startTime: Date.now(),
      lastActivity: Date.now(),
      pageViews: 0,
      events: 0,
      duration: 0,
      isActive: true,
      
      update: () => {
        this.session!.lastActivity = Date.now();
        this.session!.duration = Date.now() - this.session!.startTime;
        this.session!.events++;
      },
      
      end: () => {
        this.session!.isActive = false;
        this.session!.duration = Date.now() - this.session!.startTime;
      }
    };
  }

  private initializeUser(): void {
    this.user = {
      id: undefined,
      anonymousId: this.generateAnonymousId(),
      traits: {},
      isIdentified: false,
      
      identify: (traits: UserProperties) => {
        this.user!.traits = { ...this.user!.traits, ...traits };
        this.user!.isIdentified = true;
        if (traits.user_id) {
          this.user!.id = traits.user_id;
        }
      },
      
      track: (event: CustomEvent) => {
        this.trackEvent(event);
      },
      
      reset: () => {
        this.user!.id = undefined;
        this.user!.anonymousId = this.generateAnonymousId();
        this.user!.traits = {};
        this.user!.isIdentified = false;
      }
    };
  }

  private initializeConsent(): void {
    this.consent = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
      preferences: false,
      
      update: (consent: Partial<AnalyticsConsent>) => {
        Object.assign(this.consent!, consent);
      },
      
      hasConsent: (type: keyof AnalyticsConsent) => {
        return this.consent![type] === true;
      },
      
      getAllConsents: () => {
        return { ...this.consent! };
      }
    };
  }

  private hasAnalyticsConsent(): boolean {
    return this.consent?.hasConsent('analytics') ?? false;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAnonymousId(): string {
    return `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Create singleton instance
export const analytics = new AnalyticsService();

// Custom event tracking helpers
export const trackUserAction = (action: string, category: string, label?: string, value?: number) => {
  analytics.trackEvent({
    event_name: 'user_action',
    parameters: {
      action,
      category,
      label,
      value
    }
  });
};

export const trackDonation = (amount: number, type: string, category?: string) => {
  analytics.trackConversion({
    conversion_name: 'donation',
    conversion_value: amount,
    currency: 'TRY',
    parameters: {
      donation_type: type,
      donation_category: category
    }
  });
};

export const trackBeneficiaryCreation = (beneficiaryType: string, priority: string) => {
  analytics.trackEvent({
    event_name: 'beneficiary_created',
    parameters: {
      beneficiary_type: beneficiaryType,
      priority
    }
  });
};

export const trackPageLoad = (pageName: string, loadTime: number) => {
  analytics.trackPerformance({
    metric_name: 'page_load_time',
    metric_value: loadTime,
    metric_unit: 'milliseconds',
    page_url: window.location.href
  });
};

export const trackError = (error: Error, context?: string) => {
  analytics.trackError({
    error_message: error.message,
    error_stack: error.stack,
    page_url: window.location.href,
    user_agent: navigator.userAgent,
    ...(context && { context })
  });
};

export default analytics;
