"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const redis_1 = require("../lib/redis");
const marketDataProvider_1 = require("../services/marketDataProvider");
const router = (0, express_1.Router)();
// GET /api/dashboard/stats
router.get('/stats', async (_req, res) => {
    try {
        const data = await (0, redis_1.cached)('dashboard:stats', 30, async () => {
            const now = new Date();
            const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const since1h = new Date(now.getTime() - 60 * 60 * 1000);
            const [floor, volume24h, uniqueHolders, transfers24h, activeWhales, latestAlert,] = await Promise.all([
                marketDataProvider_1.marketDataProvider.getFloor().catch(() => null),
                marketDataProvider_1.marketDataProvider.get24hVolumeEth().catch(() => null),
                prisma_1.prisma.wallet.count({ where: { ownerships: { some: { current: true } } } }),
                prisma_1.prisma.transfer.count({ where: { timestamp: { gte: since24h }, NOT: { fromAddress: '0x0000000000000000000000000000000000000000' } } }),
                prisma_1.prisma.wallet.count({ where: { isWhale: true, lastActive: { gte: since24h } } }),
                prisma_1.prisma.alert.findFirst({ orderBy: { createdAt: 'desc' }, select: { message: true } }),
            ]);
            // Floor 24h change — compare to snapshot 24h ago
            let floorChange24h = null;
            const snap = await prisma_1.prisma.historicalSnapshot.findFirst({
                where: { date: { lte: since24h } },
                orderBy: { date: 'desc' },
                select: { floorPriceEth: true },
            }).catch(() => null);
            if (floor?.floorPriceEth && snap?.floorPriceEth) {
                floorChange24h = ((floor.floorPriceEth - snap.floorPriceEth) / snap.floorPriceEth) * 100;
            }
            return {
                floorPriceEth: floor?.floorPriceEth ?? null,
                floorChange24h,
                volume24hEth: volume24h,
                uniqueHolders,
                activeWhales,
                totalTransfers24h: transfers24h,
                topAlert: latestAlert?.message ?? null,
            };
        });
        res.json(data);
    }
    catch (err) {
        console.error('[dashboard/stats]', err);
        res.status(500).json({ error: 'Failed to load stats' });
    }
});
exports.default = router;
