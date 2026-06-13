// apps/server/src/indexer/index.ts
//
// Standalone indexer process entry point. Run separately from the API
// server (e.g. as its own Railway service / Docker container):
//   npm run start:indexer

import 'dotenv/config';
import { runBackfill } from "./backfill";
import { startTransferWatcher } from "./transferWatcher";
import { scheduleSnapshotJob } from "./snapshotJob";
import { syncAllTraits } from "./traitSync";

async function main() {
  console.log("[indexer] starting...");

  // 1. One-time (resumable) sync of trait data for all 10,000 tokens from
  //    the Normies API, used for rarity scoring.
  await syncAllTraits();

  // 2. Backfill historical Transfer logs from chain deployment to head.
  await runBackfill();

  // 3. Start live event subscription.
  startTransferWatcher();

  // 4. Schedule the daily historical snapshot job (Time Machine data).
  scheduleSnapshotJob();

  console.log("[indexer] running.");
}

main().catch((err) => {
  console.error("[indexer] fatal error:", err);
  process.exit(1);
});
