import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate SEO-friendly slug from a string
 * @param text - The text to convert to a slug
 * @returns A URL-safe slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens and spaces
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
}

/**
 * Validate slug uniqueness within a collection
 * @param slug - The slug to validate
 * @param existingSlugs - Array of existing slugs
 * @param id - Optional ID to exclude from uniqueness check (for updates)
 * @returns Unique slug with suffix if needed
 */
export function ensureUniqueSlug(
  slug: string,
  existingSlugs: string[],
  id?: string
): string {
  const filteredSlugs = id
    ? existingSlugs.filter(s => s !== slug)
    : existingSlugs;

  if (!filteredSlugs.includes(slug)) {
    return slug;
  }

  let counter = 1;
  let uniqueSlug = `${slug}-${counter}`;

  while (filteredSlugs.includes(uniqueSlug)) {
    counter++;
    uniqueSlug = `${slug}-${counter}`;
  }

  return uniqueSlug;
}
