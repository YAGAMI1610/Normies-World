// apps/server/src/indexer/backfill.ts
//
// One-time (or resumable) historical scan of ERC-721 Transfer logs for the
// Normies contract, from NORMIES_DEPLOY_BLOCK to the current head. Powers
// the Time Machine's ownership reconstruction. Chunked to respect RPC log
// range limits (default 5,000 blocks per request — adjust per provider).

import { erc721TransferAbi } from "@normies-alpha/contracts";
import { publicClient } from "./chain";
import { processTransfer } from "./transferHandler";
import { prisma } from "../lib/prisma";

const CHUNK_SIZE = 5_000n;

async function getBackfillCursor(): Promise<bigint> {
  // Resume from the highest block we've already indexed, or the deploy block.
  const latest = await prisma.transfer.findFirst({
    orderBy: { blockNumber: "desc" },
    select: { blockNumber: true },
  });
  if (latest) return latest.blockNumber + 1n;
  return BigInt(process.env.NORMIES_DEPLOY_BLOCK ?? 0);
}

export async function runBackfill(toBlock?: bigint): Promise<void> {
  const head = toBlock ?? (await publicClient.getBlockNumber());
  let from = await getBackfillCursor();

  console.log(`[backfill] starting from block ${from} to ${head}`);

  while (from <= head) {
    const to = from + CHUNK_SIZE - 1n > head ? head : from + CHUNK_SIZE - 1n;

    const logs = await publicClient.getLogs({
      address: process.env.NORMIES_CONTRACT_ADDRESS as `0x${string}`,
      event: erc721TransferAbi[0],
      fromBlock: from,
      toBlock: to,
    });

    if (logs.length > 0) {
      console.log(`[backfill] blocks ${from}-${to}: ${logs.length} transfers`);
    }

    for (const log of logs) {
      const { from: fromAddr, to: toAddr, tokenId } = log.args as {
        from: string;
        to: string;
        tokenId: bigint;
      };

      const block = await publicClient.getBlock({ blockNumber: log.blockNumber! });

      await processTransfer({
        tokenId: Number(tokenId),
        from: fromAddr,
        to: toAddr,
        blockNumber: log.blockNumber!,
        txHash: log.transactionHash!,
        timestamp: new Date(Number(block.timestamp) * 1000),
      });
    }

    from = to + 1n;
  }

  console.log(`[backfill] complete — indexed up to block ${head}`);
}

if (require.main === module) {
  runBackfill()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[backfill] failed:", err);
      process.exit(1);
    });
}
