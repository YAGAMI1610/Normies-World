"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// apps/server/src/routes/ai.ts
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const aiInsightEngine_1 = require("../services/aiInsightEngine");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = (0, express_1.Router)();
// GET /api/ai/insight/latest
router.get('/insight/latest', async (_req, res) => {
    try {
        const insight = await prisma_1.prisma.aIInsight.findFirst({
            where: { type: 'DAILY_MARKET' },
            orderBy: { generatedAt: 'desc' },
        });
        if (!insight)
            return res.json(null);
        // Map DB sentiment from body text heuristic
        const bodyLower = insight.body.toLowerCase();
        const sentiment = bodyLower.includes('accumulat') || bodyLower.includes('bullish') || bodyLower.includes('increas')
            ? 'BULLISH'
            : bodyLower.includes('decline') || bodyLower.includes('bearish') || bodyLower.includes('decreas')
                ? 'BEARISH'
                : 'NEUTRAL';
        const citedMetrics = insight.citedMetrics ?? [];
        const confidence = Math.min(0.95, 0.6 + citedMetrics.length * 0.05);
        res.json({
            id: insight.id,
            summary: insight.body,
            bulletPoints: citedMetrics.map((m) => `${m.label}: ${m.value}`),
            sentiment,
            confidence,
            generatedAt: insight.generatedAt.toISOString(),
            snapshotData: insight.dataSnapshot,
        });
    }
    catch (err) {
        console.error('[ai/insight/latest]', err);
        res.status(500).json({ error: 'Failed to load insight' });
    }
});
// POST /api/ai/insight/generate — trigger new insight generation (rate limited)
router.post('/insight/generate', auth_1.default, async (_req, res) => {
    try {
        // Rate limit: max one generation per 5 minutes
        const recent = await prisma_1.prisma.aIInsight.findFirst({
            where: { type: 'DAILY_MARKET', generatedAt: { gte: new Date(Date.now() - 5 * 60_000) } },
        });
        if (recent) {
            const bodyLower = recent.body.toLowerCase();
            const sentiment = bodyLower.includes('accumulat') || bodyLower.includes('bullish') || bodyLower.includes('increas')
                ? 'BULLISH'
                : bodyLower.includes('decline') || bodyLower.includes('bearish') || bodyLower.includes('decreas')
                    ? 'BEARISH'
                    : 'NEUTRAL';
            const citedMetrics = recent.citedMetrics ?? [];
            return res.json({
                id: recent.id,
                summary: recent.body,
                bulletPoints: citedMetrics.map((m) => `${m.label}: ${m.value}`),
                sentiment,
                confidence: 0.85,
                generatedAt: recent.generatedAt.toISOString(),
                snapshotData: recent.dataSnapshot,
            });
        }
        const insight = await (0, aiInsightEngine_1.generateDailyMarketInsight)();
        const bodyLower = insight.body.toLowerCase();
        const sentiment = bodyLower.includes('accumulat') || bodyLower.includes('bullish') || bodyLower.includes('increas')
            ? 'BULLISH'
            : bodyLower.includes('decline') || bodyLower.includes('bearish') || bodyLower.includes('decreas')
                ? 'BEARISH'
                : 'NEUTRAL';
        res.json({
            id: insight.id,
            summary: insight.body,
            bulletPoints: insight.citedMetrics.map(m => `${m.label}: ${m.value}`),
            sentiment,
            confidence: 0.85,
            generatedAt: insight.generatedAt,
            snapshotData: {},
        });
    }
    catch (err) {
        console.error('[ai/insight/generate]', err);
        res.status(500).json({ error: 'Failed to generate insight' });
    }
});
exports.default = router;
