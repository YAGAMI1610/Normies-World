// apps/server/src/indexer/transferWatcher.ts
//
// Live subscription to ERC-721 Transfer events on the Normies contract.
// Each event is processed into Postgres via processTransfer(), and a
// lightweight payload is pushed onto a Redis pub/sub channel
// ("indexer:transfers") so the alert engine and WebSocket server can react
// in real time without re-querying the chain.

import { erc721TransferAbi } from "@normies-alpha/contracts";
import { publicClient } from "./chain";
import { processTransfer } from "./transferHandler";
import { env } from "../lib/env";
import { redis } from "../lib/redis";

export function startTransferWatcher(): () => void {
  console.log(
    `[indexer] watching Transfer events on ${env.NORMIES_CONTRACT_ADDRESS}`
  );

  const unwatch = publicClient.watchContractEvent({
    address: env.NORMIES_CONTRACT_ADDRESS as `0x${string}`,
    abi: erc721TransferAbi,
    eventName: "Transfer",
    onLogs: async (logs) => {
      for (const log of logs) {
        try {
          const { from, to, tokenId } = log.args as {
            from: string;
            to: string;
            tokenId: bigint;
          };

          const block = await publicClient.getBlock({
            blockNumber: log.blockNumber!,
          });

          const evt = {
            tokenId: Number(tokenId),
            from,
            to,
            blockNumber: log.blockNumber!,
            txHash: log.transactionHash!,
            timestamp: new Date(Number(block.timestamp) * 1000),
          };

          await processTransfer(evt);

          await redis.publish(
            "indexer:transfers",
            JSON.stringify({
              tokenId: evt.tokenId,
              from: evt.from.toLowerCase(),
              to: evt.to.toLowerCase(),
              txHash: evt.txHash,
              timestamp: evt.timestamp.toISOString(),
            })
          );

          console.log(
            `[indexer] Transfer #${evt.tokenId}: ${evt.from} -> ${evt.to} (${evt.txHash})`
          );
        } catch (err) {
          console.error("[indexer] failed to process transfer log:", err);
        }
      }
    },
    onError: (err) => {
      console.error("[indexer] watcher error:", err);
    },
  });

  return unwatch;
}
