"use strict";
// apps/server/src/indexer/snapshotJob.ts
//
// Reconstructs point-in-time collection state for the Time Machine feature
// by replaying indexed Transfer events up to a given date. Runs as a daily
// cron-style job (via setInterval here; swap for BullMQ repeatable job in
// production) and can also be invoked on-demand for an arbitrary date that
// hasn't been snapshotted yet.
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSnapshot = buildSnapshot;
exports.snapshotForDate = snapshotForDate;
exports.scheduleSnapshotJob = scheduleSnapshotJob;
const prisma_1 = require("../lib/prisma");
const marketDataProvider_1 = require("../services/marketDataProvider");
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
/**
 * Reconstruct ownership as of `asOf` by replaying all Transfer rows with
 * timestamp <= asOf, tracking the latest owner per tokenId.
 */
async function reconstructOwnership(asOf) {
    const transfers = await prisma_1.prisma.transfer.findMany({
        where: { timestamp: { lte: asOf } },
        orderBy: { timestamp: "asc" },
        select: { tokenId: true, toAddress: true, fromAddress: true },
    });
    const ownerOf = new Map();
    for (const t of transfers) {
        if (t.toAddress === ZERO_ADDRESS) {
            ownerOf.delete(t.tokenId); // burned
        }
        else {
            ownerOf.set(t.tokenId, t.toAddress);
        }
    }
    return ownerOf;
}
async function buildSnapshot(asOf) {
    const ownerOf = await reconstructOwnership(asOf);
    // Holder count = distinct addresses.
    const holderCounts = new Map();
    for (const owner of ownerOf.values()) {
        holderCounts.set(owner, (holderCounts.get(owner) ?? 0) + 1);
    }
    const holderCount = holderCounts.size;
    // Whale leaderboard (top 10 by holdings at this point in time).
    const whaleLeaderboard = Array.from(holderCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([address, holdings], idx) => ({ address, holdings, rank: idx + 1 }));
    // Ownership distribution buckets.
    const buckets = [
        { label: "1", min: 1, max: 1 },
        { label: "2-5", min: 2, max: 5 },
        { label: "6-20", min: 6, max: 20 },
        { label: "21-50", min: 21, max: 50 },
        { label: "51+", min: 51, max: Infinity },
    ];
    const ownershipDistribution = buckets.map((b) => {
        let walletCount = 0;
        let tokenCount = 0;
        for (const count of holderCounts.values()) {
            if (count >= b.min && count <= b.max) {
                walletCount += 1;
                tokenCount += count;
            }
        }
        return { bucket: b.label, walletCount, tokenCount };
    });
    // Top traits among currently-held tokens at this point in time.
    const heldTokenIds = Array.from(ownerOf.keys());
    let topTraits = [];
    if (heldTokenIds.length > 0) {
        const traits = await prisma_1.prisma.trait.findMany({
            where: { tokenId: { in: heldTokenIds } },
        });
        const counts = new Map();
        for (const t of traits) {
            const key = `${t.category}::${t.value}`;
            counts.set(key, (counts.get(key) ?? 0) + 1);
        }
        topTraits = Array.from(counts.entries())
            .map(([key, count]) => {
            const [category, value] = key.split("::");
            return { category, value, count };
        })
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }
    // Transaction volume up to this date (count of transfers as a proxy if no
    // sales data is available for the period).
    const volumeEth = await (async () => {
        const sales = await prisma_1.prisma.sale.aggregate({
            where: { timestamp: { lte: asOf } },
            _sum: { priceEth: true },
        });
        return sales._sum.priceEth ?? null;
    })();
    // Floor price: only available for "today" via the live market data
    // provider; historical floor requires a price-history feed we don't have,
    // so we report null for past dates (honest > fabricated).
    const isToday = asOf.toDateString() === new Date().toDateString();
    const floorPriceEth = isToday
        ? (await marketDataProvider_1.marketDataProvider.getFloor())?.floorPriceEth ?? null
        : null;
    return {
        date: asOf.toISOString(),
        holderCount,
        floorPriceEth,
        volumeEth,
        topTraits,
        whaleLeaderboard,
        ownershipDistribution,
    };
}
async function snapshotForDate(date) {
    const dayStart = new Date(date);
    dayStart.setUTCHours(23, 59, 59, 999); // end-of-day snapshot
    const existing = await prisma_1.prisma.historicalSnapshot.findUnique({
        where: { date: dayStart },
    });
    if (existing) {
        return {
            date: existing.date.toISOString(),
            holderCount: existing.holderCount,
            floorPriceEth: existing.floorPriceEth,
            volumeEth: existing.volumeEth,
            topTraits: existing.topTraits,
            whaleLeaderboard: existing.whaleLeaderboard,
            ownershipDistribution: existing.ownershipDistribution,
        };
    }
    const snapshot = await buildSnapshot(dayStart);
    await prisma_1.prisma.historicalSnapshot.create({
        data: {
            date: dayStart,
            holderCount: snapshot.holderCount,
            floorPriceEth: snapshot.floorPriceEth,
            volumeEth: snapshot.volumeEth,
            topTraits: snapshot.topTraits,
            whaleLeaderboard: snapshot.whaleLeaderboard,
            ownershipDistribution: snapshot.ownershipDistribution,
        },
    });
    return snapshot;
}
/** Schedules a daily snapshot for "today" (end of day). Call once from indexer entrypoint. */
function scheduleSnapshotJob() {
    const runDaily = async () => {
        try {
            await snapshotForDate(new Date());
            console.log("[snapshotJob] daily snapshot complete");
        }
        catch (err) {
            console.error("[snapshotJob] failed:", err);
        }
    };
    // Run once at startup, then every 24h.
    runDaily();
    setInterval(runDaily, 24 * 60 * 60 * 1000);
}
