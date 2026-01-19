'use client';

/**
 * Analytics tracking system for AfroEats food ordering platform
 * Implements comprehensive tracking for page views, user interactions, and conversions
 */

// Analytics event types
export interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

// Page view tracking
export interface PageViewEvent {
  page_title: string;
  page_location: string;
  page_path: string;
  content_group1?: string; // Category (menu, packages, etc.)
  content_group2?: string; // Subcategory
  custom_parameters?: Record<string, any>;
}

// Customization tracking
export interface CustomizationEvent {
  item_id: string;
  item_name: string;
  item_category: string;
  customization_type: 'radio' | 'checkbox' | 'text';
  customization_name: string;
  selected_option?: string;
  price_modifier: number;
  total_customizations: number;
}

// Cart conversion tracking
export interface CartConversionEvent {
  item_id: string;
  item_name: string;
  item_category: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  customizations_count: number;
  has_special_instructions: boolean;
  conversion_source: 'detail_page' | 'quick_add' | 'related_items';
}

// User behavior tracking
export interface UserBehaviorEvent {
  event_type: 'engagement' | 'exit_point' | 'performance';
  page_path: string;
  engagement_time?: number;
  scroll_depth?: number;
  exit_element?: string;
  performance_metric?: string;
  performance_value?: number;
}

// Analytics configuration
interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
  trackingId?: string;
  customDimensions?: Record<string, string>;
}

class AnalyticsManager {
  private config: AnalyticsConfig;
  private isInitialized = false;
  private sessionStartTime: number;
  private pageStartTime: number;
  private eventQueue: AnalyticsEvent[] = [];

  constructor() {
    this.config = {
      enabled: process.env.NODE_ENV === 'production',
      debug: process.env.NODE_ENV === 'development',
      trackingId: process.env.NEXT_PUBLIC_GA_TRACKING_ID,
    };
    this.sessionStartTime = Date.now();
    this.pageStartTime = Date.now();
  }

  /**
   * Initialize analytics tracking
   */
  initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      // Initialize Google Analytics 4 if tracking ID is provided
      if (this.config.trackingId) {
        this.initializeGA4();
      }

      // Set up performance monitoring
      this.initializePerformanceTracking();

      // Set up user behavior tracking
      this.initializeUserBehaviorTracking();

      this.isInitialized = true;

      if (this.config.debug) {
        console.log('Analytics initialized', this.config);
      }

      // Process queued events
      this.processEventQueue();
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  /**
   * Initialize Google Analytics 4
   */
  private initializeGA4(): void {
    if (!this.config.trackingId) return;

    // Load gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.trackingId}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: [string, ...any[]]) {
      window.dataLayer.push(args);
    }
    (window as any).gtag = gtag;

    gtag('js', new Date());
    gtag('config', this.config.trackingId, {
      page_title: document.title,
      page_location: window.location.href,
      custom_map: this.config.customDimensions,
    });
  }

  /**
   * Initialize performance tracking
   */
  private initializePerformanceTracking(): void {
    // Track Core Web Vitals
    if (
      'web-vitals' in window ||
      typeof window.PerformanceObserver !== 'undefined'
    ) {
      this.trackCoreWebVitals();
    }

    // Track page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.trackPageLoadPerformance();
      }, 0);
    });
  }

  /**
   * Initialize user behavior tracking
   */
  private initializeUserBehaviorTracking(): void {
    // Track scroll depth
    let maxScrollDepth = 0;
    const trackScrollDepth = () => {
      const scrollDepth = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
          100
      );
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        if (scrollDepth >= 25 && scrollDepth % 25 === 0) {
          this.trackUserBehavior({
            event_type: 'engagement',
            page_path: window.location.pathname,
            scroll_depth: scrollDepth,
          });
        }
      }
    };

    window.addEventListener('scroll', trackScrollDepth, { passive: true });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        const engagementTime = Date.now() - this.pageStartTime;
        this.trackUserBehavior({
          event_type: 'engagement',
          page_path: window.location.pathname,
          engagement_time: engagementTime,
          scroll_depth: maxScrollDepth,
        });
      }
    });

    // Track exit points (beforeunload)
    window.addEventListener('beforeunload', () => {
      const engagementTime = Date.now() - this.pageStartTime;
      this.trackUserBehavior({
        event_type: 'exit_point',
        page_path: window.location.pathname,
        engagement_time: engagementTime,
        scroll_depth: maxScrollDepth,
      });
    });
  }

  /**
   * Track Core Web Vitals
   */
  private trackCoreWebVitals(): void {
    // This would typically use the web-vitals library
    // For now, we'll use Performance Observer API
    if (typeof window.PerformanceObserver !== 'undefined') {
      // Track Largest Contentful Paint (LCP)
      new PerformanceObserver(entryList => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.trackUserBehavior({
          event_type: 'performance',
          page_path: window.location.pathname,
          performance_metric: 'LCP',
          performance_value: lastEntry.startTime,
        });
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // Track First Input Delay (FID)
      new PerformanceObserver(entryList => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          this.trackUserBehavior({
            event_type: 'performance',
            page_path: window.location.pathname,
            performance_metric: 'FID',
            performance_value: entry.processingStart - entry.startTime,
          });
        });
      }).observe({ entryTypes: ['first-input'] });

      // Track Cumulative Layout Shift (CLS)
      let clsValue = 0;
      new PerformanceObserver(entryList => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.trackUserBehavior({
          event_type: 'performance',
          page_path: window.location.pathname,
          performance_metric: 'CLS',
          performance_value: clsValue,
        });
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }

  /**
   * Track page load performance
   */
  private trackPageLoadPerformance(): void {
    if (typeof window.performance !== 'undefined') {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;

      if (navigation) {
        // Track various performance metrics
        const metrics = {
          dns_lookup: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcp_connect: navigation.connectEnd - navigation.connectStart,
          server_response: navigation.responseStart - navigation.requestStart,
          dom_interactive: navigation.domInteractive - navigation.fetchStart,
          dom_complete: navigation.domComplete - navigation.fetchStart,
          load_complete: navigation.loadEventEnd - navigation.fetchStart,
        };

        Object.entries(metrics).forEach(([metric, value]) => {
          this.trackUserBehavior({
            event_type: 'performance',
            page_path: window.location.pathname,
            performance_metric: metric,
            performance_value: value,
          });
        });
      }
    }
  }

  /**
   * Track page view
   */
  trackPageView(data: PageViewEvent): void {
    this.pageStartTime = Date.now();

    const event: AnalyticsEvent = {
      event: 'page_view',
      category: 'engagement',
      action: 'page_view',
      label: data.page_path,
      custom_parameters: {
        page_title: data.page_title,
        page_location: data.page_location,
        page_path: data.page_path,
        content_group1: data.content_group1,
        content_group2: data.content_group2,
        ...data.custom_parameters,
      },
    };

    this.sendEvent(event);

    if (this.config.debug) {
      console.log('Page view tracked:', data);
    }
  }

  /**
   * Track customization selection
   */
  trackCustomizationSelection(data: CustomizationEvent): void {
    const event: AnalyticsEvent = {
      event: 'customization_selection',
      category: 'ecommerce',
      action: 'customize_item',
      label: `${data.item_name} - ${data.customization_name}`,
      value: Math.round(data.price_modifier * 100), // Convert to cents
      custom_parameters: {
        item_id: data.item_id,
        item_name: data.item_name,
        item_category: data.item_category,
        customization_type: data.customization_type,
        customization_name: data.customization_name,
        selected_option: data.selected_option,
        price_modifier: data.price_modifier,
        total_customizations: data.total_customizations,
      },
    };

    this.sendEvent(event);

    if (this.config.debug) {
      console.log('Customization selection tracked:', data);
    }
  }

  /**
   * Track cart conversion
   */
  trackCartConversion(data: CartConversionEvent): void {
    const event: AnalyticsEvent = {
      event: 'add_to_cart',
      category: 'ecommerce',
      action: 'add_to_cart',
      label: data.item_name,
      value: Math.round(data.total_price * 100), // Convert to cents
      custom_parameters: {
        currency: 'CAD',
        value: data.total_price,
        items: [
          {
            item_id: data.item_id,
            item_name: data.item_name,
            item_category: data.item_category,
            quantity: data.quantity,
            price: data.unit_price,
          },
        ],
        customizations_count: data.customizations_count,
        has_special_instructions: data.has_special_instructions,
        conversion_source: data.conversion_source,
      },
    };

    this.sendEvent(event);

    if (this.config.debug) {
      console.log('Cart conversion tracked:', data);
    }
  }

  /**
   * Track user behavior
   */
  trackUserBehavior(data: UserBehaviorEvent): void {
    const event: AnalyticsEvent = {
      event: `user_${data.event_type}`,
      category: 'engagement',
      action: data.event_type,
      label: data.page_path,
      value: data.engagement_time || data.performance_value,
      custom_parameters: {
        page_path: data.page_path,
        engagement_time: data.engagement_time,
        scroll_depth: data.scroll_depth,
        exit_element: data.exit_element,
        performance_metric: data.performance_metric,
        performance_value: data.performance_value,
      },
    };

    this.sendEvent(event);

    if (this.config.debug) {
      console.log('User behavior tracked:', data);
    }
  }

  /**
   * Send event to analytics providers
   */
  private sendEvent(event: AnalyticsEvent): void {
    if (!this.config.enabled) return;

    if (!this.isInitialized) {
      this.eventQueue.push(event);
      return;
    }

    try {
      // Send to Google Analytics 4
      if (
        this.config.trackingId &&
        typeof window !== 'undefined' &&
        (window as any).gtag
      ) {
        (window as any).gtag('event', event.event, {
          event_category: event.category,
          event_label: event.label,
          value: event.value,
          ...event.custom_parameters,
        });
      }

      // Send to other analytics providers (e.g., custom analytics endpoint)
      this.sendToCustomEndpoint(event);
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }

  /**
   * Send event to custom analytics endpoint
   */
  private sendToCustomEndpoint(event: AnalyticsEvent): void {
    // This could send to a custom analytics API
    if (typeof window !== 'undefined' && navigator.sendBeacon) {
      const data = JSON.stringify({
        ...event,
        timestamp: Date.now(),
        session_id: this.getSessionId(),
        user_agent: navigator.userAgent,
        page_url: window.location.href,
      });

      // Use sendBeacon for reliable delivery
      navigator.sendBeacon('/api/analytics', data);
    }
  }

  /**
   * Process queued events
   */
  private processEventQueue(): void {
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      if (event) {
        this.sendEvent(event);
      }
    }
  }

  /**
   * Get or generate session ID
   */
  private getSessionId(): string {
    if (typeof window === 'undefined') return 'server';

    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): AnalyticsConfig {
    return { ...this.config };
  }
}

// Create singleton instance
const analytics = new AnalyticsManager();

// Export convenience functions
export const initializeAnalytics = () => analytics.initialize();
export const trackPageView = (data: PageViewEvent) =>
  analytics.trackPageView(data);
export const trackCustomizationSelection = (data: CustomizationEvent) =>
  analytics.trackCustomizationSelection(data);
export const trackCartConversion = (data: CartConversionEvent) =>
  analytics.trackCartConversion(data);
export const trackUserBehavior = (data: UserBehaviorEvent) =>
  analytics.trackUserBehavior(data);
export const updateAnalyticsConfig = (config: Partial<AnalyticsConfig>) =>
  analytics.updateConfig(config);
export const getAnalyticsConfig = () => analytics.getConfig();

// Export the analytics manager instance
export default analytics;

// Extend window type for gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: [string, ...any[]]) => void;
  }
}
