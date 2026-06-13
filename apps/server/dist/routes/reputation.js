"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const redis_1 = require("../lib/redis");
const reputationEngine_1 = require("../services/reputationEngine");
const router = (0, express_1.Router)();
// GET /api/reputation/leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const data = await (0, redis_1.cached)(`reputation:leaderboard:${limit}`, 120, async () => {
            const reputations = await prisma_1.prisma.reputation.findMany({
                orderBy: { score: 'desc' },
                take: limit,
                include: { user: { select: { primaryWallet: true } } },
            });
            return reputations.map((r, i) => ({
                userId: r.userId,
                whaleAddress: r.user?.primaryWallet ?? '0x???',
                score: r.score,
                level: r.level,
                xp: r.xp,
                badges: r?.badges,
                rank: i + 1,
            }));
        });
        res.json(data);
    }
    catch (err) {
        console.error('[reputation/leaderboard]', err);
        res.status(500).json({ error: 'Failed to load leaderboard' });
    }
});
// GET /api/reputation/profile/:whaleAddress
router.get('/profile/:whaleAddress', async (req, res) => {
    try {
        const address = req.params.whaleAddress.toLowerCase();
        const user = await prisma_1.prisma.user.findFirst({
            where: { primaryWallet: address },
            include: { reputation: true },
        });
        if (!user) {
            return res.status(404).json({ error: 'Profile not found. Connect your wallet to create one.' });
        }
        if (!user.reputation) {
            // Trigger calculation on first access
            await (0, reputationEngine_1.recalculateReputation)(user.id);
            const fresh = await prisma_1.prisma.reputation.findUnique({ where: { userId: user.id } });
            if (!fresh)
                return res.json({ userId: user.id, whaleAddress: address, score: 0, level: 1, xp: 0, badges: [], rank: null });
        }
        // Get rank
        const rank = await prisma_1.prisma.reputation.count({
            where: { score: { gt: user.reputation?.score ?? 0 } },
        });
        res.json({
            userId: user.id,
            whaleAddress: address,
            score: user.reputation?.score ?? 0,
            level: user.reputation?.level ?? 1,
            xp: user.reputation?.xp ?? 0,
            badges: user.reputation?.badges ?? [],
            rank: rank + 1,
        });
    }
    catch (err) {
        console.error('[reputation/profile]', err);
        res.status(500).json({ error: 'Failed to load profile' });
    }
});
exports.default = router;
