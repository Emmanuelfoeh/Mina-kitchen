import React from 'react';
import type { NutritionalInfo } from '@/types';

interface ProductInformationProps {
  name: string;
  price: number;
  originalPrice?: number;
  savings?: number;
  description: string;
  tags?: string[];
  nutritionalInfo?: NutritionalInfo;
  chefNotes?: string;
  className?: string;
}

export function ProductInformation({
  name,
  price,
  originalPrice,
  savings,
  description,
  tags = [],
  nutritionalInfo,
  chefNotes,
  className = '',
}: ProductInformationProps) {
  return (
    <div
      className={`space-y-6 ${className}`}
      role="region"
      aria-label="Product information"
    >
      {/* Title and Price */}
      <div>
        <h1
          className="mb-2 text-3xl font-bold text-gray-900"
          id="product-title"
        >
          {name}
        </h1>
        <div
          className="flex items-center space-x-4"
          role="group"
          aria-labelledby="product-title"
        >
          <p
            className="text-2xl font-bold text-green-600"
            aria-label={`Current price: ${price.toFixed(2)} dollars`}
          >
            ${price.toFixed(2)}
          </p>
          {originalPrice && savings && savings > 0 && (
            <div className="text-sm" role="group" aria-label="Pricing details">
              <p
                className="text-gray-500 line-through"
                aria-label={`Original price: ${originalPrice.toFixed(2)} dollars`}
              >
                ${originalPrice.toFixed(2)}
              </p>
              <p
                className="font-medium text-green-600"
                aria-label={`You save: ${savings.toFixed(2)} dollars`}
              >
                Save ${savings.toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <h2 className="mb-2 text-lg font-semibold" id="description-heading">
          Description
        </h2>
        <p className="text-gray-700" aria-labelledby="description-heading">
          {description}
        </p>
      </div>

      {/* Chef's Notes */}
      {chefNotes && (
        <div>
          <h3 className="mb-2 text-lg font-semibold" id="chef-notes-heading">
            Chef's Notes
          </h3>
          <p
            className="text-gray-700 italic"
            aria-labelledby="chef-notes-heading"
            role="note"
          >
            {chefNotes}
          </p>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div>
          <h3
            className="mb-2 text-sm font-medium text-gray-900"
            id="tags-heading"
          >
            Tags
          </h3>
          <div
            className="flex flex-wrap gap-2"
            role="list"
            aria-labelledby="tags-heading"
            aria-label={`Product tags: ${tags.join(', ')}`}
          >
            {tags.map(tag => (
              <span
                key={tag}
                className="rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-700"
                role="listitem"
                aria-label={`Tag: ${tag}`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Nutritional Information */}
      {nutritionalInfo && (
        <div>
          <h3 className="mb-3 text-lg font-semibold" id="nutrition-heading">
            Nutritional Information
          </h3>
          <div
            className="grid grid-cols-2 gap-4 text-sm"
            role="table"
            aria-labelledby="nutrition-heading"
            aria-label="Nutritional information per serving"
          >
            <div className="flex justify-between" role="row">
              <span role="rowheader">Calories:</span>
              <span
                className="font-medium"
                role="cell"
                aria-label={`${nutritionalInfo.calories} calories`}
              >
                {nutritionalInfo.calories}
              </span>
            </div>
            <div className="flex justify-between" role="row">
              <span role="rowheader">Protein:</span>
              <span
                className="font-medium"
                role="cell"
                aria-label={`${nutritionalInfo.protein} grams of protein`}
              >
                {nutritionalInfo.protein}g
              </span>
            </div>
            <div className="flex justify-between" role="row">
              <span role="rowheader">Carbs:</span>
              <span
                className="font-medium"
                role="cell"
                aria-label={`${nutritionalInfo.carbs} grams of carbohydrates`}
              >
                {nutritionalInfo.carbs}g
              </span>
            </div>
            <div className="flex justify-between" role="row">
              <span role="rowheader">Fat:</span>
              <span
                className="font-medium"
                role="cell"
                aria-label={`${nutritionalInfo.fat} grams of fat`}
              >
                {nutritionalInfo.fat}g
              </span>
            </div>
            {nutritionalInfo.fiber && (
              <div className="flex justify-between" role="row">
                <span role="rowheader">Fiber:</span>
                <span
                  className="font-medium"
                  role="cell"
                  aria-label={`${nutritionalInfo.fiber} grams of fiber`}
                >
                  {nutritionalInfo.fiber}g
                </span>
              </div>
            )}
            {nutritionalInfo.sodium && (
              <div className="flex justify-between" role="row">
                <span role="rowheader">Sodium:</span>
                <span
                  className="font-medium"
                  role="cell"
                  aria-label={`${nutritionalInfo.sodium} milligrams of sodium`}
                >
                  {nutritionalInfo.sodium}mg
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
