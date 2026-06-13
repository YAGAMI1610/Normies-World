"use strict";
// apps/server/src/services/aiInsightEngine.ts
//
// "Explain Today's Market" — generates a structured AI insight from a
// JSON snapshot of real indexed data (whale moves, trait demand deltas,
// transfer volume, floor movement). The model is instructed to ONLY use
// facts present in the provided JSON and to cite the specific metrics it
// references, preventing hallucination. The full snapshot is stored
// alongside the generated text for audit.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDailyMarketInsight = generateDailyMarketInsight;
exports.getLatestInsight = getLatestInsight;
const openai_1 = __importDefault(require("openai"));
const env_1 = require("../lib/env");
const prisma_1 = require("../lib/prisma");
const marketDataProvider_1 = require("./marketDataProvider");
const openai = env_1.env.OPENAI_API_KEY ? new openai_1.default({ apiKey: env_1.env.OPENAI_API_KEY }) : null;
async function buildMarketSnapshot() {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const prior24h = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const recentTransfers = await prisma_1.prisma.transfer.findMany({
        where: { timestamp: { gte: last24h } },
        select: { tokenId: true, fromAddress: true, toAddress: true },
    });
    const transferCount = recentTransfers.length;
    const uniqueBuyers = new Set(recentTransfers.map((t) => t.toAddress)).size;
    const uniqueSellers = new Set(recentTransfers.map((t) => t.fromAddress)).size;
    // Top accumulators: net positive token count change in last 24h.
    const netByAddress = new Map();
    for (const t of recentTransfers) {
        netByAddress.set(t.toAddress, (netByAddress.get(t.toAddress) ?? 0) + 1);
        netByAddress.set(t.fromAddress, (netByAddress.get(t.fromAddress) ?? 0) - 1);
    }
    const ZERO = "0x0000000000000000000000000000000000000000";
    const topAccumulators = Array.from(netByAddress.entries())
        .filter(([addr, net]) => addr !== ZERO && net > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([address, netAcquired]) => ({ address, netAcquired }));
    // Trait demand deltas: count of trait values among tokens transferred in
    // last 24h vs the 24h before that.
    async function traitCountsForTokens(tokenIds) {
        if (tokenIds.length === 0)
            return new Map();
        const traits = await prisma_1.prisma.trait.findMany({ where: { tokenId: { in: tokenIds } } });
        const counts = new Map();
        for (const t of traits) {
            const key = `${t.category}::${t.value}`;
            counts.set(key, (counts.get(key) ?? 0) + 1);
        }
        return counts;
    }
    const recentTokenIds = recentTransfers.map((t) => t.tokenId);
    const priorTransfers = await prisma_1.prisma.transfer.findMany({
        where: { timestamp: { gte: prior24h, lt: last24h } },
        select: { tokenId: true },
    });
    const priorTokenIds = priorTransfers.map((t) => t.tokenId);
    const [recentCounts, priorCounts] = await Promise.all([
        traitCountsForTokens(recentTokenIds),
        traitCountsForTokens(priorTokenIds),
    ]);
    const traitDemandDeltas = [];
    const allKeys = new Set([...recentCounts.keys(), ...priorCounts.keys()]);
    for (const key of allKeys) {
        const [category, value] = key.split("::");
        const recentVal = recentCounts.get(key) ?? 0;
        const priorVal = priorCounts.get(key) ?? 0;
        if (recentVal === 0 && priorVal === 0)
            continue;
        const pctChange = priorVal === 0 ? (recentVal > 0 ? 100 : 0) : ((recentVal - priorVal) / priorVal) * 100;
        traitDemandDeltas.push({ category, value, last24h: recentVal, prior24h: priorVal, pctChange });
    }
    traitDemandDeltas.sort((a, b) => Math.abs(b.pctChange) - Math.abs(a.pctChange));
    // New holders: wallets whose first ownership record was created in last 24h.
    const newHolders = await prisma_1.prisma.normieOwnership.count({
        where: {
            acquiredAt: { gte: last24h },
            wallet: { ownerships: { every: { acquiredAt: { gte: last24h } } } },
        },
    });
    const floor = await marketDataProvider_1.marketDataProvider.getFloor();
    const volume24hEth = await marketDataProvider_1.marketDataProvider.get24hVolumeEth();
    return {
        windowHours: 24,
        transferCount,
        uniqueBuyers,
        uniqueSellers,
        topAccumulators,
        traitDemandDeltas: traitDemandDeltas.slice(0, 8),
        floor: { current: floor?.floorPriceEth ?? null, source: floor?.source ?? null },
        volume24hEth,
        newHolders,
    };
}
const SYSTEM_PROMPT = `You are the Normies Alpha Market Analyst.
You will be given a JSON snapshot of on-chain activity for the Normies NFT collection (10,000 supply, Ethereum).
Write a concise 2-4 sentence market summary using ONLY facts present in the JSON.
Do NOT invent numbers, wallet addresses, or trends not present in the data.
If a field is null (e.g. floor price unavailable), do not speculate about its value — simply omit it or note it's unavailable.
Reference specific numbers from the JSON in your summary.
Respond with strict JSON: { "title": string, "body": string, "citedMetrics": [{ "label": string, "value": string | number }] }`;
async function generateDailyMarketInsight() {
    const snapshot = await buildMarketSnapshot();
    let title;
    let body;
    let citedMetrics;
    if (openai) {
        const completion = await openai.chat.completions.create({
            model: env_1.env.OPENAI_MODEL,
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: JSON.stringify(snapshot) },
            ],
            response_format: { type: "json_object" },
            temperature: 0.3,
        });
        const raw = completion.choices[0]?.message?.content ?? "{}";
        try {
            const parsed = JSON.parse(raw);
            title = parsed.title ?? "Today's Market";
            body = parsed.body ?? "No insight generated.";
            citedMetrics = parsed.citedMetrics ?? [];
        }
        catch {
            title = "Today's Market";
            body = raw;
            citedMetrics = [];
        }
    }
    else {
        // Fallback: deterministic template-based summary when no OpenAI key is set.
        title = "Today's Market (template)";
        const parts = [];
        parts.push(`${snapshot.transferCount} transfers occurred in the last 24h across ${snapshot.uniqueBuyers} receiving wallets.`);
        if (snapshot.topAccumulators.length > 0) {
            const top = snapshot.topAccumulators[0];
            parts.push(`${top.address} was the top net accumulator with +${top.netAcquired} Normies.`);
        }
        if (snapshot.traitDemandDeltas.length > 0) {
            const top = snapshot.traitDemandDeltas[0];
            parts.push(`${top.category}: ${top.value} demand changed ${top.pctChange.toFixed(0)}% vs the prior 24h.`);
        }
        if (snapshot.floor.current != null) {
            parts.push(`Floor price is currently ${snapshot.floor.current} ETH (${snapshot.floor.source}).`);
        }
        body = parts.join(" ");
        citedMetrics = [
            { label: "24h Transfers", value: snapshot.transferCount },
            { label: "New Holders", value: snapshot.newHolders },
        ];
    }
    const insight = await prisma_1.prisma.aIInsight.create({
        data: {
            type: "DAILY_MARKET",
            title,
            body,
            dataSnapshot: snapshot,
            citedMetrics: citedMetrics,
        },
    });
    return {
        id: insight.id,
        type: "DAILY_MARKET",
        title: insight.title,
        body: insight.body,
        citedMetrics,
        generatedAt: insight.generatedAt.toISOString(),
    };
}
async function getLatestInsight(type = "DAILY_MARKET") {
    const insight = await prisma_1.prisma.aIInsight.findFirst({
        where: { type },
        orderBy: { generatedAt: "desc" },
    });
    if (!insight)
        return null;
    return {
        id: insight.id,
        type: insight.type,
        title: insight.title,
        body: insight.body,
        citedMetrics: insight.citedMetrics ?? [],
        generatedAt: insight.generatedAt.toISOString(),
    };
}
