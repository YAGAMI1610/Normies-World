"use strict";
// apps/server/src/services/reputationEngine.ts
//
// On-chain reputation engine. For each User (identified by primaryWallet),
// computes a composite Reputation score from:
//  - holding duration (avg days held across current holdings)
//  - rare Normies owned (count of tokens in top 5% rarityRank)
//  - collection value (holdings * floor price, when available)
//  - trading performance (realized gains from Sale as seller)
//  - whale activity (whaleScore of their primary wallet)
//  - battle performance (BattleStats.elo)
//
// XP/Level: XP accumulates from score deltas + battle wins; level 1-100
// follows a smooth curve (level = floor(sqrt(xp / 50)) + 1, capped at 100).
//
// Badges are (re)evaluated on every recalculation.
Object.defineProperty(exports, "__esModule", { value: true });
exports.recalculateReputation = recalculateReputation;
exports.getReputationByAddress = getReputationByAddress;
exports.getReputationLeaderboard = getReputationLeaderboard;
const prisma_1 = require("../lib/prisma");
const marketDataProvider_1 = require("./marketDataProvider");
const RARE_RANK_THRESHOLD = 500; // top 5% of 10,000
function xpForLevel(level) {
    // Inverse of level = floor(sqrt(xp/50)) + 1  =>  xp = 50 * (level-1)^2
    return 50 * Math.pow(level - 1, 2);
}
function levelForXp(xp) {
    const level = Math.floor(Math.sqrt(xp / 50)) + 1;
    return Math.min(100, Math.max(1, level));
}
async function recalculateReputation(userId) {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        include: {
            wallets: {
                include: {
                    ownerships: { where: { current: true }, include: { normie: true } },
                },
            },
            battleStats: true,
        },
    });
    if (!user)
        return null;
    const now = Date.now();
    // Aggregate across all linked wallets.
    let totalHoldDays = 0;
    let holdingsCount = 0;
    let rareCount = 0;
    for (const wallet of user.wallets) {
        for (const o of wallet.ownerships) {
            holdingsCount++;
            totalHoldDays += (now - o.acquiredAt.getTime()) / (1000 * 60 * 60 * 24);
            if (o.normie.rarityRank != null && o.normie.rarityRank <= RARE_RANK_THRESHOLD) {
                rareCount++;
            }
        }
    }
    const avgHoldDays = holdingsCount > 0 ? totalHoldDays / holdingsCount : 0;
    // Collection value via floor price (degrades to 0 if unavailable).
    const floor = await marketDataProvider_1.marketDataProvider.getFloor();
    const collectionValueEth = floor ? floor.floorPriceEth * holdingsCount : 0;
    // Trading performance: realized gains as seller across all linked wallets.
    const whaleAddresses = user.wallets.map((w) => w.address);
    const sales = await prisma_1.prisma.sale.findMany({
        where: { seller: { in: whaleAddresses } },
    });
    const realizedGainsEth = sales.reduce((sum, s) => sum + s.priceEth, 0);
    // Whale activity: max whaleScore across linked wallets.
    const whaleScores = user.wallets.map((w) => w.whaleScore ?? 0);
    const whaleActivity = whaleScores.length > 0 ? Math.max(...whaleScores) : 0;
    // Battle performance: ELO normalized (1000 baseline -> 0, 2000 -> 100).
    const elo = user.battleStats?.elo ?? 1000;
    const battlePerformance = Math.max(0, Math.min(100, ((elo - 1000) / 1000) * 100));
    // --- Composite score (0-1000 scale) ---
    const holdingDurationScore = Math.min(100, (avgHoldDays / 365) * 100);
    const rareOwnedScore = Math.min(100, (rareCount / 10) * 100);
    const collectionValueScore = Math.min(100, (collectionValueEth / 20) * 100);
    const tradingPerformanceScore = Math.min(100, (realizedGainsEth / 10) * 100);
    const score = Math.round(holdingDurationScore * 1.5 +
        rareOwnedScore * 1.5 +
        collectionValueScore * 1.5 +
        tradingPerformanceScore * 1.5 +
        whaleActivity * 1.5 +
        battlePerformance * 1.5); // max ~900
    // XP grows monotonically — additive battle wins + score-derived baseline.
    const battleXp = (user.battleStats?.wins ?? 0) * 25;
    const xp = score * 10 + battleXp;
    const level = levelForXp(xp);
    const xpToNextLevel = Math.max(0, xpForLevel(level + 1) - xp);
    // --- Badges ---
    const badgeChecks = [
        { type: "AlphaCollector", earned: rareCount >= 3 },
        { type: "Whale", earned: whaleActivity >= 70 },
        { type: "DiamondHands", earned: avgHoldDays >= 180 },
        { type: "Strategist", earned: realizedGainsEth >= 5 },
        { type: "BattleMaster", earned: elo >= 1800 },
        { type: "NormiesLegend", earned: score >= 700 },
    ];
    const reputation = await prisma_1.prisma.reputation.upsert({
        where: { userId },
        create: { userId, score, level, xp },
        update: { score, level, xp },
        include: { badges: true },
    });
    for (const check of badgeChecks) {
        if (check.earned) {
            await prisma_1.prisma.badge.upsert({
                where: { reputationId_type: { reputationId: reputation.id, type: check.type } },
                create: { reputationId: reputation.id, type: check.type },
                update: {},
            });
        }
    }
    const badges = await prisma_1.prisma.badge.findMany({ where: { reputationId: reputation.id } });
    return {
        address: user.primaryWallet ?? "",
        score,
        level,
        xp,
        xpToNextLevel,
        badges: badges.map((b) => ({ type: b.type, awardedAt: b.awardedAt.toISOString() })),
    };
}
async function getReputationByAddress(address) {
    const wallet = await prisma_1.prisma.wallet.findUnique({
        where: { address: address.toLowerCase() },
        include: { user: { include: { reputation: { include: { badges: true } } } } },
    });
    if (!wallet?.user?.reputation) {
        return {
            address: address.toLowerCase(),
            score: 0,
            level: 1,
            xp: 0,
            xpToNextLevel: xpForLevel(2),
            badges: [],
        };
    }
    const rep = wallet.user.reputation;
    return {
        address: address.toLowerCase(),
        score: rep.score,
        level: rep.level,
        xp: rep.xp,
        xpToNextLevel: Math.max(0, xpForLevel(rep.level + 1) - rep.xp),
        badges: rep?.badges.map((b) => ({ type: b.type, awardedAt: b.awardedAt.toISOString() })),
    };
}
async function getReputationLeaderboard(limit = 20) {
    return prisma_1.prisma.reputation.findMany({
        orderBy: { score: "desc" },
        take: limit,
        include: { user: { select: { primaryWallet: true } }, badges: true },
    });
}
