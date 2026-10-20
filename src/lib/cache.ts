/**
 * Frontend In-Memory Request Cache and Deduplication Engine
 * Provides instant (<1ms) responses for repeated GET requests,
 * deduplicates concurrent in-flight requests, and auto-invalidates on mutations.
 */

export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

// Default TTL configurations (in milliseconds)
export const DEFAULT_TTLS: Record<string, number> = {
  "/api/me": 60_000,              // 60 seconds (User Profile)
  "/api/courses": 60_000,         // 60 seconds (Course Catalog)
  "/api/timetable/settings": 120_000, // 2 minutes (Shift Settings)
  "/api/faculty": 60_000,         // 60 seconds (Faculty Directory)
  "/api/announcements": 30_000,   // 30 seconds (Announcements)
  "/api/dashboard": 25_000,       // 25 seconds (Dashboard Stats)
  "/api/fees": 30_000,            // 30 seconds (Dues & Fees)
  "/api/timetable": 45_000,       // 45 seconds (Timetables)
  "/api/students": 30_000,        // 30 seconds (Student Directory)
  default: 30_000,                // 30 seconds default for GET
};

// Mutation invalidation mapping: when a write occurs on key, invalidate matching patterns
const MUTATION_INVALIDATION_RULES: Record<string, string[]> = {
  "/api/courses": ["/api/courses", "/api/dashboard", "/api/timetable"],
  "/api/attendance": ["/api/attendance", "/api/dashboard", "/api/faculty-attendance"],
  "/api/faculty-attendance": ["/api/faculty-attendance", "/api/dashboard", "/api/attendance"],
  "/api/fees": ["/api/fees", "/api/dashboard"],
  "/api/grades": ["/api/grades", "/api/dashboard"],
  "/api/announcements": ["/api/announcements", "/api/dashboard"],
  "/api/admissions": ["/api/admissions", "/api/dashboard"],
  "/api/me": ["/api/me", "/api/dashboard"],
  "/api/students": ["/api/students", "/api/dashboard", "/api/fees", "/api/grades", "/api/attendance"],
  "/api/faculty": ["/api/faculty", "/api/dashboard", "/api/courses", "/api/timetable"],
  "/api/quizzes": ["/api/quizzes", "/api/dashboard"],
  "/api/timetable": ["/api/timetable", "/api/dashboard"],
};

export class RequestCache {
  private cache = new Map<string, CacheEntry>();
  private inFlight = new Map<string, Promise<unknown>>();
  private maxEntries = 150;

  /**
   * Determine matching TTL for a given URL path
   */
  public getTtlForUrl(url: string, customTtl?: number): number {
    if (typeof customTtl === "number" && customTtl >= 0) {
      return customTtl;
    }
    const cleanUrl = url.split("?")[0];
    for (const [pattern, ttl] of Object.entries(DEFAULT_TTLS)) {
      if (pattern !== "default" && cleanUrl.startsWith(pattern)) {
        return ttl;
      }
    }
    return DEFAULT_TTLS.default;
  }

  /**
   * Generate a normalized, deterministic cache key from URL and params
   */
  public generateKey(url: string, params?: Record<string, unknown> | string): string {
    if (!params) return url;
    if (typeof params === "string") return `${url}?${params}`;
    
    // Sort keys deterministically
    const sortedKeys = Object.keys(params).sort();
    const queryParts = sortedKeys
      .map((k) => {
        const val = params[k];
        if (val === undefined || val === null) return "";
        return `${encodeURIComponent(k)}=${encodeURIComponent(String(val))}`;
      })
      .filter(Boolean)
      .join("&");

    return queryParts ? `${url}?${queryParts}` : url;
  }

  /**
   * Retrieve cached data if present and not expired
   */
  public get<T>(key: string): CacheEntry<T> | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry as CacheEntry<T>;
  }

  /**
   * Store data in cache with TTL and enforce LRU maxEntries
   */
  public set<T>(key: string, data: T, ttl: number, status = 200, statusText = "OK", headers: Record<string, string> = {}): void {
    if (this.cache.size >= this.maxEntries) {
      // Remove oldest entry
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      status,
      statusText,
      headers,
    });
  }

  /**
   * Delete specific key from cache
   */
  public delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate all cached entries whose keys match a prefix or regex
   */
  public invalidate(pattern?: string | RegExp): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (typeof pattern === "string") {
        if (key.includes(pattern) || key.startsWith(pattern)) {
          this.cache.delete(key);
        }
      } else if (pattern instanceof RegExp) {
        if (pattern.test(key)) {
          this.cache.delete(key);
        }
      }
    }
  }

  /**
   * Automatically invalidate cached resources based on mutation URL
   */
  public handleMutation(url: string): void {
    const cleanUrl = url.split("?")[0];
    let matched = false;

    for (const [prefix, invalidationList] of Object.entries(MUTATION_INVALIDATION_RULES)) {
      if (cleanUrl.startsWith(prefix)) {
        matched = true;
        for (const item of invalidationList) {
          this.invalidate(item);
        }
      }
    }

    // Default fallback: if unmapped mutation, invalidate the base resource and dashboard
    if (!matched) {
      this.invalidate(cleanUrl);
      this.invalidate("/api/dashboard");
    }
  }

  /**
   * Clear all cache entries
   */
  public clear(): void {
    this.cache.clear();
    this.inFlight.clear();
  }

  /**
   * In-flight deduplication helpers
   */
  public getInFlight<T>(key: string): Promise<T> | null {
    const promise = this.inFlight.get(key);
    return (promise as Promise<T>) || null;
  }

  public setInFlight<T>(key: string, promise: Promise<T>): void {
    this.inFlight.set(key, promise as Promise<unknown>);
  }

  public clearInFlight(key: string): void {
    this.inFlight.delete(key);
  }

  /**
   * Inspect current cache size (useful for diagnostics)
   */
  public size(): number {
    return this.cache.size;
  }
}

// Singleton global cache instance (client-side)
export const requestCache = new RequestCache();
