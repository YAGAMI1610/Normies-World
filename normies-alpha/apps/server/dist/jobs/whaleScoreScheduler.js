"use strict";
// apps/server/src/jobs/whaleScoreScheduler.ts
// Recalculates whale scores every 6 hours and publishes whale:move events.
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWhaleScoreScheduler = startWhaleScoreScheduler;
const whaleScoreEngine_1 = require("../services/whaleScoreEngine");
const redis_1 = require("../lib/redis");
const INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours
async function startWhaleScoreScheduler() {
    console.log('[whaleScoreScheduler] starting, interval=6h');
    async function tick() {
        try {
            console.log('[whaleScoreScheduler] recalculating whale scores…');
            const count = await (0, whaleScoreEngine_1.recalculateAllWhales)();
            await redis_1.redis.publish('whale:move', JSON.stringify({ updated: count, ts: Date.now() }));
            console.log(`[whaleScoreScheduler] done — ${count} whales updated`);
        }
        catch (err) {
            console.error('[whaleScoreScheduler] error:', err);
        }
    }
    // First run after 30s so DB can settle on boot
    setTimeout(() => {
        tick();
        setInterval(tick, INTERVAL_MS);
    }, 30_000);
}
