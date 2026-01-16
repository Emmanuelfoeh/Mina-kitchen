import { ImageProps } from 'next/image';

/**
 * Image optimization utilities for the food ordering platform
 */

// Predefined image sizes for different use cases
export const IMAGE_SIZES = {
  // Menu item images
  menuCard: { width: 400, height: 300 },
  menuCardSmall: { width: 200, height: 150 },
  menuHero: { width: 800, height: 600 },

  // Package images
  packageCard: { width: 500, height: 400 },
  packageHero: { width: 1000, height: 600 },

  // Profile and user images
  avatar: { width: 100, height: 100 },
  avatarLarge: { width: 200, height: 200 },

  // Gallery images
  gallery: { width: 600, height: 400 },
  galleryThumb: { width: 150, height: 100 },

  // Hero and banner images
  hero: { width: 1920, height: 1080 },
  banner: { width: 1200, height: 400 },
} as const;

// Image quality settings for different contexts
export const IMAGE_QUALITY = {
  low: 60, // For thumbnails and previews
  medium: 75, // For general use
  high: 85, // For hero images and important visuals
  lossless: 95, // For critical images where quality is paramount
} as const;

// Responsive image breakpoints
export const RESPONSIVE_BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
} as const;

/**
 * Generate optimized image props for Next.js Image component
 */
export function getOptimizedImageProps(
  src: string,
  alt: string,
  size: keyof typeof IMAGE_SIZES,
  options: {
    quality?: keyof typeof IMAGE_QUALITY;
    priority?: boolean;
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    className?: string;
    fill?: boolean;
  } = {}
): Partial<ImageProps> {
  const { width, height } = IMAGE_SIZES[size];
  const quality = IMAGE_QUALITY[options.quality || 'medium'];

  const baseProps: Partial<ImageProps> = {
    src,
    alt,
    quality,
    priority: options.priority || false,
    placeholder: options.placeholder || 'empty',
    className: options.className,
  };

  if (options.fill) {
    return {
      ...baseProps,
      fill: true,
      sizes: generateResponsiveSizes(size),
    };
  }

  return {
    ...baseProps,
    width,
    height,
    sizes: generateResponsiveSizes(size),
  };
}

/**
 * Generate responsive sizes string for different image types
 */
function generateResponsiveSizes(size: keyof typeof IMAGE_SIZES): string {
  const { width } = IMAGE_SIZES[size];

  // Generate responsive sizes based on image width and common breakpoints
  if (width <= 200) {
    return '(max-width: 640px) 100px, (max-width: 768px) 150px, 200px';
  } else if (width <= 400) {
    return '(max-width: 640px) 200px, (max-width: 768px) 300px, 400px';
  } else if (width <= 600) {
    return '(max-width: 640px) 300px, (max-width: 768px) 450px, 600px';
  } else if (width <= 800) {
    return '(max-width: 640px) 400px, (max-width: 768px) 600px, 800px';
  } else if (width <= 1200) {
    return '(max-width: 640px) 500px, (max-width: 768px) 700px, (max-width: 1024px) 900px, 1200px';
  } else {
    return '(max-width: 640px) 600px, (max-width: 768px) 800px, (max-width: 1024px) 1000px, 1920px';
  }
}

/**
 * Generate blur placeholder for images
 */
export function generateBlurDataURL(
  width: number = 10,
  height: number = 10
): string {
  // Create a simple blur placeholder using data URL
  const canvas = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
    </svg>
  `;

  return `data:image/svg+xml;base64,${Buffer.from(canvas).toString('base64')}`;
}

/**
 * Lazy loading configuration for different image types
 */
export const LAZY_LOADING_CONFIG = {
  // Images above the fold should have priority
  hero: { priority: true, placeholder: 'blur' as const },
  menuCard: { priority: false, placeholder: 'blur' as const },
  packageCard: { priority: false, placeholder: 'blur' as const },
  gallery: { priority: false, placeholder: 'blur' as const },
  avatar: { priority: false, placeholder: 'empty' as const },
} as const;

/**
 * Image format preferences based on browser support
 */
export function getPreferredImageFormat(): 'avif' | 'webp' | 'jpg' {
  if (typeof window === 'undefined') return 'webp'; // Server-side default

  // Check for AVIF support
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  try {
    const avifSupported =
      canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
    if (avifSupported) return 'avif';
  } catch (e) {
    // AVIF not supported
  }

  try {
    const webpSupported =
      canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    if (webpSupported) return 'webp';
  } catch (e) {
    // WebP not supported
  }

  return 'jpg';
}

/**
 * Preload critical images for better performance
 */
export function preloadCriticalImages(images: string[]): void {
  if (typeof window === 'undefined') return;

  images.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
}

/**
 * Image loading performance monitoring
 */
export class ImagePerformanceMonitor {
  private static loadTimes = new Map<string, number>();

  static startLoad(src: string): void {
    this.loadTimes.set(src, performance.now());
  }

  static endLoad(src: string): number | null {
    const startTime = this.loadTimes.get(src);
    if (!startTime) return null;

    const loadTime = performance.now() - startTime;
    this.loadTimes.delete(src);

    // Log slow loading images (> 2 seconds)
    if (loadTime > 2000) {
      console.warn(
        `Slow image load detected: ${src} took ${loadTime.toFixed(2)}ms`
      );
    }

    return loadTime;
  }

  static getAverageLoadTime(): number {
    const times = Array.from(this.loadTimes.values());
    return times.length > 0
      ? times.reduce((a, b) => a + b, 0) / times.length
      : 0;
  }
}

/**
 * Optimized Image component wrapper with performance monitoring
 */
export interface OptimizedImageProps {
  src: string;
  alt: string;
  size: keyof typeof IMAGE_SIZES;
  quality?: keyof typeof IMAGE_QUALITY;
  priority?: boolean;
  className?: string;
  fill?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Get image optimization recommendations based on usage
 */
export function getImageOptimizationRecommendations(
  imageType: 'menu' | 'package' | 'hero' | 'gallery' | 'avatar',
  context: 'card' | 'detail' | 'thumbnail' | 'banner'
): {
  size: keyof typeof IMAGE_SIZES;
  quality: keyof typeof IMAGE_QUALITY;
  priority: boolean;
  placeholder: 'blur' | 'empty';
} {
  const recommendations = {
    menu: {
      card: {
        size: 'menuCard' as const,
        quality: 'medium' as const,
        priority: false,
        placeholder: 'blur' as const,
      },
      detail: {
        size: 'menuHero' as const,
        quality: 'high' as const,
        priority: true,
        placeholder: 'blur' as const,
      },
      thumbnail: {
        size: 'menuCardSmall' as const,
        quality: 'low' as const,
        priority: false,
        placeholder: 'empty' as const,
      },
      banner: {
        size: 'banner' as const,
        quality: 'high' as const,
        priority: true,
        placeholder: 'blur' as const,
      },
    },
    package: {
      card: {
        size: 'packageCard' as const,
        quality: 'medium' as const,
        priority: false,
        placeholder: 'blur' as const,
      },
      detail: {
        size: 'packageHero' as const,
        quality: 'high' as const,
        priority: true,
        placeholder: 'blur' as const,
      },
      thumbnail: {
        size: 'menuCardSmall' as const,
        quality: 'low' as const,
        priority: false,
        placeholder: 'empty' as const,
      },
      banner: {
        size: 'banner' as const,
        quality: 'high' as const,
        priority: true,
        placeholder: 'blur' as const,
      },
    },
    hero: {
      card: {
        size: 'hero' as const,
        quality: 'high' as const,
        priority: true,
        placeholder: 'blur' as const,
      },
      detail: {
        size: 'hero' as const,
        quality: 'lossless' as const,
        priority: true,
        placeholder: 'blur' as const,
      },
      thumbnail: {
        size: 'galleryThumb' as const,
        quality: 'low' as const,
        priority: false,
        placeholder: 'empty' as const,
      },
      banner: {
        size: 'hero' as const,
        quality: 'high' as const,
        priority: true,
        placeholder: 'blur' as const,
      },
    },
    gallery: {
      card: {
        size: 'gallery' as const,
        quality: 'medium' as const,
        priority: false,
        placeholder: 'blur' as const,
      },
      detail: {
        size: 'gallery' as const,
        quality: 'high' as const,
        priority: false,
        placeholder: 'blur' as const,
      },
      thumbnail: {
        size: 'galleryThumb' as const,
        quality: 'low' as const,
        priority: false,
        placeholder: 'empty' as const,
      },
      banner: {
        size: 'banner' as const,
        quality: 'high' as const,
        priority: true,
        placeholder: 'blur' as const,
      },
    },
    avatar: {
      card: {
        size: 'avatar' as const,
        quality: 'medium' as const,
        priority: false,
        placeholder: 'empty' as const,
      },
      detail: {
        size: 'avatarLarge' as const,
        quality: 'high' as const,
        priority: false,
        placeholder: 'empty' as const,
      },
      thumbnail: {
        size: 'avatar' as const,
        quality: 'low' as const,
        priority: false,
        placeholder: 'empty' as const,
      },
      banner: {
        size: 'avatarLarge' as const,
        quality: 'medium' as const,
        priority: false,
        placeholder: 'empty' as const,
      },
    },
  };

  return recommendations[imageType][context];
}
