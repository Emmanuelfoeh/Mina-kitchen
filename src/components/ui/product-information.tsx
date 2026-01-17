import React from 'react';

interface ProductInformationProps {
  name: string;
  price: number;
  originalPrice?: number;
  savings?: number;
  description: string;
  tags?: string[];
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
    </div>
  );
}
