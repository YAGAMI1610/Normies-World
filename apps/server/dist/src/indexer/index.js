"use strict";
// apps/server/src/indexer/index.ts
//
// Standalone indexer process entry point. Run separately from the API
// server (e.g. as its own Railway service / Docker container):
//   npm run start:indexer
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const backfill_1 = require("./backfill");
const transferWatcher_1 = require("./transferWatcher");
const snapshotJob_1 = require("./snapshotJob");
const traitSync_1 = require("./traitSync");
async function main() {
    console.log("[indexer] starting...");
    // 1. One-time (resumable) sync of trait data for all 10,000 tokens from
    //    the Normies API, used for rarity scoring.
    await (0, traitSync_1.syncAllTraits)();
    // 2. Backfill historical Transfer logs from chain deployment to head.
    await (0, backfill_1.runBackfill)();
    // 3. Start live event subscription.
    (0, transferWatcher_1.startTransferWatcher)();
    // 4. Schedule the daily historical snapshot job (Time Machine data).
    (0, snapshotJob_1.scheduleSnapshotJob)();
    console.log("[indexer] running.");
}
main().catch((err) => {
    console.error("[indexer] fatal error:", err);
    process.exit(1);
});
