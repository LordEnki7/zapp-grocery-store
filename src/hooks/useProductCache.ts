import { useState, useEffect, useCallback, useRef } from 'react';
import type { Product } from '../services/productService';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface ProductCacheOptions {
  maxSize?: number;
  ttl?: number; // Time to live in milliseconds
  enablePersistence?: boolean;
}

class ProductCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize: number;
  private ttl: number;
  private enablePersistence: boolean;

  constructor(options: ProductCacheOptions = {}) {
    this.maxSize = options.maxSize || 1000;
    this.ttl = options.ttl || 5 * 60 * 1000; // 5 minutes default
    this.enablePersistence = options.enablePersistence || false;

    if (this.enablePersistence) {
      this.loadFromStorage();
    }
  }

  set<T>(key: string, data: T, customTtl?: number): void {
    const now = Date.now();
    const expiresAt = now + (customTtl || this.ttl);

    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt
    });

    if (this.enablePersistence) {
      this.saveToStorage();
    }
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
    if (this.enablePersistence) {
      this.saveToStorage();
    }
  }

  clear(): void {
    this.cache.clear();
    if (this.enablePersistence) {
      localStorage.removeItem('productCache');
    }
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
    if (this.enablePersistence) {
      this.saveToStorage();
    }
  }

  private saveToStorage(): void {
    try {
      const serialized = JSON.stringify(Array.from(this.cache.entries()));
      localStorage.setItem('productCache', serialized);
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('productCache');
      if (stored) {
        const entries = JSON.parse(stored);
        this.cache = new Map(entries);
        this.cleanup(); // Remove any expired entries
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      ttl: this.ttl
    };
  }
}

// Global cache instance
const globalProductCache = new ProductCache({
  maxSize: 2000,
  ttl: 10 * 60 * 1000, // 10 minutes
  enablePersistence: true
});

export const useProductCache = () => {
  const [cacheStats, setCacheStats] = useState(globalProductCache.getStats());
  const cleanupInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Set up periodic cleanup
    cleanupInterval.current = setInterval(() => {
      globalProductCache.cleanup();
      setCacheStats(globalProductCache.getStats());
    }, 60000); // Cleanup every minute

    return () => {
      if (cleanupInterval.current) {
        clearInterval(cleanupInterval.current);
      }
    };
  }, []);

  const setProduct = useCallback((id: string, product: Product) => {
    globalProductCache.set(`product:${id}`, product);
    setCacheStats(globalProductCache.getStats());
  }, []);

  const getProduct = useCallback((id: string): Product | null => {
    return globalProductCache.get(`product:${id}`);
  }, []);

  const setProducts = useCallback((key: string, products: Product[]) => {
    globalProductCache.set(`products:${key}`, products);
    setCacheStats(globalProductCache.getStats());
  }, []);

  const getProducts = useCallback((key: string): Product[] | null => {
    return globalProductCache.get(`products:${key}`);
  }, []);

  const setSearchResults = useCallback((query: string, results: Product[]) => {
    globalProductCache.set(`search:${query}`, results);
    setCacheStats(globalProductCache.getStats());
  }, []);

  const getSearchResults = useCallback((query: string): Product[] | null => {
    return globalProductCache.get(`search:${query}`);
  }, []);

  const setCategoryProducts = useCallback((category: string, products: Product[]) => {
    globalProductCache.set(`category:${category}`, products);
    setCacheStats(globalProductCache.getStats());
  }, []);

  const getCategoryProducts = useCallback((category: string): Product[] | null => {
    return globalProductCache.get(`category:${category}`);
  }, []);

  const invalidateProduct = useCallback((id: string) => {
    globalProductCache.delete(`product:${id}`);
    // Also invalidate any lists that might contain this product
    const keysToDelete: string[] = [];
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('products:') || key.startsWith('search:') || key.startsWith('category:')) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => globalProductCache.delete(key));
    setCacheStats(globalProductCache.getStats());
  }, []);

  const clearCache = useCallback(() => {
    globalProductCache.clear();
    setCacheStats(globalProductCache.getStats());
  }, []);

  return {
    setProduct,
    getProduct,
    setProducts,
    getProducts,
    setSearchResults,
    getSearchResults,
    setCategoryProducts,
    getCategoryProducts,
    invalidateProduct,
    clearCache,
    cacheStats
  };
};

// Hook for caching with automatic fetching
interface UseCachedDataOptions<T> {
  key: string;
  fetcher: () => Promise<T>;
  ttl?: number;
  enabled?: boolean;
}

export const useCachedData = <T>({
  key,
  fetcher,
  ttl,
  enabled = true
}: UseCachedDataOptions<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      // Check cache first unless forcing refresh
      if (!forceRefresh) {
        const cached = globalProductCache.get<T>(key);
        if (cached) {
          setData(cached);
          setIsLoading(false);
          return cached;
        }
      }

      // Fetch fresh data
      const freshData = await fetcher();
      globalProductCache.set(key, freshData, ttl);
      setData(freshData);
      return freshData;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, ttl, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => fetchData(true), [fetchData]);

  return {
    data,
    isLoading,
    error,
    refresh
  };
};

export default useProductCache;