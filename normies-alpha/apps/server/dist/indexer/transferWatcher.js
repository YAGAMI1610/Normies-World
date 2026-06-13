"use strict";
// apps/server/src/indexer/transferWatcher.ts
//
// Live subscription to ERC-721 Transfer events on the Normies contract.
// Each event is processed into Postgres via processTransfer(), and a
// lightweight payload is pushed onto a Redis pub/sub channel
// ("indexer:transfers") so the alert engine and WebSocket server can react
// in real time without re-querying the chain.
Object.defineProperty(exports, "__esModule", { value: true });
exports.startTransferWatcher = startTransferWatcher;
const contracts_1 = require("@normies-alpha/contracts");
const chain_1 = require("./chain");
const transferHandler_1 = require("./transferHandler");
const redis_1 = require("../lib/redis");
function startTransferWatcher() {
    console.log(`[indexer] watching Transfer events on ${process.env.NORMIES_CONTRACT_ADDRESS}`);
    const unwatch = chain_1.publicClient.watchContractEvent({
        address: process.env.NORMIES_CONTRACT_ADDRESS,
        abi: contracts_1.erc721TransferAbi,
        eventName: "Transfer",
        onLogs: async (logs) => {
            for (const log of logs) {
                try {
                    const { from, to, tokenId } = log.args;
                    const block = await chain_1.publicClient.getBlock({
                        blockNumber: log.blockNumber,
                    });
                    const evt = {
                        tokenId: Number(tokenId),
                        from,
                        to,
                        blockNumber: log.blockNumber,
                        txHash: log.transactionHash,
                        timestamp: new Date(Number(block.timestamp) * 1000),
                    };
                    await (0, transferHandler_1.processTransfer)(evt);
                    await redis_1.redis.publish("indexer:transfers", JSON.stringify({
                        tokenId: evt.tokenId,
                        from: evt.from.toLowerCase(),
                        to: evt.to.toLowerCase(),
                        txHash: evt.txHash,
                        timestamp: evt.timestamp.toISOString(),
                    }));
                    console.log(`[indexer] Transfer #${evt.tokenId}: ${evt.from} -> ${evt.to} (${evt.txHash})`);
                }
                catch (err) {
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
