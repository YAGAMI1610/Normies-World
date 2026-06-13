// apps/server/src/lib/redis.ts
import Redis from "ioredis";

export const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: 3,
  lazyConnect: false,
});

redis.on("error", (err) => {
  // eslint-disable-next-line no-console
  console.error("[redis] connection error:", err.message);
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
