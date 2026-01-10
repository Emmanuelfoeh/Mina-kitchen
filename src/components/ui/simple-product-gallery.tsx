'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SimpleProductGalleryProps {
  images: string[];
  alt: string;
  className?: string;
}

export function SimpleProductGallery({
  images,
  alt,
  className = '',
}: SimpleProductGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Fallback image for failed loads
  const fallbackImage = '/placeholder-food.svg';

  // Ensure we have at least one image (fallback if empty)
  const displayImages = images.length > 0 ? images : [fallbackImage];

  const navigatePrevious = () => {
    const newIndex =
      selectedImageIndex > 0
        ? selectedImageIndex - 1
        : displayImages.length - 1;
    setSelectedImageIndex(newIndex);
  };

  const navigateNext = () => {
    const newIndex =
      selectedImageIndex < displayImages.length - 1
        ? selectedImageIndex + 1
        : 0;
    setSelectedImageIndex(newIndex);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={displayImages[selectedImageIndex]}
          alt={`${alt} - Image ${selectedImageIndex + 1} of ${displayImages.length}`}
          fill
          className="object-cover"
          priority={selectedImageIndex === 0}
          onError={e => {
            console.error(
              'Image failed to load:',
              displayImages[selectedImageIndex]
            );
            // Try to set fallback image
            const target = e.target as HTMLImageElement;
            if (target.src !== fallbackImage) {
              target.src = fallbackImage;
            }
          }}
          onLoad={() => {
            console.log(
              'Image loaded successfully:',
              displayImages[selectedImageIndex]
            );
          }}
        />

        {/* Navigation Arrows - Only show if multiple images */}
        {displayImages.length > 1 && (
          <>
            <Button
              onClick={navigatePrevious}
              className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70"
              size="sm"
              variant="ghost"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              onClick={navigateNext}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70"
              size="sm"
              variant="ghost"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        {displayImages.length > 1 && (
          <div className="absolute right-2 bottom-2 rounded-full bg-black/50 px-2 py-1 text-xs text-white">
            {selectedImageIndex + 1} / {displayImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail Navigation - Only show if multiple images */}
      {displayImages.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {displayImages.map((image, index) => {
            const isSelected = selectedImageIndex === index;

            return (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-green-600 ring-2 ring-green-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Image
                  src={image}
                  alt={`${alt} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  onError={e => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== fallbackImage) {
                      target.src = fallbackImage;
                    }
                  }}
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
