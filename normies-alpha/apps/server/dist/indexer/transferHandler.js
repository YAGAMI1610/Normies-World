"use strict";
// apps/server/src/indexer/transferHandler.ts
//
// Shared logic for processing a single ERC-721 Transfer event into our
// Postgres model: upserts Wallet rows, closes out the previous
// NormieOwnership record, opens a new one, and writes the Transfer log.
// Used by both the live watcher (transferWatcher.ts) and the historical
// backfill (backfill.ts).
Object.defineProperty(exports, "__esModule", { value: true });
exports.processTransfer = processTransfer;
const prisma_1 = require("../lib/prisma");
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
async function processTransfer(evt) {
    const { tokenId, from, to, blockNumber, txHash, timestamp } = evt;
    const fromAddr = from.toLowerCase();
    const toAddr = to.toLowerCase();
    // Idempotency: skip if we've already recorded this tx for this token.
    const existing = await prisma_1.prisma.transfer.findUnique({ where: { txHash } });
    if (existing)
        return;
    await prisma_1.prisma.$transaction(async (tx) => {
        // Ensure the Normie row exists.
        await tx.normie.upsert({
            where: { tokenId },
            create: { tokenId, ownerAddress: toAddr },
            update: { ownerAddress: toAddr },
        });
        // Ensure wallet rows exist for both parties (skip the zero address).
        let toWalletId = null;
        let fromWalletId = null;
        if (toAddr !== ZERO_ADDRESS) {
            const toWallet = await tx.wallet.upsert({
                where: { address: toAddr },
                create: { address: toAddr },
                update: { lastActive: timestamp },
            });
            toWalletId = toWallet.id;
        }
        if (fromAddr !== ZERO_ADDRESS) {
            const fromWallet = await tx.wallet.upsert({
                where: { address: fromAddr },
                create: { address: fromAddr },
                update: { lastActive: timestamp },
            });
            fromWalletId = fromWallet.id;
        }
        // Close out the previous ownership record (if any).
        if (fromAddr !== ZERO_ADDRESS) {
            await tx.normieOwnership.updateMany({
                where: { tokenId, current: true },
                data: { current: false, releasedAt: timestamp },
            });
        }
        // Open a new ownership record (skip if burned to zero address).
        if (toAddr !== ZERO_ADDRESS && toWalletId) {
            await tx.normieOwnership.create({
                data: {
                    tokenId,
                    walletId: toWalletId,
                    acquiredAt: timestamp,
                    acquiredTx: txHash,
                    current: true,
                },
            });
        }
        // Record the transfer itself.
        await tx.transfer.create({
            data: {
                tokenId,
                fromAddress: fromAddr,
                toAddress: toAddr,
                fromWalletId,
                toWalletId,
                blockNumber,
                txHash,
                timestamp,
            },
        });
    });
}
