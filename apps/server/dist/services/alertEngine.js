"use strict";
// apps/server/src/services/alertEngine.ts
//
// Alpha Alerts engine. Run periodically (e.g. every 60s via BullMQ repeatable
// job — see jobs/alertScan.ts) to scan recent indexed activity for:
//  - WHALE_ACCUMULATION / WHALE_LIQUIDATION: net holdings change crosses threshold in 1h
//  - TRAIT_SPIKE: trait-value demand (transfer volume) changes sharply
//  - FLOOR_CHANGE / RAPID_APPRECIATION: floor price delta (via marketDataProvider)
//  - HOLDER_BUY / HOLDER_SELL / REPUTATION_LEADER_MOVE: top-reputation wallets active
//
// New alerts are persisted to Alert and published on Redis channel
// "alerts:new" for the WebSocket server and notification dispatchers.
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAlertScan = runAlertScan;
exports.getRecentAlerts = getRecentAlerts;
const prisma_1 = require("../lib/prisma");
const redis_1 = require("../lib/redis");
const marketDataProvider_1 = require("./marketDataProvider");
const notificationDispatcher_1 = require("./notificationDispatcher");
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const WHALE_ACCUMULATION_THRESHOLD = 5; // net +N tokens in 1h
const WHALE_LIQUIDATION_THRESHOLD = -5; // net -N tokens in 1h
const TRAIT_SPIKE_PCT_THRESHOLD = 30; // % change in 1h demand
const FLOOR_CHANGE_PCT_THRESHOLD = 10; // % change since last check
const RAPID_APPRECIATION_PCT_THRESHOLD = 5; // % change within 1h = "rapid"
const REPUTATION_LEADER_TOP_N = 10;
async function createAlert(type, severity, message, payload) {
    const alert = await prisma_1.prisma.alert.create({
        data: { type, severity, message, payload },
    });
    const alertPayload = {
        id: alert.id,
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
        payload: alert.payload,
        createdAt: alert.createdAt.toISOString(),
    };
    await redis_1.redis.publish("alerts:new", JSON.stringify(alertPayload));
    (0, notificationDispatcher_1.dispatchAlert)(alertPayload).catch((err) => console.error('[alertEngine] dispatch failed:', err));
    return alert;
}
// ---- Whale Alerts ----
async function scanWhaleAlerts() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const transfers = await prisma_1.prisma.transfer.findMany({
        where: { timestamp: { gte: oneHourAgo } },
        select: { fromAddress: true, toAddress: true, tokenId: true },
    });
    const net = new Map();
    for (const t of transfers) {
        if (t.toAddress !== ZERO_ADDRESS)
            net.set(t.toAddress, (net.get(t.toAddress) ?? 0) + 1);
        if (t.fromAddress !== ZERO_ADDRESS)
            net.set(t.fromAddress, (net.get(t.fromAddress) ?? 0) - 1);
    }
    for (const [address, change] of net.entries()) {
        if (change >= WHALE_ACCUMULATION_THRESHOLD) {
            await createAlert("WHALE_ACCUMULATION", "warning", `Whale ${shortAddr(address)} acquired ${change} Normies in the last hour.`, { address, netChange: change, windowHours: 1 });
        }
        else if (change <= WHALE_LIQUIDATION_THRESHOLD) {
            await createAlert("WHALE_LIQUIDATION", "critical", `Whale ${shortAddr(address)} offloaded ${Math.abs(change)} Normies in the last hour.`, { address, netChange: change, windowHours: 1 });
        }
    }
}
// ---- Trait Alerts ----
async function scanTraitAlerts() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const recent = await prisma_1.prisma.transfer.findMany({
        where: { timestamp: { gte: oneHourAgo } },
        select: { tokenId: true },
    });
    const prior = await prisma_1.prisma.transfer.findMany({
        where: { timestamp: { gte: twoHoursAgo, lt: oneHourAgo } },
        select: { tokenId: true },
    });
    if (recent.length === 0)
        return;
    const recentCounts = await traitCounts(recent.map((t) => t.tokenId));
    const priorCounts = await traitCounts(prior.map((t) => t.tokenId));
    for (const [key, recentCount] of recentCounts.entries()) {
        const priorCount = priorCounts.get(key) ?? 0;
        if (priorCount === 0)
            continue; // avoid divide-by-zero noise on low-volume periods
        const pctChange = ((recentCount - priorCount) / priorCount) * 100;
        if (Math.abs(pctChange) >= TRAIT_SPIKE_PCT_THRESHOLD) {
            const [category, value] = key.split("::");
            const direction = pctChange > 0 ? "increased" : "decreased";
            await createAlert("TRAIT_SPIKE", "info", `${value} (${category}) trait demand ${direction} ${Math.abs(pctChange).toFixed(0)}% in the last hour.`, { category, value, recentCount, priorCount, pctChange });
        }
    }
}
async function traitCounts(tokenIds) {
    if (tokenIds.length === 0)
        return new Map();
    const traits = await prisma_1.prisma.trait.findMany({ where: { tokenId: { in: tokenIds } } });
    const counts = new Map();
    for (const t of traits) {
        const key = `${t.category}::${t.value}`;
        counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
}
// ---- Price Alerts ----
async function scanPriceAlerts() {
    const floor = await marketDataProvider_1.marketDataProvider.getFloor();
    if (!floor)
        return;
    const lastFloorRaw = await redis_1.redis.get("alerts:lastFloor");
    await redis_1.redis.set("alerts:lastFloor", String(floor.floorPriceEth), "EX", 60 * 60 * 24);
    if (!lastFloorRaw)
        return;
    const lastFloor = parseFloat(lastFloorRaw);
    if (lastFloor <= 0)
        return;
    const pctChange = ((floor.floorPriceEth - lastFloor) / lastFloor) * 100;
    if (Math.abs(pctChange) >= RAPID_APPRECIATION_PCT_THRESHOLD) {
        await createAlert("RAPID_APPRECIATION", "warning", `Floor ${pctChange > 0 ? "jumped" : "dropped"} ${Math.abs(pctChange).toFixed(1)}% to ${floor.floorPriceEth} ETH.`, { previousFloor: lastFloor, currentFloor: floor.floorPriceEth, pctChange });
    }
    else if (Math.abs(pctChange) >= FLOOR_CHANGE_PCT_THRESHOLD) {
        await createAlert("FLOOR_CHANGE", "info", `Floor changed ${pctChange > 0 ? "+" : ""}${pctChange.toFixed(1)}% to ${floor.floorPriceEth} ETH.`, { previousFloor: lastFloor, currentFloor: floor.floorPriceEth, pctChange });
    }
}
// ---- Holder Alerts ----
async function scanHolderAlerts() {
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentTransfers = await prisma_1.prisma.transfer.findMany({
        where: { timestamp: { gte: tenMinAgo } },
        select: { fromAddress: true, toAddress: true, tokenId: true },
    });
    if (recentTransfers.length === 0)
        return;
    const topReputation = await prisma_1.prisma.reputation.findMany({
        orderBy: { score: "desc" },
        take: REPUTATION_LEADER_TOP_N,
        include: { user: { include: { wallets: { select: { address: true } } } } },
    });
    const leaderAddresses = new Set(topReputation.flatMap((r) => r.user.wallets.map((w) => w.address)));
    for (const t of recentTransfers) {
        if (leaderAddresses.has(t.toAddress)) {
            await createAlert("HOLDER_BUY", "info", `Reputation leader ${shortAddr(t.toAddress)} acquired Normie #${t.tokenId}.`, { address: t.toAddress, tokenId: t.tokenId });
        }
        if (leaderAddresses.has(t.fromAddress)) {
            await createAlert("HOLDER_SELL", "warning", `Reputation leader ${shortAddr(t.fromAddress)} moved Normie #${t.tokenId}.`, { address: t.fromAddress, tokenId: t.tokenId });
        }
    }
}
function shortAddr(addr) {
    if (addr.length <= 10)
        return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
/** Run all alert scans once. Called by the alertScan job on a schedule. */
async function runAlertScan() {
    await Promise.all([
        scanWhaleAlerts(),
        scanTraitAlerts(),
        scanPriceAlerts(),
        scanHolderAlerts(),
    ]);
}
async function getRecentAlerts(limit = 50) {
    return prisma_1.prisma.alert.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
    });
}
