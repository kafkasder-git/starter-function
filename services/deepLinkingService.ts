/**
 * Deep Linking Service
 * Handles deep links, URL parameters, and navigation state
 */

export interface DeepLinkRoute {
  path: string;
  module: string;
  page?: string;
  params?: Record<string, string>;
  state?: any;
}

export interface DeepLinkHandler {
  pattern: RegExp;
  handler: (match: RegExpMatchArray, params: URLSearchParams) => DeepLinkRoute;
}

export interface ShareableLink {
  url: string;
  title: string;
  description: string;
  metadata?: Record<string, any>;
}

class DeepLinkingService {
  private readonly handlers: DeepLinkHandler[] = [];
  private currentRoute: DeepLinkRoute | null = null;
  private readonly listeners: ((route: DeepLinkRoute) => void)[] = [];

  constructor() {
    this.initializeDefaultHandlers();
    this.setupEventListeners();
  }

  /**
   * Initialize default deep link handlers
   */
  private initializeDefaultHandlers(): void {
    // Module navigation patterns
    this.addHandler(/^\/(genel|dashboard)(?:\/(.+))?/, (match, params) => ({
      path: match[0],
      module: 'genel',
      page: match[2] || 'dashboard',
      params: Object.fromEntries(params.entries()),
    }));

    this.addHandler(/^\/yardim(?:\/(.+))?/, (match, params) => ({
      path: match[0],
      module: 'yardim',
      page: match[1] || 'ihtiyac-sahipleri',
      params: Object.fromEntries(params.entries()),
    }));

    this.addHandler(/^\/bagis(?:\/(.+))?/, (match, params) => ({
      path: match[0],
      module: 'bagis',
      page: match[1] || 'liste',
      params: Object.fromEntries(params.entries()),
    }));

    this.addHandler(/^\/uye(?:\/(.+))?/, (match, params) => ({
      path: match[0],
      module: 'uye',
      page: match[1] || 'liste',
      params: Object.fromEntries(params.entries()),
    }));

    this.addHandler(/^\/burs(?:\/(.+))?/, (match, params) => ({
      path: match[0],
      module: 'burs',
      page: match[1] || 'ogrenciler',
      params: Object.fromEntries(params.entries()),
    }));

    this.addHandler(/^\/fon(?:\/(.+))?/, (match, params) => ({
      path: match[0],
      module: 'fon',
      page: match[1] || 'gelir',
      params: Object.fromEntries(params.entries()),
    }));

    this.addHandler(/^\/mesaj(?:\/(.+))?/, (match, params) => ({
      path: match[0],
      module: 'mesaj',
      page: match[1] || 'ic-mesajlar',
      params: Object.fromEntries(params.entries()),
    }));

    this.addHandler(/^\/is(?:\/(.+))?/, (match, params) => ({
      path: match[0],
      module: 'is',
      page: match[1] || 'etkinlikler',
      params: Object.fromEntries(params.entries()),
    }));

    this.addHandler(/^\/partner(?:\/(.+))?/, (match, params) => ({
      path: match[0],
      module: 'partner',
      page: match[1] || 'liste',
      params: Object.fromEntries(params.entries()),
    }));

    this.addHandler(/^\/hukuki(?:\/(.+))?/, (match, params) => ({
      path: match[0],
      module: 'hukuki',
      page: match[1] || 'danismanlik',
      params: Object.fromEntries(params.entries()),
    }));

    this.addHandler(/^\/sistem(?:\/(.+))?/, (match, params) => ({
      path: match[0],
      module: 'sistem',
      page: match[1] || 'ayarlar',
      params: Object.fromEntries(params.entries()),
    }));

    // Special routes
    this.addHandler(/^\/beneficiary\/([a-zA-Z0-9-]+)/, (match, params) => ({
      path: match[0],
      module: 'yardim',
      page: 'beneficiary-detail',
      params: {
        id: match[1],
        ...Object.fromEntries(params.entries()),
      },
    }));

    this.addHandler(/^\/donation\/([a-zA-Z0-9-]+)/, (match, params) => ({
      path: match[0],
      module: 'bagis',
      page: 'donation-detail',
      params: {
        id: match[1],
        ...Object.fromEntries(params.entries()),
      },
    }));

    this.addHandler(/^\/member\/([a-zA-Z0-9-]+)/, (match, params) => ({
      path: match[0],
      module: 'uye',
      page: 'member-detail',
      params: {
        id: match[1],
        ...Object.fromEntries(params.entries()),
      },
    }));
  }

  /**
   * Setup event listeners for URL changes
   */
  private setupEventListeners(): void {
    // Listen for hash changes
    window.addEventListener('hashchange', this.handleUrlChange.bind(this));

    // Listen for popstate (back/forward navigation)
    window.addEventListener('popstate', this.handleUrlChange.bind(this));

    // Handle initial URL
    this.handleUrlChange();
  }

  /**
   * Handle URL changes
   */
  private handleUrlChange(): void {
    const route = this.parseCurrentUrl();
    if (route) {
      this.currentRoute = route;
      this.notifyListeners(route);
    }
  }

  /**
   * Parse current URL and extract route information
   */
  parseCurrentUrl(): DeepLinkRoute | null {
    try {
      const url = new URL(window.location.href);
      const pathname = url.hash.replace('#', '') || url.pathname;
      const searchParams = new URLSearchParams(url.search);

      // Try to match against registered handlers
      for (const handler of this.handlers) {
        const match = pathname.match(handler.pattern);
        if (match) {
          return handler.handler(match, searchParams);
        }
      }

      // Default route
      return {
        path: pathname,
        module: 'genel',
        page: 'dashboard',
        params: Object.fromEntries(searchParams.entries()),
      };
    } catch (error) {
      console.error('Failed to parse URL:', error);
      return null;
    }
  }

  /**
   * Add custom deep link handler
   */
  addHandler(pattern: RegExp, handler: DeepLinkHandler['handler']): void {
    this.handlers.push({ pattern, handler });
  }

  /**
   * Navigate to a specific route
   */
  navigate(route: Partial<DeepLinkRoute>): void {
    try {
      const fullRoute: DeepLinkRoute = {
        path: route.path || `/${route.module}${route.page ? `/${route.page}` : ''}`,
        module: route.module || 'genel',
        page: route.page || 'dashboard',
        params: route.params || {},
        state: route.state,
      };

      // Build URL with parameters
      const url = new URL(window.location.origin);
      url.hash = fullRoute.path;

      // Add query parameters
      Object.entries(fullRoute.params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });

      // Update browser history
      window.history.pushState(fullRoute.state, '', url.href);

      // Update current route and notify listeners
      this.currentRoute = fullRoute;
      this.notifyListeners(fullRoute);

      console.log('Navigated to:', fullRoute);
    } catch (error) {
      console.error('Navigation failed:', error);
    }
  }

  /**
   * Generate shareable link for current state
   */
  generateShareableLink(
    options: {
      title?: string;
      description?: string;
      includeState?: boolean;
      customParams?: Record<string, string>;
    } = {},
  ): ShareableLink {
    const currentUrl = new URL(window.location.href);

    // Add custom parameters
    if (options.customParams) {
      Object.entries(options.customParams).forEach(([key, value]) => {
        currentUrl.searchParams.set(key, value);
      });
    }

    // Add timestamp for unique sharing
    currentUrl.searchParams.set('shared', Date.now().toString());

    const route = this.currentRoute || this.parseCurrentUrl();

    return {
      url: currentUrl.href,
      title: options.title || this.getPageTitle(route),
      description: options.description || this.getPageDescription(route),
      metadata: {
        module: route?.module,
        page: route?.page,
        params: route?.params,
        timestamp: Date.now(),
      },
    };
  }

  /**
   * Parse shared link and extract information
   */
  parseSharedLink(url: string): DeepLinkRoute | null {
    try {
      const parsedUrl = new URL(url);
      const originalUrl = window.location.href;

      // Temporarily update window location for parsing
      window.history.replaceState(null, '', url);
      const route = this.parseCurrentUrl();

      // Restore original URL
      window.history.replaceState(null, '', originalUrl);

      return route;
    } catch (error) {
      console.error('Failed to parse shared link:', error);
      return null;
    }
  }

  /**
   * Get current route
   */
  getCurrentRoute(): DeepLinkRoute | null {
    return this.currentRoute;
  }

  /**
   * Add route change listener
   */
  addListener(listener: (route: DeepLinkRoute) => void): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of route change
   */
  private notifyListeners(route: DeepLinkRoute): void {
    this.listeners.forEach((listener) => {
      try {
        listener(route);
      } catch (error) {
        console.error('Route listener error:', error);
      }
    });
  }

  /**
   * Get page title for route
   */
  private getPageTitle(route: DeepLinkRoute | null): string {
    if (!route) return 'Dernek Yönetim Sistemi';

    const moduleTitles = {
      genel: 'Genel Bakış',
      yardim: 'Yardım Yönetimi',
      bagis: 'Bağış Yönetimi',
      uye: 'Üye Yönetimi',
      burs: 'Burs Yönetimi',
      fon: 'Fon Yönetimi',
      mesaj: 'Mesaj Sistemi',
      is: 'İş ve Etkinlik Yönetimi',
      partner: 'Partner Yönetimi',
      hukuki: 'Hukuki Danışmanlık',
      sistem: 'Sistem Yönetimi',
    };

    return `${moduleTitles[route.module as keyof typeof moduleTitles] || route.module} - Dernek Yönetim Sistemi`;
  }

  /**
   * Get page description for route
   */
  private getPageDescription(route: DeepLinkRoute | null): string {
    if (!route) return 'Modern dernek yönetim sistemi';

    const moduleDescriptions = {
      genel: 'Dernek genel bakış ve istatistikleri',
      yardim: 'İhtiyaç sahipleri ve yardım başvuruları yönetimi',
      bagis: 'Bağış takibi ve bağışçı yönetimi',
      uye: 'Üye kayıtları ve aidat takibi',
      burs: 'Burs öğrencileri ve başvuru yönetimi',
      fon: 'Mali işlemler ve bütçe yönetimi',
      mesaj: 'İç ve dış iletişim yönetimi',
      is: 'Etkinlik ve görev yönetimi',
      partner: 'Partner kurum ve işbirliği yönetimi',
      hukuki: 'Hukuki danışmanlık ve dava takibi',
      sistem: 'Sistem ayarları ve yönetimi',
    };

    return (
      moduleDescriptions[route.module as keyof typeof moduleDescriptions] ||
      'Dernek yönetim sistemi'
    );
  }

  /**
   * Generate QR code for current page
   */
  async generateQRCode(): Promise<string> {
    const shareableLink = this.generateShareableLink();

    // Simple QR code generation using a service
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareableLink.url)}`;

    return qrApiUrl;
  }

  /**
   * Handle custom protocol URLs (for native app integration)
   */
  handleCustomProtocol(protocolUrl: string): DeepLinkRoute | null {
    try {
      // Handle custom protocol like: dernekys://module/page?param=value
      const url = new URL(protocolUrl);

      if (url.protocol === 'dernekys:') {
        const path = url.pathname;
        const params = new URLSearchParams(url.search);

        // Find matching handler
        for (const handler of this.handlers) {
          const match = path.match(handler.pattern);
          if (match) {
            return handler.handler(match, params);
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Failed to handle custom protocol:', error);
      return null;
    }
  }

  /**
   * Register custom protocol handler (experimental)
   */
  registerProtocolHandler(): void {
    try {
      if ('registerProtocolHandler' in navigator) {
        navigator.registerProtocolHandler(
          'web+dernekys',
          `${window.location.origin}/#/handle-protocol?url=%s`,
          'Dernek Yönetim Sistemi',
        );
        console.log('Protocol handler registered');
      }
    } catch (error) {
      console.error('Failed to register protocol handler:', error);
    }
  }

  /**
   * Create shareable link for specific entity
   */
  createEntityLink(entity: {
    type: 'beneficiary' | 'donation' | 'member' | 'event';
    id: string;
    title?: string;
    description?: string;
  }): ShareableLink {
    const baseUrl = window.location.origin;
    const entityPaths = {
      beneficiary: '/yardim/ihtiyac-sahipleri',
      donation: '/bagis/liste',
      member: '/uye/liste',
      event: '/is/etkinlikler',
    };

    const url = `${baseUrl}#${entityPaths[entity.type]}?id=${entity.id}&view=detail`;

    return {
      url,
      title: entity.title || `${entity.type} Detayı`,
      description:
        entity.description || `${entity.id} numaralı ${entity.type} kaydını görüntüleyin`,
      metadata: {
        entityType: entity.type,
        entityId: entity.id,
        timestamp: Date.now(),
      },
    };
  }

  /**
   * Parse entity link and extract information
   */
  parseEntityLink(url: string): {
    type: string;
    id: string;
    params: Record<string, string>;
  } | null {
    try {
      const parsedUrl = new URL(url);
      const params = new URLSearchParams(parsedUrl.search);
      const hash = parsedUrl.hash.replace('#', '');

      // Extract entity type from path
      const entityPatterns = {
        beneficiary: /\/yardim\/ihtiyac-sahipleri/,
        donation: /\/bagis\/liste/,
        member: /\/uye\/liste/,
        event: /\/is\/etkinlikler/,
      };

      for (const [type, pattern] of Object.entries(entityPatterns)) {
        if (pattern.test(hash)) {
          const id = params.get('id');
          if (id) {
            return {
              type,
              id,
              params: Object.fromEntries(params.entries()),
            };
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Failed to parse entity link:', error);
      return null;
    }
  }

  /**
   * Generate breadcrumb navigation from current route
   */
  generateBreadcrumbs(): { label: string; path: string; active: boolean }[] {
    if (!this.currentRoute) return [];

    const breadcrumbs = [];

    // Add home
    breadcrumbs.push({
      label: 'Ana Sayfa',
      path: '/genel',
      active: false,
    });

    // Add module
    if (this.currentRoute.module !== 'genel') {
      const moduleLabels = {
        yardim: 'Yardım',
        bagis: 'Bağış',
        uye: 'Üye',
        burs: 'Burs',
        fon: 'Fon',
        mesaj: 'Mesaj',
        is: 'İş',
        partner: 'Partner',
        hukuki: 'Hukuki',
        sistem: 'Sistem',
      };

      breadcrumbs.push({
        label:
          moduleLabels[this.currentRoute.module as keyof typeof moduleLabels] ||
          this.currentRoute.module,
        path: `/${this.currentRoute.module}`,
        active: false,
      });
    }

    // Add page if different from module default
    if (this.currentRoute.page && this.currentRoute.page !== 'dashboard') {
      breadcrumbs.push({
        label: this.currentRoute.page.charAt(0).toUpperCase() + this.currentRoute.page.slice(1),
        path: this.currentRoute.path,
        active: true,
      });
    } else {
      // Mark last item as active
      if (breadcrumbs.length > 0) {
        breadcrumbs[breadcrumbs.length - 1].active = true;
      }
    }

    return breadcrumbs;
  }

  /**
   * Get URL parameters
   */
  getUrlParams(): Record<string, string> {
    const params = new URLSearchParams(window.location.search);
    return Object.fromEntries(params.entries());
  }

  /**
   * Update URL parameters without navigation
   */
  updateUrlParams(params: Record<string, string>, replace = false): void {
    const url = new URL(window.location.href);

    if (replace) {
      // Clear existing params
      url.search = '';
    }

    // Add new params
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    // Update URL without triggering navigation
    window.history.replaceState(null, '', url.href);
  }

  /**
   * Remove URL parameters
   */
  removeUrlParams(paramNames: string[]): void {
    const url = new URL(window.location.href);

    paramNames.forEach((name) => {
      url.searchParams.delete(name);
    });

    window.history.replaceState(null, '', url.href);
  }
}

// Export singleton instance
export const deepLinkingService = new DeepLinkingService();
export default deepLinkingService;
