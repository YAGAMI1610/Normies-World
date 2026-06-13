"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameModeEnum = exports.BadgeTypeEnum = exports.AlertChannelEnum = exports.AlertSeverityEnum = exports.AlertTypeEnum = void 0;
// packages/shared-types/src/domain.ts
const zod_1 = require("zod");
// ---------- Alerts ----------
exports.AlertTypeEnum = zod_1.z.enum([
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
exports.AlertSeverityEnum = zod_1.z.enum(["info", "warning", "critical"]);
exports.AlertChannelEnum = zod_1.z.enum(["inapp", "email", "telegram", "discord"]);
// ---------- Reputation ----------
exports.BadgeTypeEnum = zod_1.z.enum([
    "AlphaCollector",
    "Whale",
    "DiamondHands",
    "Strategist",
    "BattleMaster",
    "NormiesLegend",
]);
// ---------- Battle ----------
exports.GameModeEnum = zod_1.z.enum(["RANKED", "CASUAL", "TOURNAMENT", "FRIENDS"]);
