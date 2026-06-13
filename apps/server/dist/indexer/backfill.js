"use strict";
// apps/server/src/indexer/backfill.ts
//
// One-time (or resumable) historical scan of ERC-721 Transfer logs for the
// Normies contract, from NORMIES_DEPLOY_BLOCK to the current head. Powers
// the Time Machine's ownership reconstruction. Chunked to respect RPC log
// range limits (default 5,000 blocks per request — adjust per provider).
Object.defineProperty(exports, "__esModule", { value: true });
exports.runBackfill = runBackfill;
const contracts_1 = require("@normies-alpha/contracts");
const chain_1 = require("./chain");
const transferHandler_1 = require("./transferHandler");
const prisma_1 = require("../lib/prisma");
const CHUNK_SIZE = 5000n;
async function getBackfillCursor() {
    // Resume from the highest block we've already indexed, or the deploy block.
    const latest = await prisma_1.prisma.transfer.findFirst({
        orderBy: { blockNumber: "desc" },
        select: { blockNumber: true },
    });
    if (latest)
        return latest.blockNumber + 1n;
    return BigInt(process.env.NORMIES_DEPLOY_BLOCK ?? 0);
}
async function runBackfill(toBlock) {
    const head = toBlock ?? (await chain_1.publicClient.getBlockNumber());
    let from = await getBackfillCursor();
    console.log(`[backfill] starting from block ${from} to ${head}`);
    while (from <= head) {
        const to = from + CHUNK_SIZE - 1n > head ? head : from + CHUNK_SIZE - 1n;
        const logs = await chain_1.publicClient.getLogs({
            address: process.env.NORMIES_CONTRACT_ADDRESS,
            event: contracts_1.erc721TransferAbi[0],
            fromBlock: from,
            toBlock: to,
        });
        if (logs.length > 0) {
            console.log(`[backfill] blocks ${from}-${to}: ${logs.length} transfers`);
        }
        for (const log of logs) {
            const { from: fromAddr, to: toAddr, tokenId } = log.args;
            const block = await chain_1.publicClient.getBlock({ blockNumber: log.blockNumber });
            await (0, transferHandler_1.processTransfer)({
                tokenId: Number(tokenId),
                from: fromAddr,
                to: toAddr,
                blockNumber: log.blockNumber,
                txHash: log.transactionHash,
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
