'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getOptimizedImageProps,
  generateBlurDataURL,
  ImagePerformanceMonitor,
  IMAGE_SIZES,
  IMAGE_QUALITY,
  getImageOptimizationRecommendations,
} from '@/lib/image-optimization';
import { PerformanceMonitor } from '@/lib/performance';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  quality?: keyof typeof IMAGE_QUALITY;
  sizes?: string;
  fallbackSrc?: string;
  showLoadingSpinner?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  imageType?: 'menu' | 'package' | 'hero' | 'gallery' | 'avatar';
  context?: 'card' | 'detail' | 'thumbnail' | 'banner';
  enablePerformanceMonitoring?: boolean;
}

export function ProgressiveImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
  quality = 'medium',
  sizes,
  fallbackSrc = '/placeholder-food.svg',
  showLoadingSpinner = true,
  onLoad,
  onError,
  placeholder = 'blur',
  blurDataURL,
  imageType = 'menu',
  context = 'card',
  enablePerformanceMonitoring = true,
}: ProgressiveImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imageRef = useRef<HTMLImageElement>(null);
  const loadStartTime = useRef<number>(0);

  // Get optimization recommendations based on image type and context
  const recommendations = getImageOptimizationRecommendations(
    imageType,
    context
  );

  // Reset states when src changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setCurrentSrc(src);

    if (enablePerformanceMonitoring) {
      loadStartTime.current = performance.now();
      ImagePerformanceMonitor.startLoad(src);
    }
  }, [src, enablePerformanceMonitoring]);

  const handleLoad = useCallback(() => {
    const loadTime = enablePerformanceMonitoring
      ? performance.now() - loadStartTime.current
      : 0;

    setIsLoading(false);

    if (enablePerformanceMonitoring) {
      const monitoredLoadTime = ImagePerformanceMonitor.endLoad(currentSrc);
      PerformanceMonitor.recordMetric(
        'Image_Load_Success',
        monitoredLoadTime || loadTime
      );

      // Log slow loading images
      if (loadTime > 2000) {
        console.warn(
          `Slow image load: ${currentSrc} took ${loadTime.toFixed(2)}ms`
        );
      }
    }

    onLoad?.();
  }, [currentSrc, onLoad, enablePerformanceMonitoring]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);

    if (enablePerformanceMonitoring) {
      ImagePerformanceMonitor.endLoad(currentSrc);
      PerformanceMonitor.recordMetric('Image_Load_Error', 1);
    }

    // Try fallback image
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setIsLoading(true);
      setHasError(false);
    } else {
      onError?.();
    }
  }, [currentSrc, fallbackSrc, onError, enablePerformanceMonitoring]);

  // Generate optimized image props
  const optimizedProps =
    width && height
      ? {
          src: currentSrc,
          alt: hasError ? `${alt} (fallback image)` : alt,
          width,
          height,
          quality: IMAGE_QUALITY[quality],
          priority: priority || recommendations.priority,
          placeholder: placeholder as any,
          blurDataURL:
            placeholder === 'blur'
              ? blurDataURL || generateBlurDataURL()
              : undefined,
          sizes,
          className: `transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          } ${className}`,
          onLoad: handleLoad,
          onError: handleError,
        }
      : {
          src: currentSrc,
          alt: hasError ? `${alt} (fallback image)` : alt,
          fill,
          quality: IMAGE_QUALITY[quality],
          priority: priority || recommendations.priority,
          placeholder: placeholder as any,
          blurDataURL:
            placeholder === 'blur'
              ? blurDataURL || generateBlurDataURL()
              : undefined,
          sizes,
          className: `transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          } ${className}`,
          onLoad: handleLoad,
          onError: handleError,
        };

  return (
    <div className="relative">
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 z-10">
          <Skeleton className="h-full w-full" />
          {showLoadingSpinner && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600 sm:h-12 sm:w-12 sm:border-4"></div>
            </div>
          )}
        </div>
      )}

      {/* Image */}
      <Image ref={imageRef} {...optimizedProps} />

      {/* Error state indicator */}
      {hasError && currentSrc === fallbackSrc && (
        <div className="absolute right-2 bottom-2 rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
          Fallback image
        </div>
      )}
    </div>
  );
}

// Specialized component for product images with optimized sizes
export function ProductImage({
  src,
  alt,
  className = '',
  priority = false,
  fallbackSrc = '/placeholder-food.svg',
  variant = 'card',
  ...props
}: Omit<ProgressiveImageProps, 'sizes' | 'imageType' | 'context'> & {
  variant?: 'hero' | 'thumbnail' | 'card';
}) {
  const sizeMap = {
    hero: IMAGE_SIZES.menuHero,
    card: IMAGE_SIZES.menuCard,
    thumbnail: IMAGE_SIZES.menuCardSmall,
  };

  const contextMap = {
    hero: 'banner' as const,
    card: 'card' as const,
    thumbnail: 'thumbnail' as const,
  };

  const size = sizeMap[variant];

  return (
    <ProgressiveImage
      src={src}
      alt={alt}
      width={size.width}
      height={size.height}
      className={className}
      priority={priority}
      fallbackSrc={fallbackSrc}
      quality={variant === 'hero' ? 'high' : 'medium'}
      imageType="menu"
      context={contextMap[variant]}
      {...props}
    />
  );
}

// Specialized component for package images
export function PackageImage({
  src,
  alt,
  className = '',
  priority = false,
  variant = 'card',
  ...props
}: Omit<ProgressiveImageProps, 'sizes' | 'imageType' | 'context'> & {
  variant?: 'hero' | 'card';
}) {
  const sizeMap = {
    hero: IMAGE_SIZES.packageHero,
    card: IMAGE_SIZES.packageCard,
  };

  const size = sizeMap[variant];

  return (
    <ProgressiveImage
      src={src}
      alt={alt}
      width={size.width}
      height={size.height}
      className={className}
      priority={priority}
      quality={variant === 'hero' ? 'high' : 'medium'}
      imageType="package"
      context={variant === 'hero' ? 'banner' : 'card'}
      {...props}
    />
  );
}

// Specialized component for thumbnail images
export function ThumbnailImage({
  src,
  alt,
  className = '',
  size = 80,
  imageType = 'menu',
  ...props
}: Omit<ProgressiveImageProps, 'width' | 'height' | 'sizes' | 'context'> & {
  size?: number;
  imageType?: 'menu' | 'package' | 'avatar';
}) {
  return (
    <ProgressiveImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={className}
      quality="low"
      showLoadingSpinner={false}
      imageType={imageType}
      context="thumbnail"
      {...props}
    />
  );
}

// Hook for preloading images with performance monitoring
export function useImagePreloader() {
  const preloadedImages = useRef<Set<string>>(new Set());

  const preloadImage = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (preloadedImages.current.has(src)) {
        resolve();
        return;
      }

      const startTime = performance.now();
      const img = new window.Image();

      img.onload = () => {
        const loadTime = performance.now() - startTime;
        preloadedImages.current.add(src);
        PerformanceMonitor.recordMetric('Image_Preload', loadTime);
        resolve();
      };

      img.onerror = () => {
        const loadTime = performance.now() - startTime;
        PerformanceMonitor.recordMetric('Image_Preload_Error', loadTime);
        reject(new Error(`Failed to preload image: ${src}`));
      };

      img.src = src;
    });
  }, []);

  const preloadImages = useCallback(
    (sources: string[]): Promise<void> => {
      const startTime = performance.now();
      return Promise.allSettled(sources.map(preloadImage)).then(results => {
        const loadTime = performance.now() - startTime;
        const successCount = results.filter(
          r => r.status === 'fulfilled'
        ).length;

        PerformanceMonitor.recordMetric('Batch_Image_Preload', loadTime);
        PerformanceMonitor.recordMetric(
          'Batch_Image_Success_Rate',
          (successCount / sources.length) * 100
        );
      });
    },
    [preloadImage]
  );

  return { preloadImage, preloadImages };
}
