interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class SimpleCache {
  private store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  invalidate(key: string): void {
    this.store.delete(key);
  }

  invalidateByPrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }
}

// Singleton cache instance
export const cache = new SimpleCache();

// TTL sabitleri (ms)
export const TTL = {
  SHORT: 2 * 60 * 1000,    //  2 dakika
  MEDIUM: 5 * 60 * 1000,   //  5 dakika
  LONG: 10 * 60 * 1000,    // 10 dakika
  XLONG: 30 * 60 * 1000,   // 30 dakika
} as const;

// Cache key sabitleri
export const CACHE_KEYS = {
  YEARS: 'years:all',
  GENRES: 'genres:all',
  months: (year: number) => `months:${year}`,
  analytics: (year: number, month?: number) =>
    month !== undefined ? `analytics:${year}:${month}` : `analytics:${year}`,
} as const;
