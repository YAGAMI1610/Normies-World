// apps/server/src/jobs/alertScheduler.ts
import { runAlertScan, getRecentAlerts } from '../services/alertEngine';
import { redis } from '../lib/redis';

const INTERVAL_MS = 5 * 60 * 1000; // every 5 minutes

export async function startAlertScheduler() {
  console.log('[alertScheduler] starting, interval=5min');

  async function tick() {
    try {
      await runAlertScan();
      const recent = await getRecentAlerts(1);
      if (recent.length > 0) {
        console.log(`[alertScheduler] last alert: ${recent[0].message}`);
      }
    } catch (err) {
      console.error('[alertScheduler] tick error:', err);
    }
  }

  await tick();
  setInterval(tick, INTERVAL_MS);
}
