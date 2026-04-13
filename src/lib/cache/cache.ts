// src/lib/cache.ts
import { unstable_cache } from 'next/cache';
import { cache } from 'react';

export const defaultRevalidate = 3600; // ۱ ساعت

/**
 * کشینگ پیشرفته برای Server Components
 */
export function createCachedQuery<T>(
  fn: (...args: any[]) => Promise<T>,
  keyParts: string[],
  options: { revalidate?: number; tags?: string[] } = {}
) {
  return unstable_cache(
    fn,
    keyParts,
    {
      revalidate: options.revalidate ?? defaultRevalidate,
      tags: options.tags,
    }
  );
}

/**
 * کش ساده برای توابع پراستفاده
 */
export const cached = cache;