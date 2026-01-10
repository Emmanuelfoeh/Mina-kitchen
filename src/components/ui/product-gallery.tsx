'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductGalleryProps {
  images: string[];
  alt: string;
  className?: string;
}

export function ProductGallery({
  images,
  alt,
  className = '',
}: ProductGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fallback image for failed loads
  const fallbackImage = '/placeholder-food.svg';

  // Ensure we have at least one image (fallback if empty)
  const displayImages = images.length > 0 ? images : [fallbackImage];

  // Set loading to false after component mounts
  useEffect(() => {
    setIsLoading(false);
  }, []);

  const navigateToImage = useCallback(
    (index: number) => {
      if (index >= 0 && index < displayImages.length) {
        setSelectedImageIndex(index);
      }
    },
    [displayImages.length]
  );

  const navigatePrevious = useCallback(() => {
    const newIndex =
      selectedImageIndex > 0
        ? selectedImageIndex - 1
        : displayImages.length - 1;
    navigateToImage(newIndex);
  }, [selectedImageIndex, displayImages.length, navigateToImage]);

  const navigateNext = useCallback(() => {
    const newIndex =
      selectedImageIndex < displayImages.length - 1
        ? selectedImageIndex + 1
        : 0;
    navigateToImage(newIndex);
  }, [selectedImageIndex, displayImages.length, navigateToImage]);

  if (isLoading) {
    return (
      <div className={`space-y-3 sm:space-y-4 ${className}`}>
        <div className="aspect-square animate-pulse overflow-hidden rounded-lg bg-gray-200" />
      </div>
    );
  }

  return (
    <div
      className={`space-y-3 sm:space-y-4 ${className}`}
      role="region"
      aria-label={`Product image gallery for ${alt}`}
    >
      {/* Main Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        {/* Main Image */}
        <div className="relative h-full w-full">
          <Image
            src={displayImages[selectedImageIndex]}
            alt={`${alt} - Image ${selectedImageIndex + 1} of ${displayImages.length}`}
            fill
            priority={selectedImageIndex === 0}
            className="object-cover"
            onLoad={() => {
              console.log('Image loaded:', displayImages[selectedImageIndex]);
            }}
            onError={e => {
              console.error(
                'Image failed to load:',
                displayImages[selectedImageIndex]
              );
            }}
          />
        </div>

        {/* Navigation Arrows - Only show if multiple images */}
        {displayImages.length > 1 && (
          <>
            <Button
              onClick={navigatePrevious}
              className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70 sm:left-3 md:left-4"
              aria-label="Previous image"
              size="sm"
              variant="ghost"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button
              onClick={navigateNext}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70 sm:right-3 md:right-4"
              aria-label="Next image"
              size="sm"
              variant="ghost"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        {displayImages.length > 1 && (
          <div
            className="absolute right-2 bottom-2 rounded-full bg-black/50 px-2 py-1 text-xs text-white sm:right-3 sm:bottom-3 sm:px-2.5 sm:text-sm md:right-4 md:bottom-4 md:px-3"
            aria-label={`Image ${selectedImageIndex + 1} of ${displayImages.length}`}
            role="status"
          >
            {selectedImageIndex + 1} / {displayImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail Navigation - Only show if multiple images */}
      {displayImages.length > 1 && (
        <div
          className="flex space-x-2 overflow-x-auto pb-2 sm:space-x-3"
          role="tablist"
          aria-label="Image thumbnails"
        >
          {displayImages.map((image, index) => {
            const isSelected = selectedImageIndex === index;

            return (
              <button
                key={index}
                onClick={() => navigateToImage(index)}
                className={`relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all duration-200 sm:h-16 sm:w-16 md:h-20 md:w-20 ${
                  isSelected
                    ? 'border-green-600 ring-2 ring-green-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                aria-label={`View image ${index + 1} of ${displayImages.length}`}
                aria-selected={isSelected}
                role="tab"
                tabIndex={isSelected ? 0 : -1}
              >
                <Image
                  src={image}
                  alt={`${alt} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />

                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute inset-0 bg-green-600/20" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
