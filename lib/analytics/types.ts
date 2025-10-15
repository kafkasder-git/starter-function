/**
 * @fileoverview Analytics Types
 * @description TypeScript type definitions for analytics system
 */

export interface AnalyticsConfig {
  measurementId: string;
  enabled: boolean;
  debug?: boolean;
  customDimensions?: Record<string, string>;
  customMetrics?: Record<string, number>;
}

export interface PageViewEvent {
  page_title: string;
  page_location: string;
  page_path: string;
  referrer?: string;
  user_id?: string;
  session_id?: string;
}

export interface CustomEvent {
  event_name: string;
  parameters?: Record<string, any>;
  user_id?: string;
  session_id?: string;
  timestamp?: number;
}

export interface UserProperties {
  user_id?: string;
  email?: string;
  role?: string;
  department?: string;
  registration_date?: string;
  last_login?: string;
  subscription_plan?: string;
}

export interface ErrorEvent {
  error_message: string;
  error_stack?: string;
  error_file?: string;
  error_line?: number;
  error_column?: number;
  user_id?: string;
  session_id?: string;
  page_url?: string;
  user_agent?: string;
}

export interface PerformanceEvent {
  metric_name: string;
  metric_value: number;
  metric_unit?: string;
  page_url?: string;
  user_id?: string;
  session_id?: string;
}

export interface ConversionEvent {
  conversion_name: string;
  conversion_value?: number;
  currency?: string;
  transaction_id?: string;
  items?: ConversionItem[];
  user_id?: string;
  session_id?: string;
}

export interface ConversionItem {
  item_id: string;
  item_name: string;
  category?: string;
  quantity?: number;
  price?: number;
  currency?: string;
}

export interface EcommerceEvent {
  transaction_id: string;
  value: number;
  currency: string;
  items: EcommerceItem[];
  user_id?: string;
  session_id?: string;
}

export interface EcommerceItem {
  item_id: string;
  item_name: string;
  item_category: string;
  item_category2?: string;
  item_category3?: string;
  item_category4?: string;
  item_category5?: string;
  quantity: number;
  price: number;
  currency?: string;
}

export interface SocialEvent {
  social_network: string;
  social_action: string;
  social_target: string;
  user_id?: string;
  session_id?: string;
}

export interface SearchEvent {
  search_term: string;
  search_category?: string;
  results_count?: number;
  user_id?: string;
  session_id?: string;
}

export interface EngagementEvent {
  engagement_time_msec: number;
  scroll_depth?: number;
  video_progress?: number;
  user_id?: string;
  session_id?: string;
}

export interface TimingEvent {
  name: string;
  value: number;
  category?: string;
  variable?: string;
  label?: string;
  user_id?: string;
  session_id?: string;
}

export interface ExceptionEvent {
  description: string;
  fatal?: boolean;
  user_id?: string;
  session_id?: string;
}

export interface AnalyticsProvider {
  init(config: AnalyticsConfig): Promise<void>;
  trackPageView(event: PageViewEvent): Promise<void>;
  trackEvent(event: CustomEvent): Promise<void>;
  setUserProperties(properties: UserProperties): Promise<void>;
  trackError(event: ErrorEvent): Promise<void>;
  trackPerformance(event: PerformanceEvent): Promise<void>;
  trackConversion(event: ConversionEvent): Promise<void>;
  trackEcommerce(event: EcommerceEvent): Promise<void>;
  trackSocial(event: SocialEvent): Promise<void>;
  trackSearch(event: SearchEvent): Promise<void>;
  trackEngagement(event: EngagementEvent): Promise<void>;
  trackTiming(event: TimingEvent): Promise<void>;
  trackException(event: ExceptionEvent): Promise<void>;
  setUserId(userId: string): Promise<void>;
  setSessionId(sessionId: string): Promise<void>;
  flush(): Promise<void>;
}

export interface AnalyticsContext {
  user?: UserProperties;
  session?: {
    id: string;
    start_time: number;
    duration?: number;
  };
  page?: {
    title: string;
    url: string;
    path: string;
    referrer?: string;
  };
  device?: {
    type: 'desktop' | 'mobile' | 'tablet';
    os: string;
    browser: string;
    screen_resolution: string;
  };
  location?: {
    country?: string;
    region?: string;
    city?: string;
    timezone?: string;
  };
}

export interface AnalyticsOptions {
  batch?: boolean;
  batchSize?: number;
  batchTimeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  offline?: boolean;
  debug?: boolean;
}

export interface AnalyticsPlugin {
  name: string;
  version: string;
  init(config: AnalyticsConfig): Promise<void>;
  track(event: any): Promise<void>;
  identify(user: UserProperties): Promise<void>;
  page(page: PageViewEvent): Promise<void>;
  reset(): Promise<void>;
}

export interface AnalyticsMiddleware {
  name: string;
  beforeTrack?: (event: any) => Promise<any> | any;
  afterTrack?: (event: any) => Promise<void> | void;
  onError?: (error: Error) => Promise<void> | void;
}

export interface AnalyticsQueue {
  events: any[];
  maxSize: number;
  flushInterval: number;
  isFlushing: boolean;
  add(event: any): void;
  flush(): Promise<void>;
  clear(): void;
}

export interface AnalyticsStorage {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface AnalyticsSession {
  id: string;
  startTime: number;
  lastActivity: number;
  pageViews: number;
  events: number;
  duration: number;
  isActive: boolean;
  update(): void;
  end(): void;
}

export interface AnalyticsUser {
  id?: string;
  anonymousId?: string;
  traits?: UserProperties;
  isIdentified: boolean;
  identify(traits: UserProperties): void;
  track(event: CustomEvent): void;
  reset(): void;
}

export interface AnalyticsConsent {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  update(consent: Partial<AnalyticsConsent>): void;
  hasConsent(type: keyof AnalyticsConsent): boolean;
  getAllConsents(): AnalyticsConsent;
}

export interface AnalyticsPrivacy {
  anonymizeIp: boolean;
  respectDoNotTrack: boolean;
  cookieConsent: boolean;
  dataRetention: number; // days
  gdprCompliant: boolean;
  ccpaCompliant: boolean;
  checkConsent(): boolean;
  anonymizeData(data: any): any;
}

export type AnalyticsEventType = 
  | 'page_view'
  | 'custom_event'
  | 'user_properties'
  | 'error'
  | 'performance'
  | 'conversion'
  | 'ecommerce'
  | 'social'
  | 'search'
  | 'engagement'
  | 'timing'
  | 'exception';

export interface AnalyticsEvent {
  type: AnalyticsEventType;
  data: any;
  timestamp: number;
  sessionId: string;
  userId?: string;
  anonymousId?: string;
  context?: AnalyticsContext;
  options?: AnalyticsOptions;
}
