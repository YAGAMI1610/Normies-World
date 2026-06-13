import { z } from "zod";
export declare const AlertTypeEnum: z.ZodEnum<["WHALE_ACCUMULATION", "WHALE_LIQUIDATION", "TRAIT_SPIKE", "TRAIT_RARITY_SHIFT", "FLOOR_CHANGE", "RAPID_APPRECIATION", "UNUSUAL_SALE", "HOLDER_BUY", "HOLDER_SELL", "REPUTATION_LEADER_MOVE"]>;
export type AlertType = z.infer<typeof AlertTypeEnum>;
export declare const AlertSeverityEnum: z.ZodEnum<["info", "warning", "critical"]>;
export type AlertSeverity = z.infer<typeof AlertSeverityEnum>;
export declare const AlertChannelEnum: z.ZodEnum<["inapp", "email", "telegram", "discord"]>;
export type AlertChannel = z.infer<typeof AlertChannelEnum>;
export interface AlertPayload {
    id: string;
    type: AlertType;
    severity: AlertSeverity;
    message: string;
    payload: Record<string, unknown>;
    createdAt: string;
}
export interface WhaleProfile {
    walletAddress: string;
    holdingsCount: number;
    avgHoldDurationDays: number;
    realizedGainsEth: number;
    unrealizedGainsEth: number;
    rarityPreference: Record<string, Record<string, number>>;
    whaleScore: number;
    lastCalculated: string;
}
export interface WhaleSimilarityResult {
    whaleAddress: string;
    similarityPercent: number;
    factors: {
        traitPreference: number;
        rarityProfile: number;
        holdDuration: number;
        collectionComposition: number;
    };
}
export declare const BadgeTypeEnum: z.ZodEnum<["AlphaCollector", "Whale", "DiamondHands", "Strategist", "BattleMaster", "NormiesLegend"]>;
export type BadgeType = z.infer<typeof BadgeTypeEnum>;
export interface ReputationProfile {
    address: string;
    score: number;
    level: number;
    xp: number;
    xpToNextLevel: number;
    badges: {
        type: BadgeType;
        awardedAt: string;
    }[];
}
export declare const GameModeEnum: z.ZodEnum<["RANKED", "CASUAL", "TOURNAMENT", "FRIENDS"]>;
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
export interface HistoricalSnapshotData {
    date: string;
    holderCount: number;
    floorPriceEth: number | null;
    volumeEth: number | null;
    topTraits: {
        category: string;
        value: string;
        count: number;
    }[];
    whaleLeaderboard: {
        address: string;
        holdings: number;
        rank: number;
    }[];
    ownershipDistribution: {
        bucket: string;
        walletCount: number;
        tokenCount: number;
    }[];
}
export interface AIInsightData {
    id: string;
    type: "DAILY_MARKET" | "WHALE_BEHAVIOR" | "TRAIT_TREND";
    title: string;
    body: string;
    citedMetrics: {
        label: string;
        value: string | number;
    }[];
    generatedAt: string;
}
