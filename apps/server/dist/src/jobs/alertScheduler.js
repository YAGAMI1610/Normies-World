"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAlertScheduler = startAlertScheduler;
// apps/server/src/jobs/alertScheduler.ts
const alertEngine_1 = require("../services/alertEngine");
const INTERVAL_MS = 5 * 60 * 1000; // every 5 minutes
async function startAlertScheduler() {
    console.log('[alertScheduler] starting, interval=5min');
    async function tick() {
        try {
            await (0, alertEngine_1.runAlertScan)();
            const recent = await (0, alertEngine_1.getRecentAlerts)(1);
            if (recent.length > 0) {
                console.log(`[alertScheduler] last alert: ${recent[0].message}`);
            }
        }
        catch (err) {
            console.error('[alertScheduler] tick error:', err);
        }
    }
    await tick();
    setInterval(tick, INTERVAL_MS);
}
