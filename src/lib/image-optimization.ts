// Image optimization utilities for better performance

interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  width?: number;
  height?: number;
  blur?: boolean;
  priority?: boolean;
}

interface ResponsiveImageConfig {
  breakpoints: { [key: string]: number };
  sizes: string;
  quality: number;
}

// Default responsive image configuration
export const defaultImageConfig: ResponsiveImageConfig = {
  breakpoints: {
    mobile: 640,
    tablet: 768,
    desktop: 1024,
    large: 1280,
  },
  sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  quality: 85,
};

// Image optimization utility class
export class ImageOptimizer {
  private static instance: ImageOptimizer;
  private cache: Map<string, string> = new Map();

  static getInstance(): ImageOptimizer {
    if (!ImageOptimizer.instance) {
      ImageOptimizer.instance = new ImageOptimizer();
    }
    return ImageOptimizer.instance;
  }

  // Generate optimized image URL
  generateOptimizedUrl(
    src: string,
    options: ImageOptimizationOptions = {}
  ): string {
    const {
      quality = 85,
      format = 'webp',
      width,
      height,
      blur = false,
    } = options;

    // For Next.js Image component, return original src
    // The optimization happens automatically
    if (src.startsWith('/') || src.startsWith('http')) {
      return src;
    }

    // For external images, you might want to use a service like Cloudinary
    // This is a placeholder for such integration
    const cacheKey = `${src}-${quality}-${format}-${width}-${height}-${blur}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // In a real implementation, you'd integrate with an image optimization service
    const optimizedUrl = src; // Placeholder
    this.cache.set(cacheKey, optimizedUrl);

    return optimizedUrl;
  }

  // Generate responsive image sizes
  generateResponsiveSizes(config: Partial<ResponsiveImageConfig> = {}): string {
    const { breakpoints, sizes } = { ...defaultImageConfig, ...config };

    if (sizes) {
      return sizes;
    }

    // Generate sizes string from breakpoints
    const sizeEntries = Object.entries(breakpoints)
      .sort(([, a], [, b]) => a - b)
      .map(([name, width], index, array) => {
        if (index === array.length - 1) {
          return `${width}px`;
        }
        return `(max-width: ${width}px) ${width}px`;
      });

    return sizeEntries.join(', ');
  }

  // Generate srcSet for responsive images
  generateSrcSet(
    src: string,
    widths: number[] = [640, 768, 1024, 1280, 1920]
  ): string {
    return widths
      .map(width => {
        const optimizedSrc = this.generateOptimizedUrl(src, { width });
        return `${optimizedSrc} ${width}w`;
      })
      .join(', ');
  }

  // Preload critical images
  preloadImage(
    src: string,
    options: ImageOptimizationOptions = {}
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));

      // Set optimized source
      img.src = this.generateOptimizedUrl(src, options);

      // Add to document head for preloading
      if (typeof document !== 'undefined' && options.priority) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = img.src;
        document.head.appendChild(link);
      }
    });
  }

  // Lazy load images with intersection observer
  lazyLoadImage(
    element: HTMLImageElement,
    src: string,
    options: ImageOptimizationOptions = {}
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
          entries => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                const optimizedSrc = this.generateOptimizedUrl(src, options);
                element.src = optimizedSrc;

                element.onload = () => {
                  observer.disconnect();
                  resolve();
                };

                element.onerror = () => {
                  observer.disconnect();
                  reject(new Error(`Failed to load image: ${src}`));
                };
              }
            });
          },
          {
            threshold: 0.1,
            rootMargin: '50px', // Start loading 50px before entering viewport
          }
        );

        observer.observe(element);
      } else {
        // Fallback for browsers without IntersectionObserver
        const optimizedSrc = this.generateOptimizedUrl(src, options);
        element.src = optimizedSrc;
        element.onload = () => resolve();
        element.onerror = () =>
          reject(new Error(`Failed to load image: ${src}`));
      }
    });
  }

  // Generate blur placeholder
  generateBlurPlaceholder(width: number = 10, height: number = 10): string {
    return `data:image/svg+xml;base64,${Buffer.from(
      `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <rect width="100%" height="100%" fill="url(#gradient)" opacity="0.3"/>
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#e5e7eb;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#d1d5db;stop-opacity:1" />
          </linearGradient>
        </defs>
      </svg>`
    ).toString('base64')}`;
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }
}

// Singleton instance
export const imageOptimizer = ImageOptimizer.getInstance();

// Utility functions for common use cases
export const imageUtils = {
  // Get optimized image props for Next.js Image component
  getImageProps(
    src: string,
    alt: string,
    options: ImageOptimizationOptions & {
      sizes?: string;
      className?: string;
      fill?: boolean;
    } = {}
  ) {
    const {
      quality = 85,
      width,
      height,
      priority = false,
      sizes,
      className = '',
      fill = false,
      blur = false,
    } = options;

    const props: any = {
      src,
      alt,
      quality,
      className,
      priority,
    };

    if (fill) {
      props.fill = true;
    } else if (width && height) {
      props.width = width;
      props.height = height;
    }

    if (sizes) {
      props.sizes = sizes;
    }

    if (blur) {
      props.placeholder = 'blur';
      props.blurDataURL = imageOptimizer.generateBlurPlaceholder();
    }

    return props;
  },

  // Get responsive image sizes for different use cases
  getResponsiveSizes: {
    hero: '100vw',
    card: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    thumbnail: '(max-width: 640px) 64px, 80px',
    gallery: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw',
    avatar: '(max-width: 640px) 32px, 40px',
  },

  // Preload critical images
  preloadCriticalImages(images: string[]): Promise<void> {
    return Promise.allSettled(
      images.map(src => imageOptimizer.preloadImage(src, { priority: true }))
    ).then(() => undefined);
  },

  // Check if image format is supported
  supportsFormat(format: 'webp' | 'avif'): boolean {
    if (typeof window === 'undefined') return true; // Assume support on server

    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;

    try {
      return (
        canvas.toDataURL(`image/${format}`).indexOf(`data:image/${format}`) ===
        0
      );
    } catch {
      return false;
    }
  },

  // Get optimal image format based on browser support
  getOptimalFormat(): 'avif' | 'webp' | 'jpeg' {
    if (this.supportsFormat('avif')) return 'avif';
    if (this.supportsFormat('webp')) return 'webp';
    return 'jpeg';
  },

  // Calculate image dimensions maintaining aspect ratio
  calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight?: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;

    if (!maxHeight) {
      return {
        width: maxWidth,
        height: Math.round(maxWidth / aspectRatio),
      };
    }

    const widthFromHeight = maxHeight * aspectRatio;
    const heightFromWidth = maxWidth / aspectRatio;

    if (widthFromHeight <= maxWidth) {
      return {
        width: Math.round(widthFromHeight),
        height: maxHeight,
      };
    } else {
      return {
        width: maxWidth,
        height: Math.round(heightFromWidth),
      };
    }
  },
};

// Performance monitoring for images
export const imagePerformance = {
  // Track image load times
  trackImageLoad(src: string, loadTime: number, size?: number): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `Image loaded: ${src} in ${loadTime}ms${size ? ` (${size} bytes)` : ''}`
      );
    }

    // Send to analytics in production
    if (
      process.env.NODE_ENV === 'production' &&
      typeof window !== 'undefined'
    ) {
      // Example: Send to Google Analytics
      // gtag('event', 'image_load', {
      //   image_src: src,
      //   load_time: loadTime,
      //   image_size: size,
      // });
    }
  },

  // Monitor Largest Contentful Paint for images
  monitorLCP(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;

        if (lastEntry.element && lastEntry.element.tagName === 'IMG') {
          console.log(
            `LCP Image: ${lastEntry.element.src} at ${lastEntry.startTime}ms`
          );
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  },
};
