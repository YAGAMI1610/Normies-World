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

import axios from "axios";
import { cached } from "../lib/redis";

export interface FloorSnapshot {
  floorPriceEth: number;
  timestamp: string;
  source: string;
}

export interface RecentSale {
  tokenId: number;
  priceEth: number;
  buyer: string;
  seller: string;
  txHash: string;
  timestamp: string;
}

export interface MarketDataProvider {
  getFloor(): Promise<FloorSnapshot | null>;
  getRecentSales(limit?: number): Promise<RecentSale[]>;
  get24hVolumeEth(): Promise<number | null>;
}

const RESERVOIR_BASE = "https://api.reservoir.tools";

class ReservoirProvider implements MarketDataProvider {
  private enabled = !!process.env.RESERVOIR_API_KEY;

  private headers() {
    return { "x-api-key": process.env.RESERVOIR_API_KEY, accept: "*/*" };
  }

  async getFloor(): Promise<FloorSnapshot | null> {
    if (!this.enabled) return null;
    return cached("market:floor", 60, async () => {
      try {
        const res = await axios.get(
          `${RESERVOIR_BASE}/collections/v7`,
          {
            params: { id: process.env.RESERVOIR_COLLECTION_ADDRESS },
            headers: this.headers(),
            timeout: 10_000,
          }
        );
        const collection = res.data?.collections?.[0];
        const floor = collection?.floorAsk?.price?.amount?.native;
        if (typeof floor !== "number") return null;
        return {
          floorPriceEth: floor,
          timestamp: new Date().toISOString(),
          source: "reservoir",
        };
      } catch {
        return null;
      }
    });
  }

  async getRecentSales(limit = 20): Promise<RecentSale[]> {
    if (!this.enabled) return [];
    return cached(`market:sales:${limit}`, 60, async () => {
      try {
        const res = await axios.get(`${RESERVOIR_BASE}/sales/v6`, {
          params: { collection: process.env.RESERVOIR_COLLECTION_ADDRESS, limit },
          headers: this.headers(),
          timeout: 10_000,
        });
        const sales = res.data?.sales ?? [];
        return sales.map((s: any) => ({
          tokenId: Number(s?.token?.tokenId ?? -1),
          priceEth: Number(s?.price?.amount?.native ?? 0),
          buyer: s?.to ?? "",
          seller: s?.from ?? "",
          txHash: s?.txHash ?? "",
          timestamp: s?.timestamp
            ? new Date(s.timestamp * 1000).toISOString()
            : new Date().toISOString(),
        })) as RecentSale[];
      } catch {
        return [];
      }
    });
  }

  async get24hVolumeEth(): Promise<number | null> {
    if (!this.enabled) return null;
    return cached("market:volume24h", 300, async () => {
      try {
        const res = await axios.get(
          `${RESERVOIR_BASE}/collections/v7`,
          {
            params: { id: process.env.RESERVOIR_COLLECTION_ADDRESS },
            headers: this.headers(),
            timeout: 10_000,
          }
        );
        const vol = res.data?.collections?.[0]?.volume?.["1day"];
        return typeof vol === "number" ? vol : null;
      } catch {
        return null;
      }
    });
  }
}

/**
 * Fallback provider used when no market data API key is configured.
 * Always returns null/empty — never invents prices.
 */
class NullMarketDataProvider implements MarketDataProvider {
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

export const marketDataProvider: MarketDataProvider = process.env.RESERVOIR_API_KEY
  ? new ReservoirProvider()
  : new NullMarketDataProvider();