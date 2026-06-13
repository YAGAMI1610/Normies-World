// apps/server/src/services/whaleScoreEngine.ts
//
// Computes a 0-100 "Whale Score" for wallets based on:
//  - profitability (realized + unrealized gains, from Sale + current floor)
//  - rarity quality (avg rarityScore of held tokens, normalized)
//  - consistency (acquisitions spread over time vs. one-off dumps)
//  - accumulation behavior (recent net acquisitions)
//
// "Whale" classification threshold: holdingsCount >= WHALE_HOLDING_THRESHOLD
// OR whaleScore >= WHALE_SCORE_THRESHOLD.

import { prisma } from "../lib/prisma";
import { marketDataProvider } from "./marketDataProvider";

export const WHALE_HOLDING_THRESHOLD = 15;
export const WHALE_SCORE_THRESHOLD = 70;

interface WalletStats {
  whaleAddress: string;
  holdingsCount: number;
  avgHoldDurationDays: number;
  realizedGainsEth: number;
  unrealizedGainsEth: number;
  rarityPreference: Record<string, Record<string, number>>;
  whaleScore: number;
}

async function computeWalletStats(whaleAddress: string): Promise<WalletStats | null> {
  const wallet = await prisma.wallet.findUnique({
    where: { address: whaleAddress.toLowerCase() },
    include: {
      ownerships: {
        where: { current: true },
        include: { normie: { include: { traits: true } } },
      },
    },
  });
  if (!wallet) return null;

  const holdingsCount = wallet.ownerships.length;
  if (holdingsCount === 0) return null;

  const now = Date.now();

  // Average hold duration across currently-held tokens.
  const holdDurations = wallet.ownerships.map(
    (o) => (now - o.acquiredAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  const avgHoldDurationDays =
    holdDurations.reduce((a, b) => a + b, 0) / holdDurations.length;

  // Rarity preference: distribution of trait values across held tokens.
  const rarityPreference: Record<string, Record<string, number>> = {};
  let totalRarityScore = 0;
  let rarityScoreCount = 0;

  for (const ownership of wallet.ownerships) {
    const normie = ownership.normie;
    if (normie.rarityScore != null) {
      totalRarityScore += normie.rarityScore;
      rarityScoreCount += 1;
    }
    for (const trait of normie.traits) {
      rarityPreference[trait.category] ??= {};
      rarityPreference[trait.category][trait.value] =
        (rarityPreference[trait.category][trait.value] ?? 0) + 1;
    }
  }

  // Normalize rarity preference counts -> weights (0-1)
  for (const category of Object.keys(rarityPreference)) {
    const total = Object.values(rarityPreference[category]).reduce((a, b) => a + b, 0);
    for (const value of Object.keys(rarityPreference[category])) {
      rarityPreference[category][value] = rarityPreference[category][value] / total;
    }
  }

  const avgRarityScore = rarityScoreCount > 0 ? totalRarityScore / rarityScoreCount : 0;

  // Realized gains: sum of (sell price - implied cost basis) for past sales
  // where this wallet was the seller. Without historical cost-basis data we
  // approximate realized gains as total ETH received from sales as seller.
  const sellSales = await prisma.sale.findMany({
    where: { seller: whaleAddress.toLowerCase() },
  });
  const realizedGainsEth = sellSales.reduce((sum, s) => sum + s.priceEth, 0);

  // Unrealized gains: (current floor - implied cost) * holdings. Without a
  // per-token cost basis, approximate using floor price * holdings as a
  // portfolio value proxy; "gains" reported as portfolio value when floor
  // data is available, 0 otherwise.
  const floor = await marketDataProvider.getFloor();
  const unrealizedGainsEth = floor ? floor.floorPriceEth * holdingsCount : 0;

  // --- Score components (each normalized to 0-100) ---

  // Profitability: scaled by realized + unrealized gains relative to a
  // reference scale (10 ETH = 100 points), capped.
  const profitability = Math.min(100, ((realizedGainsEth + unrealizedGainsEth) / 10) * 100);

  // Rarity quality: normalize rarityScore (typical range 8-300 for 8-trait
  // sum-of-inverse-frequency scoring with 10k supply) against a reference
  // ceiling of 200.
  const rarityQuality = Math.min(100, (avgRarityScore / 200) * 100);

  // Consistency: reward longer average hold durations (diamond-hands proxy),
  // scaled so 365 days = 100 points.
  const consistency = Math.min(100, (avgHoldDurationDays / 365) * 100);

  // Accumulation behavior: net acquisitions in the last 30 days, scaled so
  // +10 net acquisitions = 100 points.
  const recentAcquisitions = await prisma.normieOwnership.count({
    where: {
      walletId: wallet.id,
      acquiredAt: { gte: new Date(now - 30 * 24 * 60 * 60 * 1000) },
    },
  });
  const accumulationBehavior = Math.min(100, (recentAcquisitions / 10) * 100);

  const whaleScore =
    profitability * 0.35 +
    rarityQuality * 0.25 +
    consistency * 0.2 +
    accumulationBehavior * 0.2;

  return {
    whaleAddress: whaleAddress.toLowerCase(),
    holdingsCount,
    avgHoldDurationDays,
    realizedGainsEth,
    unrealizedGainsEth,
    rarityPreference,
    whaleScore: Math.round(whaleScore * 10) / 10,
  };
}

/** Recompute and persist whale stats for a single wallet. Returns null if the wallet holds nothing. */
export async function recalculateWhale(whaleAddress: string) {
  const stats = await computeWalletStats(whaleAddress);
  if (!stats) return null;

  const isWhale =
    stats.holdingsCount >= WHALE_HOLDING_THRESHOLD ||
    stats.whaleScore >= WHALE_SCORE_THRESHOLD;

  await prisma.wallet.update({
    where: { address: stats.whaleAddress },
    data: { isWhale, whaleScore: stats.whaleScore },
  });

  if (isWhale) {
    await prisma.whale.upsert({
      where: { whaleAddress: stats.whaleAddress },
      create: {
        whaleAddress: stats.whaleAddress,
        holdingsCount: stats.holdingsCount,
        avgHoldDurationDays: stats.avgHoldDurationDays,
        realizedGainsEth: stats.realizedGainsEth,
        unrealizedGainsEth: stats.unrealizedGainsEth,
        rarityPreference: stats.rarityPreference,
        whaleScore: stats.whaleScore,
      },
      update: {
        holdingsCount: stats.holdingsCount,
        avgHoldDurationDays: stats.avgHoldDurationDays,
        realizedGainsEth: stats.realizedGainsEth,
        unrealizedGainsEth: stats.unrealizedGainsEth,
        rarityPreference: stats.rarityPreference,
        whaleScore: stats.whaleScore,
      },
    });
  } else {
    await prisma.whale.deleteMany({ where: { whaleAddress: stats.whaleAddress } });
  }

  return stats;
}

/** Recompute whale stats for every wallet holding at least 1 Normie. Run as a periodic job. */
export async function recalculateAllWhales(): Promise<number> {
  const wallets = await prisma.wallet.findMany({
    where: { ownerships: { some: { current: true } } },
    select: { address: true },
  });

  let whaleCount = 0;
  for (const w of wallets) {
    const result = await recalculateWhale(w.address);
    if (result && (result.holdingsCount >= WHALE_HOLDING_THRESHOLD || result.whaleScore >= WHALE_SCORE_THRESHOLD)) {
      whaleCount++;
    }
  }
  return whaleCount;
}

export async function getWhaleLeaderboard(limit = 20) {
  return prisma.whale.findMany({
    orderBy: { whaleScore: "desc" },
    take: limit,
  });
}
