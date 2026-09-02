/**
 * In-memory rate limiter using LRU Cache.
 *
 * ⚠️  PRODUCTION NOTE:
 * This limiter is in-memory and per-process. In a multi-process or multi-instance
 * deployment (e.g. PM2 cluster, Kubernetes) each instance has its own counter —
 * effective limit becomes: configured_limit × number_of_instances.
 *
 * For production at scale, replace the LRUCache store below with a Redis client
 * (e.g. `ioredis` + `@upstash/ratelimit`) and keep the same `check()` interface.
 */
import { LRUCache } from 'lru-cache';

type Options = {
  /** Time window in milliseconds */
  interval?: number;
  /** Max unique tokens (IPs) to track */
  uniqueTokenPerInterval?: number;
};

export default function rateLimit(options?: Options) {
  const tokenCache = new LRUCache<string, number[]>({
    max: options?.uniqueTokenPerInterval ?? 500,
    ttl: options?.interval ?? 60_000,
  });

  return {
    /**
     * Check and increment rate limit counter for a token.
     *
     * Bug-fix: previously used `>= limit` which rejected the *limit-th* request.
     * Now uses `> limit` so exactly `limit` requests are allowed per window.
     *
     * Headers are returned as a plain object so callers can attach them to
     * any NextResponse they return (not just the dummy `NextResponse.next()`).
     *
     * @throws When the token has exceeded the limit (rejects the Promise)
     */
    check: (
      res: { headers: Headers },
      limit: number,
      token: string
    ): Promise<void> =>
      new Promise((resolve, reject) => {
        const tokenCount = tokenCache.get(token) ?? [0];
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount);
        }
        tokenCount[0] += 1;

        const currentUsage = tokenCount[0];
        const remaining = Math.max(0, limit - currentUsage);
        const isRateLimited = currentUsage > limit; // fixed: was ">=" (off-by-one)

        // Attach rate-limit headers to the caller's response
        res.headers.set('X-RateLimit-Limit', String(limit));
        res.headers.set('X-RateLimit-Remaining', String(remaining));
        res.headers.set('X-RateLimit-Reset', String(Date.now() + (options?.interval ?? 60_000)));

        return isRateLimited ? reject() : resolve();
      }),
  };
}
