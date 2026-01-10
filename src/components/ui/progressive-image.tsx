'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import {
  imageUtils,
  imageOptimizer,
  imagePerformance,
} from '@/lib/image-optimization';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  fallbackSrc?: string;
  showLoadingSpinner?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export function ProgressiveImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
  quality = 85,
  sizes,
  fallbackSrc = '/placeholder-food.svg',
  showLoadingSpinner = true,
  onLoad,
  onError,
  placeholder = 'empty',
  blurDataURL,
}: ProgressiveImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset states when src changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setCurrentSrc(src);
  }, [src]);

  const handleLoad = useCallback(() => {
    const loadTime =
      performance.now() - (imageRef.current as any)?.loadStartTime || 0;
    setIsLoading(false);
    imagePerformance.trackImageLoad(currentSrc, loadTime);
    onLoad?.();
  }, [currentSrc, onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    setCurrentSrc(fallbackSrc);
    onError?.();
  }, [fallbackSrc, onError]);

  // Generate blur placeholder for better loading experience
  const generateBlurDataURL = (width: number = 10, height: number = 10) => {
    if (blurDataURL) return blurDataURL;
    return imageOptimizer.generateBlurPlaceholder(width, height);
  };

  const imageProps = {
    src: currentSrc,
    alt: hasError ? `${alt} (fallback image)` : alt,
    className: `transition-opacity duration-300 ${
      isLoading ? 'opacity-0' : 'opacity-100'
    } ${className}`,
    priority,
    quality,
    sizes,
    onLoad: handleLoad,
    onError: handleError,
    placeholder: placeholder as any,
    ...(placeholder === 'blur' && {
      blurDataURL: generateBlurDataURL(),
    }),
    ...(fill ? { fill: true } : { width: width || 400, height: height || 300 }),
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
      <Image ref={imageRef} {...imageProps} />

      {/* Error state indicator */}
      {hasError && (
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
  ...props
}: Omit<ProgressiveImageProps, 'sizes'> & {
  variant?: 'hero' | 'thumbnail' | 'card';
}) {
  return (
    <ProgressiveImage
      src={src}
      alt={alt}
      className={className}
      priority={priority}
      fallbackSrc={fallbackSrc}
      sizes={imageUtils.getResponsiveSizes.gallery}
      quality={85}
      placeholder="blur"
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
  ...props
}: Omit<ProgressiveImageProps, 'width' | 'height' | 'sizes'> & {
  size?: number;
}) {
  return (
    <ProgressiveImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={className}
      sizes={imageUtils.getResponsiveSizes.thumbnail}
      quality={60}
      showLoadingSpinner={false}
      {...props}
    />
  );
}

// Hook for preloading images
export function useImagePreloader() {
  const preloadedImages = useRef<Set<string>>(new Set());

  const preloadImage = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (preloadedImages.current.has(src)) {
        resolve();
        return;
      }

      const img = new window.Image();
      img.onload = () => {
        preloadedImages.current.add(src);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }, []);

  const preloadImages = useCallback(
    (sources: string[]): Promise<void> => {
      return Promise.allSettled(sources.map(preloadImage)).then(
        () => undefined
      );
    },
    [preloadImage]
  );

  return { preloadImage, preloadImages };
}
