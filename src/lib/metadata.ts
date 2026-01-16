import { Metadata } from 'next';

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

const defaultConfig = {
  siteName: 'Mina Kitchen - Authentic African Cuisine',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://minakitchen.ca',
  defaultImage: '/images/og-default.jpg',
  twitterHandle: '@minakitchen',
  author: 'Chef Adebayo',
  locale: 'en_CA',
};

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    image = defaultConfig.defaultImage,
    url,
    type = 'website',
    author = defaultConfig.author,
    publishedTime,
    modifiedTime,
  } = config;

  const fullTitle = title.includes(defaultConfig.siteName)
    ? title
    : `${title} | ${defaultConfig.siteName}`;

  const fullUrl = url
    ? `${defaultConfig.siteUrl}${url}`
    : defaultConfig.siteUrl;
  const fullImageUrl = image.startsWith('http')
    ? image
    : `${defaultConfig.siteUrl}${image}`;

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: author }],
    creator: author,
    publisher: defaultConfig.siteName,

    // Open Graph
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName: defaultConfig.siteName,
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: defaultConfig.locale,
      type,
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      site: defaultConfig.twitterHandle,
      creator: defaultConfig.twitterHandle,
      images: [fullImageUrl],
    },

    // Additional metadata
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Verification and other meta tags
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },

    // Structured data will be added via JSON-LD in components
  };

  // Add article-specific metadata
  if (type === 'article' && (publishedTime || modifiedTime)) {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: 'article',
      publishedTime,
      modifiedTime,
      authors: [author],
    };
  }

  return metadata;
}

// Structured Data Generators
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: 'Mina Kitchen',
    alternateName: "Chef's Kitchen",
    description:
      'Authentic West African cuisine restaurant in Toronto, Canada, specializing in traditional dishes like Jollof rice, Egusi soup, and Suya.',
    url: defaultConfig.siteUrl,
    logo: `${defaultConfig.siteUrl}/images/logo.png`,
    image: `${defaultConfig.siteUrl}/images/restaurant-hero.jpg`,
    telephone: '+1-416-555-0123',
    email: 'hello@minakitchen.ca',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Culinary Ave',
      addressLocality: 'Toronto',
      addressRegion: 'ON',
      postalCode: 'M5V 3A8',
      addressCountry: 'CA',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 43.6532,
      longitude: -79.3832,
    },
    openingHours: ['Mo-Th 11:00-22:00', 'Fr-Sa 11:00-23:00', 'Su 12:00-21:00'],
    servesCuisine: ['African', 'West African', 'Nigerian', 'Ghanaian'],
    priceRange: '$$',
    acceptsReservations: true,
    hasDeliveryService: true,
    hasTakeawayService: true,
    paymentAccepted: ['Cash', 'Credit Card', 'Debit Card'],
    currenciesAccepted: 'CAD',
    founder: {
      '@type': 'Person',
      name: 'Chef Adebayo',
      jobTitle: 'Executive Chef',
    },
    sameAs: [
      'https://www.facebook.com/minakitchen',
      'https://www.instagram.com/minakitchen',
      'https://twitter.com/minakitchen',
    ],
  };
}

export function generateMenuItemSchema(item: {
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MenuItem',
    name: item.name,
    description: item.description,
    offers: {
      '@type': 'Offer',
      price: item.price,
      priceCurrency: 'CAD',
      availability: 'https://schema.org/InStock',
    },
    image: item.image ? `${defaultConfig.siteUrl}${item.image}` : undefined,
    menuAddOn: {
      '@type': 'MenuSection',
      name: item.category,
    },
  };
}

export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${defaultConfig.siteUrl}${item.url}`,
    })),
  };
}

export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${defaultConfig.siteUrl}/#localbusiness`,
    name: 'Mina Kitchen',
    description: 'Authentic West African cuisine restaurant in Toronto, Canada',
    url: defaultConfig.siteUrl,
    telephone: '+1-416-555-0123',
    email: 'hello@minakitchen.ca',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Culinary Ave',
      addressLocality: 'Toronto',
      addressRegion: 'ON',
      postalCode: 'M5V 3A8',
      addressCountry: 'CA',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 43.6532,
      longitude: -79.3832,
    },
    openingHours: ['Mo-Th 11:00-22:00', 'Fr-Sa 11:00-23:00', 'Su 12:00-21:00'],
    servesCuisine: ['African', 'West African', 'Nigerian', 'Ghanaian'],
    priceRange: '$',
    acceptsReservations: true,
    hasDeliveryService: true,
    hasTakeawayService: true,
    paymentAccepted: ['Cash', 'Credit Card', 'Debit Card'],
    currenciesAccepted: 'CAD',
    image: `${defaultConfig.siteUrl}/images/restaurant-hero.jpg`,
    logo: `${defaultConfig.siteUrl}/images/logo.png`,
    sameAs: [
      'https://www.facebook.com/minakitchen',
      'https://www.instagram.com/minakitchen',
      'https://twitter.com/minakitchen',
    ],
  };
}

export function generateArticleSchema(article: {
  title: string;
  description: string;
  author: string;
  publishedTime: string;
  modifiedTime?: string;
  image?: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: defaultConfig.siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${defaultConfig.siteUrl}/images/logo.png`,
      },
    },
    datePublished: article.publishedTime,
    dateModified: article.modifiedTime || article.publishedTime,
    image: article.image
      ? `${defaultConfig.siteUrl}${article.image}`
      : `${defaultConfig.siteUrl}/images/og-default.jpg`,
    url: `${defaultConfig.siteUrl}${article.url}`,
  };
}

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: defaultConfig.siteName,
    url: defaultConfig.siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${defaultConfig.siteUrl}/menu?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}
