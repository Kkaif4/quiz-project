/**
 * In-Memory Sliding-Window Rate Limiter with LRU Eviction.
 * 
 * Provides defense against API flood attacks without external Redis dependency for MVP.
 * Enforces per-IP limits on creation, attempts, and moderation reports.
 */

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  maxEntries?: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in seconds
  retryAfter?: number; // Seconds to wait before retrying
}

export class SlidingWindowRateLimiter {
  private readonly windowMs: number;
  private readonly max: number;
  private readonly maxEntries: number;
  private readonly store: Map<string, number[]>;

  constructor(config: RateLimitConfig) {
    this.windowMs = config.windowMs;
    this.max = config.max;
    this.maxEntries = config.maxEntries ?? 5000;
    this.store = new Map<string, number[]>();
  }

  /**
   * Evaluates if a request from the given key is permitted within the sliding window.
   */
  public check(key: string): RateLimitResult {
    // Respect disable switch in dev/testing environments
    if (process.env.RATE_LIMIT_ENABLED === "false") {
      const resetTime = Math.ceil((Date.now() + this.windowMs) / 1000);
      return {
        success: true,
        limit: this.max,
        remaining: this.max,
        reset: resetTime,
      };
    }

    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Retrieve existing timestamps and prune timestamps older than the sliding window
    let timestamps = this.store.get(key);

    if (timestamps) {
      // Re-insert key to maintain LRU order (most recently accessed at the end)
      this.store.delete(key);
      timestamps = timestamps.filter((ts) => ts > windowStart);
    } else {
      timestamps = [];
      // LRU Eviction: Remove oldest entry when capacity is reached
      if (this.store.size >= this.maxEntries) {
        const oldestKey = this.store.keys().next().value;
        if (oldestKey !== undefined) {
          this.store.delete(oldestKey);
        }
      }
    }

    if (timestamps.length >= this.max) {
      // Limit exceeded: Re-store cleaned timestamps
      this.store.set(key, timestamps);

      const oldestTimestamp = timestamps[0] ?? now;
      const retryAfterMs = Math.max(0, oldestTimestamp + this.windowMs - now);
      const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
      const resetSeconds = Math.ceil((oldestTimestamp + this.windowMs) / 1000);

      return {
        success: false,
        limit: this.max,
        remaining: 0,
        reset: resetSeconds,
        retryAfter: retryAfterSeconds,
      };
    }

    // Add current timestamp and store
    timestamps.push(now);
    this.store.set(key, timestamps);

    const remaining = Math.max(0, this.max - timestamps.length);
    const resetSeconds = Math.ceil((timestamps[0] + this.windowMs) / 1000);

    return {
      success: true,
      limit: this.max,
      remaining,
      reset: resetSeconds,
    };
  }

  /**
   * Resets rate limit records for a specific key, or clears the entire store.
   */
  public reset(key?: string): void {
    if (key) {
      this.store.delete(key);
    } else {
      this.store.clear();
    }
  }

  /**
   * Returns current number of tracked IP keys.
   */
  public get size(): number {
    return this.store.size;
  }
}

/**
 * Extracts client IP address from standard reverse proxy and forwarding headers.
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp?.trim()) {
    return realIp.trim();
  }

  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp?.trim()) {
    return cfConnectingIp.trim();
  }

  return "127.0.0.1";
}

/**
 * Constructs standard rate limiting HTTP headers for responses.
 */
export function createRateLimitHeaders(
  result: RateLimitResult,
): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": Math.max(0, result.remaining).toString(),
    "X-RateLimit-Reset": result.reset.toString(),
  };

  if (result.retryAfter !== undefined) {
    headers["Retry-After"] = result.retryAfter.toString();
  }

  return headers;
}

// -------------------------------------------------------------
// Production Rate Limiter Presets (Per IP)
// -------------------------------------------------------------

/** Quiz Creation: 5 requests per hour */
export const quizCreateLimiter = new SlidingWindowRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  maxEntries: 5000,
});

/** Attempt Submission: 10 requests per 10 minutes */
export const quizAttemptLimiter = new SlidingWindowRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 10,
  maxEntries: 10000,
});

/** Content Reporting: 3 requests per hour */
export const quizReportLimiter = new SlidingWindowRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  maxEntries: 5000,
});

/** Admin Moderation API: 20 requests per 10 minutes */
export const adminApiLimiter = new SlidingWindowRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 20,
  maxEntries: 1000,
});

/** Owner Quiz Sync: 30 requests per 10 minutes */
export const quizSyncLimiter = new SlidingWindowRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 30,
  maxEntries: 5000,
});
