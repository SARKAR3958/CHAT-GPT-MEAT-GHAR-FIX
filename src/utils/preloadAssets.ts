import { STATIC_IMAGES } from './imageAssets';

/**
 * Ultra-Fast High-Priority Preloader & In-Memory Cache for all Meat Ghar image assets.
 * Executes during initial boot & 4-second splash screen so all images render instantly.
 */

const inMemoryImageCache = new Map<string, HTMLImageElement>();

export async function preloadAllImages(): Promise<void> {
  if (typeof window === 'undefined') return;

  const urlsToPreload = new Set<string>();

  Object.values(STATIC_IMAGES).slice(0,4).forEach(url=>urlsToPreload.add(url));

  // Load and decode all images in parallel
  const promises = Array.from(urlsToPreload).map((url) => {
    return new Promise<void>((resolve) => {
      // Check if already in cache
      if (inMemoryImageCache.has(url)) {
        resolve();
        return;
      }

      const img = new Image();
      img.src = url;
      img.loading = 'eager';

      if ('decode' in img && typeof img.decode === 'function') {
        img
          .decode()
          .then(() => {
            inMemoryImageCache.set(url, img);
            resolve();
          })
          .catch(() => {
            inMemoryImageCache.set(url, img);
            resolve();
          });
      } else {
        img.onload = () => {
          inMemoryImageCache.set(url, img);
          resolve();
        };
        img.onerror = () => resolve();
      }
    });
  });

  try {
    await Promise.allSettled(promises);
  } catch {
    // Ignore any global preload error
  }
}

// Immediately trigger background preload on bundle load
preloadAllImages();
