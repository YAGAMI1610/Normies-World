// apps/server/src/lib/redis.ts
import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on("error", (err) => {
  // eslint-disable-next-line no-console
  console.error("[redis] connection error:", err.message);
});

redis.connect().catch(() => {
  // ignore local redis startup failures so the app can still boot
});

/**
 * Cache-aside helper. Fetches `fn()` and caches the JSON result under `key`
 * for `ttlSeconds`. On any redis error, falls through to `fn()` directly so
 * the app degrades gracefully without Redis available.
 */
export async function cached<T>(
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>
): Promise<T> {
  try {
    const hit = await redis.get(key);
    if (hit) return JSON.parse(hit) as T;
  } catch {
    // ignore cache read errors
  }

  const value = await fn();

  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {
    // ignore cache write errors
  }

  return value;
}
