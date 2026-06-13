"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// apps/server/src/routes/battle.ts
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const redis_1 = require("../lib/redis");
const normiesApiClient_1 = require("../services/normiesApiClient");
const cardGenEngine_1 = require("../services/cardGenEngine");
const router = (0, express_1.Router)();
// GET /api/battle/leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const data = await (0, redis_1.cached)(`battle:leaderboard:${limit}`, 30, async () => {
            const stats = await prisma_1.prisma.battleStats.findMany({
                orderBy: { elo: 'desc' },
                take: limit,
                include: { user: { select: { primaryWallet: true } } },
            });
            return stats.map((s, i) => ({
                userId: s.userId,
                whaleAddress: s.user?.primaryWallet ?? '0x???',
                elo: s.elo,
                wins: s.wins,
                losses: s.losses,
                winStreak: s.winStreak,
                rank: i + 1,
            }));
        });
        res.json(data);
    }
    catch (err) {
        console.error('[battle/leaderboard]', err);
        res.status(500).json({ error: 'Failed to load leaderboard' });
    }
});
// GET /api/battle/my-cards — returns battle cards for connected wallet's Normies
router.get('/my-cards', async (req, res) => {
    try {
        if (!req.whaleAddress) {
            return res.status(401).json({ error: 'Wallet not connected' });
        }
        const address = req.whaleAddress.toLowerCase();
        // Get tokenIds from Normies API
        let tokenIds = [];
        try {
            const holders = await normiesApiClient_1.normiesApi.holders(address);
            tokenIds = holders.tokenIds.map(Number).slice(0, 50); // cap at 50 cards
        }
        catch {
            // Fallback to DB if API unavailable
            const ownerships = await prisma_1.prisma.normieOwnership.findMany({
                where: {
                    wallet: { address },
                    current: true,
                },
                select: { tokenId: true },
                take: 50,
            });
            tokenIds = ownerships.map(o => o.tokenId);
        }
        if (tokenIds.length === 0) {
            return res.json([]);
        }
        // Generate/retrieve battle cards for each token
        const cards = await Promise.all(tokenIds.map(async (tokenId) => {
            let card;
            try {
                card = await (0, cardGenEngine_1.getOrCreateBattleCard)(tokenId);
            }
            catch {
                return {
                    tokenId,
                    name: `Normie #${tokenId}`,
                    imageUrl: normiesApiClient_1.normiesApi.imagePngUrl(tokenId),
                    rarityRank: null,
                    rarityTier: 'Common',
                    attack: 50,
                    defense: 50,
                    speed: 50,
                    ability: 'Normie Strike',
                    abilityDescription: 'A basic attack.',
                    traits: {},
                    owned: true,
                };
            }
            return {
                tokenId: card.tokenId,
                name: card.name,
                imageUrl: card.imageUrl,
                rarityRank: card.rarityRank ?? null,
                rarityTier: card.rarityTier,
                attack: card.attack,
                defense: card.defense,
                speed: card.speed,
                ability: card.specialAbility,
                abilityDescription: card.abilityDescription,
                traits: {},
                owned: true,
            };
        }));
        res.json(cards);
    }
    catch (err) {
        console.error('[battle/my-cards]', err);
        res.status(500).json({ error: 'Failed to load cards' });
    }
});
// GET /api/battle/card/:tokenId — public card data
router.get('/card/:tokenId', async (req, res) => {
    try {
        const tokenId = parseInt(req.params.tokenId);
        if (isNaN(tokenId) || tokenId < 0 || tokenId > 9999) {
            return res.status(400).json({ error: 'Invalid tokenId' });
        }
        const card = await (0, cardGenEngine_1.getOrCreateBattleCard)(tokenId);
        // Check ownership
        let owned = false;
        const ownerData = await normiesApiClient_1.normiesApi.owner(tokenId).catch(() => null);
        if (ownerData) {
            const authReq = req;
            owned = !!(authReq.whaleAddress &&
                ownerData.owner.toLowerCase() === authReq.whaleAddress.toLowerCase());
        }
        res.json({
            tokenId: card.tokenId,
            name: card.name,
            imageUrl: card.imageUrl,
            rarityRank: card.rarityRank ?? null,
            rarityTier: card.rarityTier,
            attack: card.attack,
            defense: card.defense,
            speed: card.speed,
            ability: card.specialAbility,
            abilityDescription: card.abilityDescription,
            traits: {},
            owned,
        });
    }
    catch (err) {
        console.error('[battle/card]', err);
        res.status(500).json({ error: 'Failed to load card' });
    }
});
// POST /api/battle/matchmake — find or create a match
router.post('/matchmake', async (req, res) => {
    try {
        const { mode = 'CASUAL' } = req.body;
        if (!req.userId)
            return res.status(401).json({ error: 'Unauthorized' });
        // Ensure user has battle stats
        await prisma_1.prisma.battleStats.upsert({
            where: { userId: req.userId },
            update: {},
            create: { userId: req.userId },
        });
        // Look for an open match in the queue
        const openMatch = await prisma_1.prisma.match.findFirst({
            where: {
                mode,
                endedAt: null,
                player2Id: { equals: req.userId }, // waiting for opponent
                NOT: { player1Id: req.userId },
            },
        });
        if (openMatch) {
            // Join as player 2
            const match = await prisma_1.prisma.match.update({
                where: { id: openMatch.id },
                data: { player2Id: req.userId },
            });
            return res.json({ matchId: match.id, role: 'player2', status: 'ready' });
        }
        // Create new match waiting for opponent
        const match = await prisma_1.prisma.match.create({
            data: {
                mode,
                player1Id: req.userId,
                player2Id: req.userId, // temporary self-reference until opponent joins
                state: { phase: 'waiting', turns: [] },
            },
        });
        res.json({ matchId: match.id, role: 'player1', status: 'waiting' });
    }
    catch (err) {
        console.error('[battle/matchmake]', err);
        res.status(500).json({ error: 'Matchmaking failed' });
    }
});
exports.default = router;
