// apps/server/src/jobs/whaleScoreScheduler.ts
// Recalculates whale scores every 6 hours and publishes whale:move events.

import { recalculateAllWhales } from '../services/whaleScoreEngine';
import { redis } from '../lib/redis';

const INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours

export async function startWhaleScoreScheduler() {
  console.log('[whaleScoreScheduler] starting, interval=6h');

  async function tick() {
    try {
      console.log('[whaleScoreScheduler] recalculating whale scores…');
      const count = await recalculateAllWhales();
      await redis.publish('whale:move', JSON.stringify({ updated: count, ts: Date.now() }));
      console.log(`[whaleScoreScheduler] done — ${count} whales updated`);
    } catch (err) {
      console.error('[whaleScoreScheduler] error:', err);
    }
  }

  // First run after 30s so DB can settle on boot
  setTimeout(() => {
    tick();
    setInterval(tick, INTERVAL_MS);
  }, 30_000);
}
