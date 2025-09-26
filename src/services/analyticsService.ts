import { collection, addDoc, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

// Analytics Event Types
export interface AnalyticsEvent {
  id?: string;
  eventType: 'page_view' | 'product_view' | 'add_to_cart' | 'remove_from_cart' | 
            'purchase' | 'search' | 'wishlist_add' | 'review_submit' | 'user_signup' | 
            'user_login' | 'promo_code_used' | 'email_signup' | 'social_share';
  userId?: string;
  sessionId: string;
  timestamp: Timestamp;
  properties: Record<string, any>;
  metadata: {
    userAgent: string;
    referrer: string;
    url: string;
    device: 'mobile' | 'tablet' | 'desktop';
    browser: string;
    os: string;
  };
}

// User Behavior Tracking
export interface UserSession {
  id?: string;
  sessionId: string;
  userId?: string;
  startTime: Timestamp;
  endTime?: Timestamp;
  pageViews: number;
  events: number;
  duration?: number;
  bounced: boolean;
  converted: boolean;
  revenue?: number;
}

// Conversion Funnel
export interface ConversionFunnel {
  step: string;
  users: number;
  conversionRate: number;
  dropOffRate: number;
}

// Product Analytics
export interface ProductAnalytics {
  productId: string;
  views: number;
  addToCarts: number;
  purchases: number;
  revenue: number;
  conversionRate: number;
  averageRating: number;
  reviewCount: number;
}

// Analytics Dashboard Data
export interface AnalyticsDashboard {
  overview: {
    totalUsers: number;
    totalSessions: number;
    totalPageViews: number;
    totalRevenue: number;
    averageOrderValue: number;
    conversionRate: number;
    bounceRate: number;
  };
  timeSeriesData: {
    date: string;
    users: number;
    sessions: number;
    pageViews: number;
    revenue: number;
  }[];
  topProducts: ProductAnalytics[];
  conversionFunnel: ConversionFunnel[];
  userSegments: {
    segment: string;
    users: number;
    revenue: number;
    conversionRate: number;
  }[];
}

class AnalyticsService {
  private sessionId: string;
  private userId?: string;
  private sessionStartTime: Date;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = new Date();
    this.initializeSession();
  }

  // Generate unique session ID
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Initialize user session
  private async initializeSession(): Promise<void> {
    try {
      const sessionData: Omit<UserSession, 'id'> = {
        sessionId: this.sessionId,
        userId: this.userId,
        startTime: Timestamp.fromDate(this.sessionStartTime),
        pageViews: 0,
        events: 0,
        bounced: true,
        converted: false
      };

      await addDoc(collection(db, 'analytics_sessions'), sessionData);
    } catch (error) {
      console.error('Error initializing session:', error);
    }
  }

  // Set user ID for tracking
  setUserId(userId: string): void {
    this.userId = userId;
  }

  // Get device information
  private getDeviceInfo(): AnalyticsEvent['metadata'] {
    const userAgent = navigator.userAgent;
    
    // Simple device detection
    let device: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      device = /iPad/.test(userAgent) ? 'tablet' : 'mobile';
    }

    // Simple browser detection
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    // Simple OS detection
    let os = 'Unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';

    return {
      userAgent,
      referrer: document.referrer,
      url: window.location.href,
      device,
      browser,
      os
    };
  }

  // Track analytics event
  async trackEvent(
    eventType: AnalyticsEvent['eventType'],
    properties: Record<string, any> = {}
  ): Promise<void> {
    try {
      const event: Omit<AnalyticsEvent, 'id'> = {
        eventType,
        userId: this.userId,
        sessionId: this.sessionId,
        timestamp: Timestamp.now(),
        properties,
        metadata: this.getDeviceInfo()
      };

      await addDoc(collection(db, 'analytics_events'), event);
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  // Track page view
  async trackPageView(page: string, title?: string): Promise<void> {
    await this.trackEvent('page_view', {
      page,
      title: title || document.title,
      timestamp: new Date().toISOString()
    });
  }

  // Track product view
  async trackProductView(productId: string, productName: string, category: string, price: number): Promise<void> {
    await this.trackEvent('product_view', {
      productId,
      productName,
      category,
      price,
      currency: 'USD'
    });
  }

  // Track add to cart
  async trackAddToCart(productId: string, productName: string, price: number, quantity: number): Promise<void> {
    await this.trackEvent('add_to_cart', {
      productId,
      productName,
      price,
      quantity,
      value: price * quantity,
      currency: 'USD'
    });
  }

  // Track purchase
  async trackPurchase(
    orderId: string,
    items: Array<{
      productId: string;
      productName: string;
      category: string;
      price: number;
      quantity: number;
    }>,
    totalValue: number,
    tax?: number,
    shipping?: number,
    coupon?: string
  ): Promise<void> {
    await this.trackEvent('purchase', {
      orderId,
      items,
      value: totalValue,
      tax,
      shipping,
      coupon,
      currency: 'USD',
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
    });
  }

  // Track search
  async trackSearch(query: string, resultsCount: number, filters?: Record<string, any>): Promise<void> {
    await this.trackEvent('search', {
      query,
      resultsCount,
      filters,
      hasResults: resultsCount > 0
    });
  }

  // Track user signup
  async trackUserSignup(method: 'email' | 'google' | 'facebook', userId: string): Promise<void> {
    this.setUserId(userId);
    await this.trackEvent('user_signup', {
      method,
      userId,
      timestamp: new Date().toISOString()
    });
  }

  // Track promo code usage
  async trackPromoCodeUsed(code: string, discount: number, orderId?: string): Promise<void> {
    await this.trackEvent('promo_code_used', {
      code,
      discount,
      orderId,
      discountType: discount > 1 ? 'fixed' : 'percentage'
    });
  }

  // Get analytics dashboard data
  async getDashboardData(startDate: Date, endDate: Date): Promise<AnalyticsDashboard> {
    try {
      const startTimestamp = Timestamp.fromDate(startDate);
      const endTimestamp = Timestamp.fromDate(endDate);

      // Get events in date range
      const eventsQuery = query(
        collection(db, 'analytics_events'),
        where('timestamp', '>=', startTimestamp),
        where('timestamp', '<=', endTimestamp),
        orderBy('timestamp', 'desc')
      );

      const eventsSnapshot = await getDocs(eventsQuery);
      const events = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AnalyticsEvent));

      // Calculate overview metrics
      const uniqueUsers = new Set(events.filter(e => e.userId).map(e => e.userId)).size;
      const uniqueSessions = new Set(events.map(e => e.sessionId)).size;
      const totalPageViews = events.filter(e => e.eventType === 'page_view').length;
      
      const purchaseEvents = events.filter(e => e.eventType === 'purchase');
      const totalRevenue = purchaseEvents.reduce((sum, e) => sum + (e.properties.value || 0), 0);
      const averageOrderValue = purchaseEvents.length > 0 ? totalRevenue / purchaseEvents.length : 0;
      const conversionRate = uniqueSessions > 0 ? (purchaseEvents.length / uniqueSessions) * 100 : 0;

      // Calculate bounce rate (sessions with only 1 page view)
      const sessionPageViews = events
        .filter(e => e.eventType === 'page_view')
        .reduce((acc, e) => {
          acc[e.sessionId] = (acc[e.sessionId] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
      
      const bouncedSessions = Object.values(sessionPageViews).filter(count => count === 1).length;
      const bounceRate = uniqueSessions > 0 ? (bouncedSessions / uniqueSessions) * 100 : 0;

      // Generate time series data (simplified - daily aggregation)
      const timeSeriesData = this.generateTimeSeriesData(events, startDate, endDate);

      // Get top products
      const topProducts = this.calculateTopProducts(events);

      // Generate conversion funnel
      const conversionFunnel = this.calculateConversionFunnel(events);

      // Generate user segments
      const userSegments = this.calculateUserSegments(events);

      return {
        overview: {
          totalUsers: uniqueUsers,
          totalSessions: uniqueSessions,
          totalPageViews,
          totalRevenue,
          averageOrderValue,
          conversionRate,
          bounceRate
        },
        timeSeriesData,
        topProducts,
        conversionFunnel,
        userSegments
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      throw error;
    }
  }

  // Generate time series data
  private generateTimeSeriesData(events: AnalyticsEvent[], startDate: Date, endDate: Date): AnalyticsDashboard['timeSeriesData'] {
    const data: Record<string, { users: Set<string>, sessions: Set<string>, pageViews: number, revenue: number }> = {};
    
    // Initialize data for each day
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      data[dateKey] = {
        users: new Set(),
        sessions: new Set(),
        pageViews: 0,
        revenue: 0
      };
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Aggregate events by date
    events.forEach(event => {
      const date = event.timestamp.toDate().toISOString().split('T')[0];
      if (data[date]) {
        if (event.userId) data[date].users.add(event.userId);
        data[date].sessions.add(event.sessionId);
        if (event.eventType === 'page_view') data[date].pageViews++;
        if (event.eventType === 'purchase') data[date].revenue += event.properties.value || 0;
      }
    });

    return Object.entries(data).map(([date, stats]) => ({
      date,
      users: stats.users.size,
      sessions: stats.sessions.size,
      pageViews: stats.pageViews,
      revenue: stats.revenue
    }));
  }

  // Calculate top products
  private calculateTopProducts(events: AnalyticsEvent[]): ProductAnalytics[] {
    const productStats: Record<string, ProductAnalytics> = {};

    events.forEach(event => {
      if (event.properties.productId) {
        const productId = event.properties.productId;
        
        if (!productStats[productId]) {
          productStats[productId] = {
            productId,
            views: 0,
            addToCarts: 0,
            purchases: 0,
            revenue: 0,
            conversionRate: 0,
            averageRating: 0,
            reviewCount: 0
          };
        }

        const stats = productStats[productId];
        
        switch (event.eventType) {
          case 'product_view':
            stats.views++;
            break;
          case 'add_to_cart':
            stats.addToCarts++;
            break;
          case 'purchase':
            const item = event.properties.items?.find((i: any) => i.productId === productId);
            if (item) {
              stats.purchases += item.quantity;
              stats.revenue += item.price * item.quantity;
            }
            break;
        }
      }
    });

    // Calculate conversion rates
    Object.values(productStats).forEach(stats => {
      stats.conversionRate = stats.views > 0 ? (stats.purchases / stats.views) * 100 : 0;
    });

    return Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }

  // Calculate conversion funnel
  private calculateConversionFunnel(events: AnalyticsEvent[]): ConversionFunnel[] {
    const sessions = new Set(events.map(e => e.sessionId));
    const totalSessions = sessions.size;

    const funnelSteps = [
      { step: 'Sessions', count: totalSessions },
      { step: 'Product Views', count: new Set(events.filter(e => e.eventType === 'product_view').map(e => e.sessionId)).size },
      { step: 'Add to Cart', count: new Set(events.filter(e => e.eventType === 'add_to_cart').map(e => e.sessionId)).size },
      { step: 'Purchase', count: new Set(events.filter(e => e.eventType === 'purchase').map(e => e.sessionId)).size }
    ];

    return funnelSteps.map((step, index) => ({
      step: step.step,
      users: step.count,
      conversionRate: totalSessions > 0 ? (step.count / totalSessions) * 100 : 0,
      dropOffRate: index > 0 ? ((funnelSteps[index - 1].count - step.count) / funnelSteps[index - 1].count) * 100 : 0
    }));
  }

  // Calculate user segments
  private calculateUserSegments(events: AnalyticsEvent[]): AnalyticsDashboard['userSegments'] {
    const userStats: Record<string, { events: number, revenue: number, purchases: number }> = {};

    events.forEach(event => {
      if (event.userId) {
        if (!userStats[event.userId]) {
          userStats[event.userId] = { events: 0, revenue: 0, purchases: 0 };
        }
        
        userStats[event.userId].events++;
        if (event.eventType === 'purchase') {
          userStats[event.userId].revenue += event.properties.value || 0;
          userStats[event.userId].purchases++;
        }
      }
    });

    const users = Object.values(userStats);
    const totalUsers = users.length;
    const totalRevenue = users.reduce((sum, u) => sum + u.revenue, 0);

    // Segment users
    const newUsers = users.filter(u => u.purchases === 0);
    const oneTimeBuyers = users.filter(u => u.purchases === 1);
    const repeatBuyers = users.filter(u => u.purchases > 1);
    const highValueUsers = users.filter(u => u.revenue > 100);

    return [
      {
        segment: 'New Users',
        users: newUsers.length,
        revenue: newUsers.reduce((sum, u) => sum + u.revenue, 0),
        conversionRate: totalUsers > 0 ? ((totalUsers - newUsers.length) / totalUsers) * 100 : 0
      },
      {
        segment: 'One-time Buyers',
        users: oneTimeBuyers.length,
        revenue: oneTimeBuyers.reduce((sum, u) => sum + u.revenue, 0),
        conversionRate: oneTimeBuyers.length > 0 ? (oneTimeBuyers.length / totalUsers) * 100 : 0
      },
      {
        segment: 'Repeat Buyers',
        users: repeatBuyers.length,
        revenue: repeatBuyers.reduce((sum, u) => sum + u.revenue, 0),
        conversionRate: repeatBuyers.length > 0 ? (repeatBuyers.length / totalUsers) * 100 : 0
      },
      {
        segment: 'High Value Users',
        users: highValueUsers.length,
        revenue: highValueUsers.reduce((sum, u) => sum + u.revenue, 0),
        conversionRate: highValueUsers.length > 0 ? (highValueUsers.length / totalUsers) * 100 : 0
      }
    ];
  }

  // End session
  async endSession(): Promise<void> {
    try {
      const sessionDuration = Date.now() - this.sessionStartTime.getTime();
      
      // Update session with end time and duration
      const sessionsQuery = query(
        collection(db, 'analytics_sessions'),
        where('sessionId', '==', this.sessionId),
        limit(1)
      );

      const sessionsSnapshot = await getDocs(sessionsQuery);
      if (!sessionsSnapshot.empty) {
        const sessionDoc = sessionsSnapshot.docs[0];
        // Note: In a real implementation, you'd use updateDoc here
        // updateDoc(sessionDoc.ref, {
        //   endTime: Timestamp.now(),
        //   duration: sessionDuration
        // });
      }
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }
}

// Create singleton instance
export const analyticsService = new AnalyticsService();

// Auto-track page views on route changes
if (typeof window !== 'undefined') {
  // Track initial page load
  analyticsService.trackPageView(window.location.pathname);

  // Track page views on navigation (for SPAs)
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function(...args) {
    originalPushState.apply(history, args);
    setTimeout(() => analyticsService.trackPageView(window.location.pathname), 0);
  };

  history.replaceState = function(...args) {
    originalReplaceState.apply(history, args);
    setTimeout(() => analyticsService.trackPageView(window.location.pathname), 0);
  };

  window.addEventListener('popstate', () => {
    analyticsService.trackPageView(window.location.pathname);
  });

  // End session on page unload
  window.addEventListener('beforeunload', () => {
    analyticsService.endSession();
  });
}

export default AnalyticsService;