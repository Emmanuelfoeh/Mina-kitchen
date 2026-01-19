/**
 * Analytics export utilities for generating reports and insights
 * from collected analytics data
 */

export interface AnalyticsReport {
  summary: {
    totalPageViews: number;
    totalCustomizations: number;
    totalCartConversions: number;
    averageEngagementTime: number;
    averageScrollDepth: number;
    conversionRate: number;
  };
  pagePerformance: {
    averageLoadTime: number;
    averageLCP: number;
    averageFID: number;
    averageCLS: number;
  };
  userBehavior: {
    topExitPoints: Array<{ element: string; count: number }>;
    engagementPatterns: Array<{ pattern: string; frequency: number }>;
    deviceBreakdown: Record<string, number>;
  };
  itemInsights: {
    mostCustomizedItems: Array<{
      itemId: string;
      itemName: string;
      customizationCount: number;
    }>;
    popularCustomizations: Array<{
      customization: string;
      selectionCount: number;
    }>;
    conversionByItem: Array<{
      itemId: string;
      itemName: string;
      conversionRate: number;
    }>;
  };
}

/**
 * Generate analytics report from collected data
 * This would typically query a database or analytics service
 */
export async function generateAnalyticsReport(
  startDate: Date,
  endDate: Date
): Promise<AnalyticsReport> {
  // In a real implementation, this would query your analytics database
  // For now, we'll return a mock report structure

  const mockReport: AnalyticsReport = {
    summary: {
      totalPageViews: 0,
      totalCustomizations: 0,
      totalCartConversions: 0,
      averageEngagementTime: 0,
      averageScrollDepth: 0,
      conversionRate: 0,
    },
    pagePerformance: {
      averageLoadTime: 0,
      averageLCP: 0,
      averageFID: 0,
      averageCLS: 0,
    },
    userBehavior: {
      topExitPoints: [],
      engagementPatterns: [],
      deviceBreakdown: {},
    },
    itemInsights: {
      mostCustomizedItems: [],
      popularCustomizations: [],
      conversionByItem: [],
    },
  };

  return mockReport;
}

/**
 * Export analytics data to CSV format
 */
export function exportAnalyticsToCSV(
  data: Record<string, any>[],
  filename: string
): void {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers
        .map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          if (
            typeof value === 'string' &&
            (value.includes(',') || value.includes('"'))
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Calculate conversion funnel metrics
 */
export interface FunnelMetrics {
  pageViews: number;
  itemViews: number;
  customizationStarts: number;
  cartAdds: number;
  conversionRate: number;
  dropoffPoints: Array<{ step: string; dropoffRate: number }>;
}

export function calculateConversionFunnel(
  events: Record<string, any>[]
): FunnelMetrics {
  const pageViews = events.filter(e => e.event === 'page_view').length;
  const itemViews = events.filter(
    e =>
      e.event === 'page_view' &&
      (e.custom_parameters?.content_group2 === 'item_detail' ||
        e.custom_parameters?.content_group2 === 'package_detail')
  ).length;
  const customizationStarts = events.filter(
    e => e.event === 'customization_selection'
  ).length;
  const cartAdds = events.filter(e => e.event === 'add_to_cart').length;

  const conversionRate = pageViews > 0 ? (cartAdds / pageViews) * 100 : 0;

  const dropoffPoints = [
    {
      step: 'Page View → Item View',
      dropoffRate:
        pageViews > 0 ? ((pageViews - itemViews) / pageViews) * 100 : 0,
    },
    {
      step: 'Item View → Customization',
      dropoffRate:
        itemViews > 0
          ? ((itemViews - customizationStarts) / itemViews) * 100
          : 0,
    },
    {
      step: 'Customization → Cart Add',
      dropoffRate:
        customizationStarts > 0
          ? ((customizationStarts - cartAdds) / customizationStarts) * 100
          : 0,
    },
  ];

  return {
    pageViews,
    itemViews,
    customizationStarts,
    cartAdds,
    conversionRate,
    dropoffPoints,
  };
}

/**
 * Analyze user engagement patterns
 */
export interface EngagementAnalysis {
  averageTimeOnPage: number;
  averageScrollDepth: number;
  bounceRate: number;
  engagementScore: number;
  topEngagementPages: Array<{ page: string; score: number }>;
}

export function analyzeUserEngagement(
  events: Record<string, any>[]
): EngagementAnalysis {
  const engagementEvents = events.filter(e => e.event.includes('engagement'));
  const exitEvents = events.filter(e => e.event.includes('exit_point'));

  const timeOnPageValues = engagementEvents
    .map(e => e.custom_parameters?.engagement_time)
    .filter(time => typeof time === 'number');

  const scrollDepthValues = engagementEvents
    .map(e => e.custom_parameters?.scroll_depth)
    .filter(depth => typeof depth === 'number');

  const averageTimeOnPage =
    timeOnPageValues.length > 0
      ? timeOnPageValues.reduce((sum, time) => sum + time, 0) /
        timeOnPageValues.length
      : 0;

  const averageScrollDepth =
    scrollDepthValues.length > 0
      ? scrollDepthValues.reduce((sum, depth) => sum + depth, 0) /
        scrollDepthValues.length
      : 0;

  const bounceRate =
    exitEvents.length > 0
      ? (exitEvents.filter(e => e.custom_parameters?.engagement_time < 10000)
          .length /
          exitEvents.length) *
        100
      : 0;

  const engagementScore = Math.min(
    100,
    Math.round(
      averageScrollDepth * 0.4 +
        Math.min(averageTimeOnPage / 1000 / 60, 5) * 20 * 0.4 + // Max 5 minutes
        (100 - bounceRate) * 0.2
    )
  );

  // Group by page and calculate engagement scores
  const pageEngagement = new Map<
    string,
    { totalScore: number; count: number }
  >();
  engagementEvents.forEach(event => {
    const page = event.custom_parameters?.page_path || 'unknown';
    const score = Math.min(
      100,
      Math.round(
        (event.custom_parameters?.scroll_depth || 0) * 0.4 +
          Math.min(
            (event.custom_parameters?.engagement_time || 0) / 1000 / 60,
            5
          ) *
            20 *
            0.6
      )
    );

    if (!pageEngagement.has(page)) {
      pageEngagement.set(page, { totalScore: 0, count: 0 });
    }
    const current = pageEngagement.get(page)!;
    current.totalScore += score;
    current.count += 1;
  });

  const topEngagementPages = Array.from(pageEngagement.entries())
    .map(([page, data]) => ({
      page,
      score: Math.round(data.totalScore / data.count),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return {
    averageTimeOnPage,
    averageScrollDepth,
    bounceRate,
    engagementScore,
    topEngagementPages,
  };
}

/**
 * Generate performance insights
 */
export interface PerformanceInsights {
  coreWebVitals: {
    lcp: { value: number; rating: 'good' | 'needs-improvement' | 'poor' };
    fid: { value: number; rating: 'good' | 'needs-improvement' | 'poor' };
    cls: { value: number; rating: 'good' | 'needs-improvement' | 'poor' };
  };
  loadingPerformance: {
    averageLoadTime: number;
    slowestPages: Array<{ page: string; loadTime: number }>;
  };
  recommendations: string[];
}

export function generatePerformanceInsights(
  events: Record<string, any>[]
): PerformanceInsights {
  const performanceEvents = events.filter(e => e.event.includes('performance'));

  // Extract Core Web Vitals
  const lcpValues = performanceEvents
    .filter(e => e.custom_parameters?.performance_metric === 'LCP')
    .map(e => e.custom_parameters?.performance_value)
    .filter(v => typeof v === 'number');

  const fidValues = performanceEvents
    .filter(e => e.custom_parameters?.performance_metric === 'FID')
    .map(e => e.custom_parameters?.performance_value)
    .filter(v => typeof v === 'number');

  const clsValues = performanceEvents
    .filter(e => e.custom_parameters?.performance_metric === 'CLS')
    .map(e => e.custom_parameters?.performance_value)
    .filter(v => typeof v === 'number');

  const avgLCP =
    lcpValues.length > 0
      ? lcpValues.reduce((sum, val) => sum + val, 0) / lcpValues.length
      : 0;
  const avgFID =
    fidValues.length > 0
      ? fidValues.reduce((sum, val) => sum + val, 0) / fidValues.length
      : 0;
  const avgCLS =
    clsValues.length > 0
      ? clsValues.reduce((sum, val) => sum + val, 0) / clsValues.length
      : 0;

  // Rate Core Web Vitals
  const rateLCP = (value: number) =>
    value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
  const rateFID = (value: number) =>
    value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor';
  const rateCLS = (value: number) =>
    value <= 100 ? 'good' : value <= 250 ? 'needs-improvement' : 'poor'; // CLS * 1000

  const recommendations: string[] = [];
  if (rateLCP(avgLCP) !== 'good') {
    recommendations.push(
      'Optimize Largest Contentful Paint by improving server response times and optimizing images'
    );
  }
  if (rateFID(avgFID) !== 'good') {
    recommendations.push(
      'Reduce First Input Delay by minimizing JavaScript execution time'
    );
  }
  if (rateCLS(avgCLS) !== 'good') {
    recommendations.push(
      'Improve Cumulative Layout Shift by setting dimensions for images and avoiding dynamic content insertion'
    );
  }

  return {
    coreWebVitals: {
      lcp: {
        value: avgLCP,
        rating: rateLCP(avgLCP) as 'good' | 'needs-improvement' | 'poor',
      },
      fid: {
        value: avgFID,
        rating: rateFID(avgFID) as 'good' | 'needs-improvement' | 'poor',
      },
      cls: {
        value: avgCLS,
        rating: rateCLS(avgCLS) as 'good' | 'needs-improvement' | 'poor',
      },
    },
    loadingPerformance: {
      averageLoadTime: 0, // Would be calculated from load_complete metrics
      slowestPages: [], // Would be calculated from page-specific performance data
    },
    recommendations,
  };
}
