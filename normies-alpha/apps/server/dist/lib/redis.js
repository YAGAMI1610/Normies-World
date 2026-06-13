"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
exports.cached = cached;
// apps/server/src/lib/redis.ts
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("./env");
exports.redis = new ioredis_1.default(env_1.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    lazyConnect: false,
});
exports.redis.on("error", (err) => {
    // eslint-disable-next-line no-console
    console.error("[redis] connection error:", err.message);
});
/**
 * Cache-aside helper. Fetches `fn()` and caches the JSON result under `key`
 * for `ttlSeconds`. On any redis error, falls through to `fn()` directly so
 * the app degrades gracefully without Redis available.
 */
async function cached(key, ttlSeconds, fn) {
    try {
        const hit = await exports.redis.get(key);
        if (hit)
            return JSON.parse(hit);
    }
    catch {
        // ignore cache read errors
    }
    const value = await fn();
    try {
        await exports.redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
    }
    catch {
        // ignore cache write errors
    }
    return value;
}
