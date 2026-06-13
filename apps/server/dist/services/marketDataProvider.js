"use strict";
// apps/server/src/services/marketDataProvider.ts
//
// IMPORTANT DATA PROVENANCE NOTE:
// The Normies API (api.normies.art) does NOT expose sales, floor price, or
// marketplace volume data — it is a metadata/ownership/canvas/agent API only.
// Price/floor/sales data in this app comes from this separate, pluggable
// MarketDataProvider. The default implementation uses Reservoir's aggregated
// marketplace API. If RESERVOIR_API_KEY is not configured, this provider
// returns `null`/empty results rather than fabricating numbers — features
// that depend on it (floor alerts, AI insight floor commentary) degrade
// gracefully and are labeled as "unavailable" in the UI.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.marketDataProvider = void 0;
const axios_1 = __importDefault(require("axios"));
const redis_1 = require("../lib/redis");
const RESERVOIR_BASE = "https://api.reservoir.tools";
class ReservoirProvider {
    constructor() {
        this.enabled = !!process.env.RESERVOIR_API_KEY;
    }
    headers() {
        return { "x-api-key": process.env.RESERVOIR_API_KEY, accept: "*/*" };
    }
    async getFloor() {
        if (!this.enabled)
            return null;
        return (0, redis_1.cached)("market:floor", 60, async () => {
            try {
                const res = await axios_1.default.get(`${RESERVOIR_BASE}/collections/v7`, {
                    params: { id: process.env.RESERVOIR_COLLECTION_ADDRESS },
                    headers: this.headers(),
                    timeout: 10_000,
                });
                const collection = res.data?.collections?.[0];
                const floor = collection?.floorAsk?.price?.amount?.native;
                if (typeof floor !== "number")
                    return null;
                return {
                    floorPriceEth: floor,
                    timestamp: new Date().toISOString(),
                    source: "reservoir",
                };
            }
            catch {
                return null;
            }
        });
    }
    async getRecentSales(limit = 20) {
        if (!this.enabled)
            return [];
        return (0, redis_1.cached)(`market:sales:${limit}`, 60, async () => {
            try {
                const res = await axios_1.default.get(`${RESERVOIR_BASE}/sales/v6`, {
                    params: { collection: process.env.RESERVOIR_COLLECTION_ADDRESS, limit },
                    headers: this.headers(),
                    timeout: 10_000,
                });
                const sales = res.data?.sales ?? [];
                return sales.map((s) => ({
                    tokenId: Number(s?.token?.tokenId ?? -1),
                    priceEth: Number(s?.price?.amount?.native ?? 0),
                    buyer: s?.to ?? "",
                    seller: s?.from ?? "",
                    txHash: s?.txHash ?? "",
                    timestamp: s?.timestamp
                        ? new Date(s.timestamp * 1000).toISOString()
                        : new Date().toISOString(),
                }));
            }
            catch {
                return [];
            }
        });
    }
    async get24hVolumeEth() {
        if (!this.enabled)
            return null;
        return (0, redis_1.cached)("market:volume24h", 300, async () => {
            try {
                const res = await axios_1.default.get(`${RESERVOIR_BASE}/collections/v7`, {
                    params: { id: process.env.RESERVOIR_COLLECTION_ADDRESS },
                    headers: this.headers(),
                    timeout: 10_000,
                });
                const vol = res.data?.collections?.[0]?.volume?.["1day"];
                return typeof vol === "number" ? vol : null;
            }
            catch {
                return null;
            }
        });
    }
}
/**
 * Fallback provider used when no market data API key is configured.
 * Always returns null/empty — never invents prices.
 */
class NullMarketDataProvider {
    async getFloor() {
        return null;
    }
    async getRecentSales() {
        return [];
    }
    async get24hVolumeEth() {
        return null;
    }
}
exports.marketDataProvider = process.env.RESERVOIR_API_KEY
    ? new ReservoirProvider()
    : new NullMarketDataProvider();
