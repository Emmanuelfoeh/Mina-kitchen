import type { MenuItem, Package, MenuCategory } from '@/types';

/**
 * Get related menu items based on category and tags
 * @param currentItem - The current menu item
 * @param allItems - All available menu items
 * @param maxItems - Maximum number of items to return (default: 6)
 * @returns Array of related menu items
 */
export function getRelatedMenuItems(
  currentItem: MenuItem,
  allItems: MenuItem[],
  maxItems: number = 6
): MenuItem[] {
  // Filter out the current item and inactive items
  const availableItems = allItems.filter(
    item =>
      item.id !== currentItem.id &&
      (item.status === 'active' || item.status === 'low_stock')
  );

  // If the item has explicit related item IDs, use those first
  if (currentItem.relatedItemIds && currentItem.relatedItemIds.length > 0) {
    const explicitRelated = availableItems.filter(item =>
      currentItem.relatedItemIds!.includes(item.id)
    );

    if (explicitRelated.length >= maxItems) {
      return explicitRelated.slice(0, maxItems);
    }

    // If we have some explicit related items but need more, continue with algorithm
    const remainingSlots = maxItems - explicitRelated.length;
    const algorithmicRelated = getAlgorithmicRelatedItems(
      currentItem,
      availableItems.filter(
        item => !currentItem.relatedItemIds!.includes(item.id)
      ),
      remainingSlots
    );

    return [...explicitRelated, ...algorithmicRelated];
  }

  // Use algorithmic approach
  return getAlgorithmicRelatedItems(currentItem, availableItems, maxItems);
}

/**
 * Get algorithmically determined related items
 */
function getAlgorithmicRelatedItems(
  currentItem: MenuItem,
  availableItems: MenuItem[],
  maxItems: number
): MenuItem[] {
  // Score items based on similarity
  const scoredItems = availableItems.map(item => ({
    item,
    score: calculateSimilarityScore(currentItem, item),
  }));

  // Sort by score (highest first) and return top items
  return scoredItems
    .sort((a, b) => b.score - a.score)
    .slice(0, maxItems)
    .map(scored => scored.item);
}

/**
 * Calculate similarity score between two menu items
 */
function calculateSimilarityScore(item1: MenuItem, item2: MenuItem): number {
  let score = 0;

  // Same category gets highest weight
  if (item1.category.id === item2.category.id) {
    score += 50;
  }

  // Similar price range (within 25% of each other)
  const priceDifference = Math.abs(item1.basePrice - item2.basePrice);
  const averagePrice = (item1.basePrice + item2.basePrice) / 2;
  const priceVariation = priceDifference / averagePrice;

  if (priceVariation <= 0.25) {
    score += 20;
  } else if (priceVariation <= 0.5) {
    score += 10;
  }

  // Shared tags
  const sharedTags = item1.tags.filter(tag => item2.tags.includes(tag));
  score += sharedTags.length * 5;

  // Similar preparation time (if available)
  if (item1.preparationTime && item2.preparationTime) {
    const timeDifference = Math.abs(
      item1.preparationTime - item2.preparationTime
    );
    if (timeDifference <= 10) {
      score += 10;
    } else if (timeDifference <= 20) {
      score += 5;
    }
  }

  // Complementary items (different categories that go well together)
  const complementaryPairs = [
    ['Main Dishes', 'Sides'],
    ['Main Dishes', 'Soups'],
    ['Soups', 'Sides'],
    ['Starters', 'Main Dishes'],
  ];

  const isComplementary = complementaryPairs.some(
    ([cat1, cat2]) =>
      (item1.category.name === cat1 && item2.category.name === cat2) ||
      (item1.category.name === cat2 && item2.category.name === cat1)
  );

  if (isComplementary) {
    score += 15;
  }

  return score;
}

/**
 * Get related packages for a menu item
 * @param currentItem - The current menu item
 * @param allPackages - All available packages
 * @param maxPackages - Maximum number of packages to return (default: 3)
 * @returns Array of related packages
 */
export function getRelatedPackagesForItem(
  currentItem: MenuItem,
  allPackages: Package[],
  maxPackages: number = 3
): Package[] {
  // Filter active packages that contain the current item
  const relevantPackages = allPackages.filter(
    pkg =>
      pkg.isActive &&
      pkg.includedItems.some(item => item.menuItemId === currentItem.id)
  );

  // If we have packages containing the item, return those first
  if (relevantPackages.length > 0) {
    return relevantPackages.slice(0, maxPackages);
  }

  // Otherwise, return packages from the same category
  const categoryPackages = allPackages.filter(pkg => {
    if (!pkg.isActive) return false;

    // Check if package contains items from the same category
    return pkg.includedItems.some(packageItem => {
      // This would require looking up the menu item, but for simplicity
      // we'll just return active packages
      return true;
    });
  });

  return categoryPackages.slice(0, maxPackages);
}

/**
 * Get related menu items for a package
 * @param currentPackage - The current package
 * @param allItems - All available menu items
 * @param maxItems - Maximum number of items to return (default: 6)
 * @returns Array of related menu items
 */
export function getRelatedItemsForPackage(
  currentPackage: Package,
  allItems: MenuItem[],
  maxItems: number = 6
): MenuItem[] {
  // Get items that are NOT in the current package
  const packageItemIds = currentPackage.includedItems.map(
    item => item.menuItemId
  );
  const availableItems = allItems.filter(
    item =>
      !packageItemIds.includes(item.id) &&
      (item.status === 'active' || item.status === 'low_stock')
  );

  // Get categories of items in the package
  const packageCategories = new Set(
    currentPackage.includedItems
      .map(packageItem => {
        const menuItem = allItems.find(
          item => item.id === packageItem.menuItemId
        );
        return menuItem?.category.id;
      })
      .filter(Boolean)
  );

  // Score items based on how well they complement the package
  const scoredItems = availableItems.map(item => ({
    item,
    score: calculatePackageComplementScore(
      item,
      packageCategories,
      currentPackage
    ),
  }));

  // Sort by score and return top items
  return scoredItems
    .sort((a, b) => b.score - a.score)
    .slice(0, maxItems)
    .map(scored => scored.item);
}

/**
 * Calculate how well an item complements a package
 */
function calculatePackageComplementScore(
  item: MenuItem,
  packageCategories: Set<string | undefined>,
  currentPackage: Package
): number {
  let score = 0;

  // Items from categories not in the package get higher score
  if (!packageCategories.has(item.category.id)) {
    score += 30;
  }

  // Items that are commonly paired with package type
  const packageTypeBonus = {
    daily: item.category.name === 'Starters' ? 20 : 0,
    weekly: item.category.name === 'Sides' ? 15 : 0,
    monthly: 10, // All items get some bonus for monthly packages
  };

  score += packageTypeBonus[currentPackage.type] || 0;

  // Price consideration - items that are reasonably priced additions
  if (item.basePrice <= 15) {
    score += 15;
  } else if (item.basePrice <= 25) {
    score += 10;
  }

  // Popular items (based on tags)
  if (item.tags.includes('popular')) {
    score += 10;
  }

  return score;
}

/**
 * Get related packages for a package
 * @param currentPackage - The current package
 * @param allPackages - All available packages
 * @param maxPackages - Maximum number of packages to return (default: 3)
 * @returns Array of related packages
 */
export function getRelatedPackages(
  currentPackage: Package,
  allPackages: Package[],
  maxPackages: number = 3
): Package[] {
  // Filter out current package and inactive packages
  const availablePackages = allPackages.filter(
    pkg => pkg.id !== currentPackage.id && pkg.isActive
  );

  // If current package has explicit related package IDs, use those first
  if (
    currentPackage.relatedPackageIds &&
    currentPackage.relatedPackageIds.length > 0
  ) {
    const explicitRelated = availablePackages.filter(pkg =>
      currentPackage.relatedPackageIds!.includes(pkg.id)
    );

    if (explicitRelated.length >= maxPackages) {
      return explicitRelated.slice(0, maxPackages);
    }

    // Fill remaining slots with algorithmic suggestions
    const remainingSlots = maxPackages - explicitRelated.length;
    const algorithmicRelated = getAlgorithmicRelatedPackages(
      currentPackage,
      availablePackages.filter(
        pkg => !currentPackage.relatedPackageIds!.includes(pkg.id)
      ),
      remainingSlots
    );

    return [...explicitRelated, ...algorithmicRelated];
  }

  // Use algorithmic approach
  return getAlgorithmicRelatedPackages(
    currentPackage,
    availablePackages,
    maxPackages
  );
}

/**
 * Get algorithmically determined related packages
 */
function getAlgorithmicRelatedPackages(
  currentPackage: Package,
  availablePackages: Package[],
  maxPackages: number
): Package[] {
  // Score packages based on similarity
  const scoredPackages = availablePackages.map(pkg => ({
    package: pkg,
    score: calculatePackageSimilarityScore(currentPackage, pkg),
  }));

  // Sort by score and return top packages
  return scoredPackages
    .sort((a, b) => b.score - a.score)
    .slice(0, maxPackages)
    .map(scored => scored.package);
}

/**
 * Calculate similarity score between two packages
 */
function calculatePackageSimilarityScore(pkg1: Package, pkg2: Package): number {
  let score = 0;

  // Same type gets bonus
  if (pkg1.type === pkg2.type) {
    score += 20;
  }

  // Similar price range
  const priceDifference = Math.abs(pkg1.price - pkg2.price);
  const averagePrice = (pkg1.price + pkg2.price) / 2;
  const priceVariation = priceDifference / averagePrice;

  if (priceVariation <= 0.3) {
    score += 15;
  } else if (priceVariation <= 0.5) {
    score += 10;
  }

  // Similar number of items
  const itemCount1 = pkg1.includedItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const itemCount2 = pkg2.includedItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const itemCountDifference = Math.abs(itemCount1 - itemCount2);

  if (itemCountDifference <= 2) {
    score += 10;
  } else if (itemCountDifference <= 5) {
    score += 5;
  }

  // Progression bonus (daily -> weekly -> monthly)
  const typeProgression = ['daily', 'weekly', 'monthly'];
  const currentIndex = typeProgression.indexOf(pkg1.type);
  const otherIndex = typeProgression.indexOf(pkg2.type);

  if (Math.abs(currentIndex - otherIndex) === 1) {
    score += 25; // Adjacent types get high bonus
  }

  return score;
}

/**
 * Check if recommendations should be hidden (when no items available)
 * @param items - Array of recommended items
 * @returns boolean indicating if section should be hidden
 */
export function shouldHideRecommendations(
  items: MenuItem[] | Package[]
): boolean {
  return !items || items.length === 0;
}
/**
 * Get complementary items based on meal composition rules
 * @param currentItem - The current menu item
 * @param allItems - All available menu items
 * @param maxItems - Maximum number of items to return
 * @returns Array of complementary menu items
 */
export function getComplementaryItems(
  currentItem: MenuItem,
  allItems: MenuItem[],
  maxItems: number = 4
): MenuItem[] {
  const availableItems = allItems.filter(
    item =>
      item.id !== currentItem.id &&
      (item.status === 'active' || item.status === 'low_stock')
  );

  // Define complementary relationships
  const complementaryRules = [
    // Main dishes go well with sides and starters
    {
      category: 'Main Dishes',
      complements: ['Sides', 'Starters'],
      weight: 30,
    },
    // Soups go well with sides and starters
    {
      category: 'Soups',
      complements: ['Sides', 'Starters'],
      weight: 25,
    },
    // Sides go well with main dishes and soups
    {
      category: 'Sides',
      complements: ['Main Dishes', 'Soups'],
      weight: 20,
    },
    // Starters go well with everything
    {
      category: 'Starters',
      complements: ['Main Dishes', 'Soups', 'Sides'],
      weight: 15,
    },
  ];

  // Find the rule for current item's category
  const currentRule = complementaryRules.find(
    rule => rule.category === currentItem.category.name
  );

  if (!currentRule) {
    // Fallback to general algorithm
    return getAlgorithmicRelatedItems(currentItem, availableItems, maxItems);
  }

  // Score items based on complementary rules
  const scoredItems = availableItems.map(item => {
    let score = 0;

    // Check if item's category is complementary
    if (currentRule.complements.includes(item.category.name)) {
      score += currentRule.weight;
    }

    // Add bonus for popular items
    if (item.tags.includes('popular')) {
      score += 10;
    }

    // Add bonus for healthy items if current item is healthy
    if (currentItem.tags.includes('healthy') && item.tags.includes('healthy')) {
      score += 8;
    }

    // Add bonus for spicy items if current item is spicy
    if (currentItem.tags.includes('spicy') && item.tags.includes('spicy')) {
      score += 5;
    }

    // Price consideration - prefer items in similar or lower price range
    const priceDifference = Math.abs(currentItem.basePrice - item.basePrice);
    if (priceDifference <= 5) {
      score += 8;
    } else if (priceDifference <= 10) {
      score += 4;
    }

    return { item, score };
  });

  // Sort by score and return top items
  return scoredItems
    .sort((a, b) => b.score - a.score)
    .slice(0, maxItems)
    .map(scored => scored.item);
}

/**
 * Get trending or popular items for fallback recommendations
 * @param allItems - All available menu items
 * @param excludeIds - Item IDs to exclude
 * @param maxItems - Maximum number of items to return
 * @returns Array of popular menu items
 */
export function getPopularItems(
  allItems: MenuItem[],
  excludeIds: string[] = [],
  maxItems: number = 6
): MenuItem[] {
  const availableItems = allItems.filter(
    item =>
      !excludeIds.includes(item.id) &&
      (item.status === 'active' || item.status === 'low_stock')
  );

  // Score items based on popularity indicators
  const scoredItems = availableItems.map(item => {
    let score = 0;

    // Popular tag gets highest score
    if (item.tags.includes('popular')) {
      score += 50;
    }

    // Traditional items are often popular
    if (item.tags.includes('traditional')) {
      score += 20;
    }

    // Spicy items tend to be popular in African cuisine
    if (item.tags.includes('spicy')) {
      score += 15;
    }

    // Lower priced items are more accessible
    if (item.basePrice <= 20) {
      score += 10;
    }

    // Items with good nutritional balance
    if (item.nutritionalInfo) {
      const { protein, calories } = item.nutritionalInfo;
      if (protein >= 25 && calories <= 700) {
        score += 8;
      }
    }

    return { item, score };
  });

  // Sort by score and return top items
  return scoredItems
    .sort((a, b) => b.score - a.score)
    .slice(0, maxItems)
    .map(scored => scored.item);
}

/**
 * Get recommendations with fallback logic
 * @param currentItem - The current menu item
 * @param allItems - All available menu items
 * @param maxItems - Maximum number of items to return
 * @returns Array of recommended items with fallback
 */
export function getRecommendationsWithFallback(
  currentItem: MenuItem,
  allItems: MenuItem[],
  maxItems: number = 6
): MenuItem[] {
  // Try primary recommendation algorithm
  let recommendations = getRelatedMenuItems(currentItem, allItems, maxItems);

  // If we don't have enough recommendations, try complementary items
  if (recommendations.length < maxItems) {
    const complementary = getComplementaryItems(
      currentItem,
      allItems.filter(item => !recommendations.some(rec => rec.id === item.id)),
      maxItems - recommendations.length
    );
    recommendations = [...recommendations, ...complementary];
  }

  // If still not enough, fill with popular items
  if (recommendations.length < maxItems) {
    const excludeIds = [
      currentItem.id,
      ...recommendations.map(item => item.id),
    ];
    const popular = getPopularItems(
      allItems,
      excludeIds,
      maxItems - recommendations.length
    );
    recommendations = [...recommendations, ...popular];
  }

  return recommendations.slice(0, maxItems);
}
