import axios, { type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { requestCache } from "./cache";

// Extend Axios configuration for caching options
declare module "axios" {
  export interface AxiosRequestConfig {
    skipCache?: boolean;
    ttl?: number;
    forceRefresh?: boolean;
  }
}

export const api = axios.create({
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Clerk authorization token dynamically in browser context
if (typeof window !== "undefined") {
  api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    try {
      // Access Clerk instance dynamically from window object
      // @ts-expect-error - Clerk is attached to window by ClerkProvider in browser context
      const clerk = window.Clerk;
      if (clerk?.session) {
        const token = await clerk.session.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error("Error setting authorization header:", error);
    }
    return config;
  });

  // Response interceptor: automatically invalidate relevant cache entries on mutations
  api.interceptors.response.use(
    (response) => {
      const method = response.config?.method?.toLowerCase();
      if (method && ["post", "put", "patch", "delete"].includes(method)) {
        if (response.config?.url) {
          requestCache.handleMutation(response.config.url);
        }
      }
      return response;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
}

// Store original get method
const rawGet = api.get.bind(api);

// Enhanced api.get with in-memory caching and in-flight request deduplication
api.get = function <T = unknown, R = AxiosResponse<T>, D = unknown>(
  url: string,
  config?: AxiosRequestConfig<D>
): Promise<R> {
  // Only cache in browser context
  if (typeof window === "undefined") {
    return rawGet(url, config) as Promise<R>;
  }

  const shouldSkipCache =
    config?.skipCache === true ||
    config?.forceRefresh === true ||
    config?.headers?.["Cache-Control"] === "no-cache" ||
    config?.headers?.["cache-control"] === "no-cache";

  const cacheKey = requestCache.generateKey(url, config?.params as Record<string, unknown> | undefined);

  if (!shouldSkipCache) {
    // 1. Check existing fresh cache
    const cached = requestCache.get<T>(cacheKey);
    if (cached) {
      const syntheticResponse: AxiosResponse<T> = {
        data: cached.data,
        status: cached.status,
        statusText: cached.statusText,
        headers: cached.headers,
        config: (config || {}) as InternalAxiosRequestConfig,
        request: {},
      };
      return Promise.resolve(syntheticResponse as unknown as R);
    }

    // 2. Check in-flight deduplication (share pending request)
    const inFlightPromise = requestCache.getInFlight<R>(cacheKey);
    if (inFlightPromise) {
      return inFlightPromise;
    }
  }

  // 3. Dispatch real request
  const fetchPromise = rawGet(url, config)
    .then((response) => {
      // Only cache successful 200 responses
      if (response.status >= 200 && response.status < 300 && !shouldSkipCache) {
        const ttl = requestCache.getTtlForUrl(url, config?.ttl);
        requestCache.set(
          cacheKey,
          response.data,
          ttl,
          response.status,
          response.statusText,
          response.headers as Record<string, string>
        );
      }
      requestCache.clearInFlight(cacheKey);
      return response as R;
    })
    .catch((error) => {
      requestCache.clearInFlight(cacheKey);
      throw error;
    });

  if (!shouldSkipCache) {
    requestCache.setInFlight(cacheKey, fetchPromise);
  }

  return fetchPromise;
};

// Expose cache utility methods directly on api instance
export interface ApiWithCache {
  invalidateCache: (pattern?: string) => void;
  clearCache: () => void;
  getCacheSize: () => number;
}

Object.assign(api, {
  invalidateCache: (pattern?: string) => requestCache.invalidate(pattern),
  clearCache: () => requestCache.clear(),
  getCacheSize: () => requestCache.size(),
});
