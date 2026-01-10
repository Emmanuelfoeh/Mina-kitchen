import { NextRequest, NextResponse } from 'next/server';

/**
 * Analytics API endpoint for collecting custom analytics events
 * This endpoint receives analytics events from the client and can process them
 * for custom analytics, logging, or forwarding to other services
 */

interface AnalyticsEventPayload {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
  timestamp: number;
  session_id: string;
  user_agent: string;
  page_url: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse the analytics event payload
    const payload: AnalyticsEventPayload = await request.json();

    // Validate required fields
    if (!payload.event || !payload.category || !payload.action) {
      return NextResponse.json(
        { error: 'Missing required fields: event, category, action' },
        { status: 400 }
      );
    }

    // Get client IP and user agent for additional context
    const clientIP =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Enrich the payload with server-side data
    const enrichedPayload = {
      ...payload,
      server_timestamp: Date.now(),
      client_ip: clientIP,
      server_user_agent: userAgent,
      referer: request.headers.get('referer'),
      origin: request.headers.get('origin'),
    };

    // Log analytics event (in production, you might want to use a proper logging service)
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', JSON.stringify(enrichedPayload, null, 2));
    }

    // Process the analytics event
    await processAnalyticsEvent(enrichedPayload);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to process analytics event' },
      { status: 500 }
    );
  }
}

/**
 * Process analytics event - customize this based on your needs
 */
async function processAnalyticsEvent(payload: any) {
  // Here you can:
  // 1. Store events in a database
  // 2. Forward to external analytics services
  // 3. Trigger real-time analytics processing
  // 4. Generate alerts based on certain events

  try {
    // Example: Store in database (uncomment if you have analytics table)
    // await db.analyticsEvent.create({
    //   data: {
    //     event: payload.event,
    //     category: payload.category,
    //     action: payload.action,
    //     label: payload.label,
    //     value: payload.value,
    //     customParameters: payload.custom_parameters,
    //     sessionId: payload.session_id,
    //     userAgent: payload.user_agent,
    //     pageUrl: payload.page_url,
    //     clientIp: payload.client_ip,
    //     timestamp: new Date(payload.timestamp),
    //   },
    // });

    // Example: Forward to external analytics service
    if (process.env.ANALYTICS_WEBHOOK_URL) {
      await fetch(process.env.ANALYTICS_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.ANALYTICS_WEBHOOK_TOKEN}`,
        },
        body: JSON.stringify(payload),
      });
    }

    // Example: Process specific event types
    switch (payload.event) {
      case 'add_to_cart':
        await handleCartConversion(payload);
        break;
      case 'customization_selection':
        await handleCustomizationTracking(payload);
        break;
      case 'page_view':
        await handlePageView(payload);
        break;
      case 'user_engagement':
      case 'user_exit_point':
      case 'user_performance':
        await handleUserBehavior(payload);
        break;
    }
  } catch (error) {
    console.error('Error processing analytics event:', error);
    // Don't throw error to avoid failing the API response
  }
}

/**
 * Handle cart conversion events
 */
async function handleCartConversion(payload: any) {
  // Track conversion metrics
  const conversionData = {
    itemId: payload.custom_parameters?.item_id,
    itemName: payload.custom_parameters?.item_name,
    itemCategory: payload.custom_parameters?.item_category,
    quantity: payload.custom_parameters?.quantity,
    totalPrice: payload.custom_parameters?.total_price,
    customizationsCount: payload.custom_parameters?.customizations_count,
    conversionSource: payload.custom_parameters?.conversion_source,
    timestamp: payload.timestamp,
  };

  // Log conversion for business intelligence
  console.log('Cart Conversion:', conversionData);

  // You could store this in a conversions table or send to a BI system
}

/**
 * Handle customization tracking events
 */
async function handleCustomizationTracking(payload: any) {
  // Track popular customizations
  const customizationData = {
    itemId: payload.custom_parameters?.item_id,
    itemName: payload.custom_parameters?.item_name,
    customizationType: payload.custom_parameters?.customization_type,
    customizationName: payload.custom_parameters?.customization_name,
    selectedOption: payload.custom_parameters?.selected_option,
    priceModifier: payload.custom_parameters?.price_modifier,
    timestamp: payload.timestamp,
  };

  // Log customization for menu optimization
  console.log('Customization Selection:', customizationData);

  // You could use this data to optimize menu options and pricing
}

/**
 * Handle page view events
 */
async function handlePageView(payload: any) {
  // Track page popularity and user journeys
  const pageViewData = {
    pagePath: payload.custom_parameters?.page_path,
    pageTitle: payload.custom_parameters?.page_title,
    contentGroup1: payload.custom_parameters?.content_group1,
    contentGroup2: payload.custom_parameters?.content_group2,
    sessionId: payload.session_id,
    timestamp: payload.timestamp,
  };

  // Log page view for content optimization
  console.log('Page View:', pageViewData);

  // You could use this data to understand user navigation patterns
}

/**
 * Handle user behavior events
 */
async function handleUserBehavior(payload: any) {
  // Track user engagement patterns
  const behaviorData = {
    eventType:
      payload.custom_parameters?.event_type ||
      payload.event.replace('user_', ''),
    pagePath: payload.custom_parameters?.page_path,
    engagementTime: payload.custom_parameters?.engagement_time,
    scrollDepth: payload.custom_parameters?.scroll_depth,
    exitElement: payload.custom_parameters?.exit_element,
    performanceMetric: payload.custom_parameters?.performance_metric,
    performanceValue: payload.custom_parameters?.performance_value,
    sessionId: payload.session_id,
    timestamp: payload.timestamp,
  };

  // Log behavior for UX optimization
  console.log('User Behavior:', behaviorData);

  // You could use this data to improve user experience and performance
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
