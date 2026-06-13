"use strict";
// apps/server/src/services/similarityEngine.ts
//
// "Wallet Similarity Engine" — compares a user's wallet profile against
// each tracked whale's profile across four factors and produces an overall
// similarity percentage: "You are 87% similar to Whale #3."
//
// Factors (each scored 0-1, then averaged with weights):
//  - traitPreference: cosine similarity of trait-category/value distributions
//  - rarityProfile: closeness of average held rarityScore
//  - holdDuration: closeness of average hold duration (days)
//  - collectionComposition: Jaccard-like overlap of held trait *categories'* dominant values
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeSimilarity = computeSimilarity;
exports.findMostSimilarWhales = findMostSimilarWhales;
const prisma_1 = require("../lib/prisma");
async function buildWalletProfile(whaleAddress) {
    const wallet = await prisma_1.prisma.wallet.findUnique({
        where: { address: whaleAddress.toLowerCase() },
        include: {
            ownerships: {
                where: { current: true },
                include: { normie: { include: { traits: true } } },
            },
        },
    });
    if (!wallet || wallet.ownerships.length === 0)
        return null;
    const now = Date.now();
    const rarityPreference = {};
    let totalRarity = 0;
    let rarityCount = 0;
    let totalHoldDays = 0;
    for (const o of wallet.ownerships) {
        totalHoldDays += (now - o.acquiredAt.getTime()) / (1000 * 60 * 60 * 24);
        if (o.normie.rarityScore != null) {
            totalRarity += o.normie.rarityScore;
            rarityCount++;
        }
        for (const t of o.normie.traits) {
            rarityPreference[t.category] ??= {};
            rarityPreference[t.category][t.value] = (rarityPreference[t.category][t.value] ?? 0) + 1;
        }
    }
    for (const category of Object.keys(rarityPreference)) {
        const total = Object.values(rarityPreference[category]).reduce((a, b) => a + b, 0);
        for (const value of Object.keys(rarityPreference[category])) {
            rarityPreference[category][value] /= total;
        }
    }
    return {
        rarityPreference,
        avgRarityScore: rarityCount > 0 ? totalRarity / rarityCount : 0,
        avgHoldDurationDays: totalHoldDays / wallet.ownerships.length,
    };
}
/** Cosine similarity between two sparse category->value->weight maps. */
function traitCosineSimilarity(a, b) {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    const categories = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const category of categories) {
        const av = a[category] ?? {};
        const bv = b[category] ?? {};
        const values = new Set([...Object.keys(av), ...Object.keys(bv)]);
        for (const value of values) {
            const x = av[value] ?? 0;
            const y = bv[value] ?? 0;
            dot += x * y;
            normA += x * x;
            normB += y * y;
        }
    }
    if (normA === 0 || normB === 0)
        return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
/** Closeness score: 1 - normalized absolute difference, clamped to [0,1]. */
function closeness(a, b, scale) {
    const diff = Math.abs(a - b);
    return Math.max(0, 1 - diff / scale);
}
async function computeSimilarity(userWalletAddress, whaleAddress) {
    const [userProfile, whaleProfile] = await Promise.all([
        buildWalletProfile(userWalletAddress),
        buildWalletProfile(whaleAddress),
    ]);
    if (!userProfile || !whaleProfile)
        return null;
    const traitPreference = traitCosineSimilarity(userProfile.rarityPreference, whaleProfile.rarityPreference);
    // Rarity score scale: typical range ~8-300 for this 8-category, 10k supply
    // sum-of-inverse-frequency scoring.
    const rarityProfile = closeness(userProfile.avgRarityScore, whaleProfile.avgRarityScore, 200);
    // Hold duration scale: 1 year.
    const holdDuration = closeness(userProfile.avgHoldDurationDays, whaleProfile.avgHoldDurationDays, 365);
    // Collection composition: how much the dominant trait value per category
    // overlaps between the two wallets.
    let overlapCount = 0;
    let categoryCount = 0;
    const categories = new Set([
        ...Object.keys(userProfile.rarityPreference),
        ...Object.keys(whaleProfile.rarityPreference),
    ]);
    for (const category of categories) {
        categoryCount++;
        const userTop = topValue(userProfile.rarityPreference[category]);
        const whaleTop = topValue(whaleProfile.rarityPreference[category]);
        if (userTop && whaleTop && userTop === whaleTop)
            overlapCount++;
    }
    const collectionComposition = categoryCount > 0 ? overlapCount / categoryCount : 0;
    const overall = traitPreference * 0.4 +
        rarityProfile * 0.2 +
        holdDuration * 0.2 +
        collectionComposition * 0.2;
    return {
        whaleAddress: whaleAddress.toLowerCase(),
        similarityPercent: Math.round(overall * 100),
        factors: {
            traitPreference: Math.round(traitPreference * 100) / 100,
            rarityProfile: Math.round(rarityProfile * 100) / 100,
            holdDuration: Math.round(holdDuration * 100) / 100,
            collectionComposition: Math.round(collectionComposition * 100) / 100,
        },
    };
}
function topValue(dist) {
    if (!dist)
        return null;
    let best = null;
    let bestScore = -1;
    for (const [value, score] of Object.entries(dist)) {
        if (score > bestScore) {
            best = value;
            bestScore = score;
        }
    }
    return best;
}
/** Compute similarity against all tracked whales, sorted descending. */
async function findMostSimilarWhales(userWalletAddress, limit = 5) {
    const whales = await prisma_1.prisma.whale.findMany({ select: { whaleAddress: true } });
    const results = [];
    for (const w of whales) {
        if (w.whaleAddress.toLowerCase() === userWalletAddress.toLowerCase())
            continue;
        const sim = await computeSimilarity(userWalletAddress, w.whaleAddress);
        if (sim)
            results.push(sim);
    }
    return results.sort((a, b) => b.similarityPercent - a.similarityPercent).slice(0, limit);
}
