// packages/shared-types/src/domain.ts
import { z } from "zod";

// ---------- Alerts ----------

export const AlertTypeEnum = z.enum([
  "WHALE_ACCUMULATION",
  "WHALE_LIQUIDATION",
  "TRAIT_SPIKE",
  "TRAIT_RARITY_SHIFT",
  "FLOOR_CHANGE",
  "RAPID_APPRECIATION",
  "UNUSUAL_SALE",
  "HOLDER_BUY",
  "HOLDER_SELL",
  "REPUTATION_LEADER_MOVE",
]);
export type AlertType = z.infer<typeof AlertTypeEnum>;

export const AlertSeverityEnum = z.enum(["info", "warning", "critical"]);
export type AlertSeverity = z.infer<typeof AlertSeverityEnum>;

export const AlertChannelEnum = z.enum(["inapp", "email", "telegram", "discord"]);
export type AlertChannel = z.infer<typeof AlertChannelEnum>;

export interface AlertPayload {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

// ---------- Whale ----------

export interface WhaleProfile {
  walletAddress: string;
  holdingsCount: number;
  avgHoldDurationDays: number;
  realizedGainsEth: number;
  unrealizedGainsEth: number;
  rarityPreference: Record<string, Record<string, number>>; // category -> value -> weight
  whaleScore: number; // 0-100
  lastCalculated: string;
}

export interface WhaleSimilarityResult {
  whaleAddress: string;
  similarityPercent: number; // 0-100
  factors: {
    traitPreference: number;
    rarityProfile: number;
    holdDuration: number;
    collectionComposition: number;
  };
}

// ---------- Reputation ----------

export const BadgeTypeEnum = z.enum([
  "AlphaCollector",
  "Whale",
  "DiamondHands",
  "Strategist",
  "BattleMaster",
  "NormiesLegend",
]);
export type BadgeType = z.infer<typeof BadgeTypeEnum>;

export interface ReputationProfile {
  address: string;
  score: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  badges: { type: BadgeType; awardedAt: string }[];
}

// ---------- Battle ----------

export const GameModeEnum = z.enum(["RANKED", "CASUAL", "TOURNAMENT", "FRIENDS"]);
export type GameMode = z.infer<typeof GameModeEnum>;

export interface BattleCardData {
  tokenId: number;
  name: string;
  imageUrl: string;
  attack: number;
  defense: number;
  speed: number;
  specialAbility: string;
  abilityDescription: string;
  abilityTraitSource: string;
  rarityTier: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
  rarityRank?: number;
  ownedSkin?: {
    animated: boolean;
    canvasLevel: number;
    customized: boolean;
  };
}

export interface BattleStatsData {
  wins: number;
  losses: number;
  draws: number;
  winStreak: number;
  elo: number;
  rank: string;
}

// ---------- Time Machine ----------

export interface HistoricalSnapshotData {
  date: string;
  holderCount: number;
  floorPriceEth: number | null;
  volumeEth: number | null;
  topTraits: { category: string; value: string; count: number }[];
  whaleLeaderboard: { address: string; holdings: number; rank: number }[];
  ownershipDistribution: { bucket: string; walletCount: number; tokenCount: number }[];
}

// ---------- AI Insights ----------

export interface AIInsightData {
  id: string;
  type: "DAILY_MARKET" | "WHALE_BEHAVIOR" | "TRAIT_TREND";
  title: string;
  body: string;
  citedMetrics: { label: string; value: string | number }[];
  generatedAt: string;
}