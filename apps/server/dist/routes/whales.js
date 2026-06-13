"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const redis_1 = require("../lib/redis");
const auth_1 = __importStar(require("../middleware/auth"));
const router = (0, express_1.Router)();
router.use(auth_1.optionalAuth);
// GET /api/whales?limit=20
router.get('/', async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const data = await (0, redis_1.cached)(`whales:list:${limit}`, 60, async () => {
            const wallets = await prisma_1.prisma.wallet.findMany({
                where: { isWhale: true },
                orderBy: { whaleScore: 'desc' },
                take: limit,
                include: {
                    ownerships: { where: { current: true } },
                },
            });
            return wallets.map(w => ({
                address: w.address,
                whaleScore: w.whaleScore ?? 0,
                holdingsCount: w.ownerships.length,
                avgHoldDurationDays: calculateAvgHold(w.ownerships),
                rarityTier: getRarityTier(w.ownerships),
                followed: false, // populated per-user below
            }));
        });
        // Personalize follow status if authenticated
        if (req.userId) {
            const follows = await prisma_1.prisma.whaleFollow.findMany({
                where: { userId: req.userId },
                select: { whaleAddress: true },
            });
            const followedSet = new Set(follows.map(f => f.whaleAddress));
            return res.json(data.map((w) => ({ ...w, followed: followedSet.has(w.address) })));
        }
        res.json(data);
    }
    catch (err) {
        console.error('[whales]', err);
        res.status(500).json({ error: 'Failed to load whales' });
    }
});
// GET /api/whales/:address
router.get('/:address', async (req, res) => {
    try {
        const address = req.params.address.toLowerCase();
        const wallet = await prisma_1.prisma.wallet.findUnique({
            where: { address },
            include: {
                ownerships: {
                    where: { current: true },
                    include: { normie: { include: { traits: true } } },
                    orderBy: { acquiredAt: 'desc' },
                    take: 20,
                },
            },
        });
        if (!wallet)
            return res.status(404).json({ error: 'Whale not found' });
        res.json({
            address: wallet.address,
            whaleScore: wallet.whaleScore ?? 0,
            holdingsCount: wallet.ownerships.length,
            avgHoldDurationDays: calculateAvgHold(wallet.ownerships),
            rarityTier: getRarityTier(wallet.ownerships),
            recentAcquisitions: wallet.ownerships.slice(0, 10).map(o => ({
                tokenId: o.tokenId,
                acquiredAt: o.acquiredAt,
            })),
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to load whale detail' });
    }
});
// POST /api/whales/:address/follow
router.post('/:address/follow', auth_1.default, async (req, res) => {
    try {
        await prisma_1.prisma.whaleFollow.upsert({
            where: { userId_whaleAddress: { userId: req.userId, whaleAddress: req.params.address.toLowerCase() } },
            update: {},
            create: { userId: req.userId, whaleAddress: req.params.address.toLowerCase() },
        });
        res.json({ ok: true });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to follow whale' });
    }
});
// DELETE /api/whales/:address/follow
router.delete('/:address/follow', auth_1.default, async (req, res) => {
    try {
        await prisma_1.prisma.whaleFollow.deleteMany({
            where: { userId: req.userId, whaleAddress: req.params.address.toLowerCase() },
        });
        res.json({ ok: true });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to unfollow' });
    }
});
// GET /api/whales/:address/similarity
router.get('/:address/similarity', async (req, res) => {
    try {
        // Simple similarity: find whales with closest avg hold + holding count
        const address = req.params.address.toLowerCase();
        const wallet = await prisma_1.prisma.wallet.findUnique({ where: { address }, include: { ownerships: { where: { current: true } } } });
        if (!wallet)
            return res.status(404).json({ error: 'Not found' });
        const myHold = calculateAvgHold(wallet.ownerships);
        const myCount = wallet.ownerships.length;
        const whales = await prisma_1.prisma.wallet.findMany({
            where: { isWhale: true, NOT: { address } },
            include: { ownerships: { where: { current: true } } },
            take: 50,
        });
        let bestScore = -1;
        let closestWhale = null;
        for (const w of whales) {
            const hold = calculateAvgHold(w.ownerships);
            const count = w.ownerships.length;
            // Normalize differences
            const holdDiff = Math.abs(myHold - hold) / (Math.max(myHold, hold, 1));
            const countDiff = Math.abs(myCount - count) / (Math.max(myCount, count, 1));
            const score = 100 * (1 - (holdDiff + countDiff) / 2);
            if (score > bestScore) {
                bestScore = score;
                closestWhale = w;
            }
        }
        res.json({
            score: Math.round(bestScore),
            closestWhale: closestWhale ? {
                address: closestWhale.address,
                whaleScore: closestWhale.whaleScore ?? 0,
                holdingsCount: closestWhale.ownerships.length,
                avgHoldDurationDays: calculateAvgHold(closestWhale.ownerships),
                rarityTier: getRarityTier(closestWhale.ownerships),
                followed: false,
            } : null,
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Similarity computation failed' });
    }
});
function calculateAvgHold(ownerships) {
    if (!ownerships.length)
        return 0;
    const now = Date.now();
    const totalDays = ownerships.reduce((s, o) => s + (now - o.acquiredAt.getTime()) / 86_400_000, 0);
    return totalDays / ownerships.length;
}
function getRarityTier(ownerships) {
    if (!ownerships.length)
        return 'Unknown';
    const avgRank = ownerships.reduce((s, o) => s + (o.normie?.rarityRank ?? 5000), 0) / ownerships.length;
    if (avgRank <= 500)
        return 'Legendary';
    if (avgRank <= 1000)
        return 'Epic';
    if (avgRank <= 3000)
        return 'Rare';
    return 'Common';
}
exports.default = router;
