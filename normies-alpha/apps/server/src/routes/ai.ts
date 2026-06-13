// apps/server/src/routes/ai.ts
import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { generateDailyMarketInsight, getLatestInsight } from '../services/aiInsightEngine';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// GET /api/ai/insight/latest
router.get('/insight/latest', async (_req: Request, res: Response) => {
  try {
    const insight = await prisma.aIInsight.findFirst({
      where: { type: 'DAILY_MARKET' },
      orderBy: { generatedAt: 'desc' },
    });

    if (!insight) return res.json(null);

    // Map DB sentiment from body text heuristic
    const bodyLower = insight.body.toLowerCase();
    const sentiment =
      bodyLower.includes('accumulat') || bodyLower.includes('bullish') || bodyLower.includes('increas')
        ? 'BULLISH'
        : bodyLower.includes('decline') || bodyLower.includes('bearish') || bodyLower.includes('decreas')
        ? 'BEARISH'
        : 'NEUTRAL';

    const citedMetrics = (insight.citedMetrics as any) ?? [];
    const confidence = Math.min(0.95, 0.6 + citedMetrics.length * 0.05);

    res.json({
      id: insight.id,
      summary: insight.body,
      bulletPoints: citedMetrics.map((m: any) => `${m.label}: ${m.value}`),
      sentiment,
      confidence,
      generatedAt: insight.generatedAt.toISOString(),
      snapshotData: insight.dataSnapshot,
    });
  } catch (err) {
    console.error('[ai/insight/latest]', err);
    res.status(500).json({ error: 'Failed to load insight' });
  }
});

// POST /api/ai/insight/generate — trigger new insight generation (rate limited)
router.post('/insight/generate', authMiddleware, async (_req: Request, res: Response) => {
  try {
    // Rate limit: max one generation per 5 minutes
    const recent = await prisma.aIInsight.findFirst({
      where: { type: 'DAILY_MARKET', generatedAt: { gte: new Date(Date.now() - 5 * 60_000) } },
    });

    if (recent) {
      const bodyLower = recent.body.toLowerCase();
      const sentiment =
        bodyLower.includes('accumulat') || bodyLower.includes('bullish') || bodyLower.includes('increas')
          ? 'BULLISH'
          : bodyLower.includes('decline') || bodyLower.includes('bearish') || bodyLower.includes('decreas')
          ? 'BEARISH'
          : 'NEUTRAL';
      const citedMetrics = (recent.citedMetrics as any) ?? [];
      return res.json({
        id: recent.id,
        summary: recent.body,
        bulletPoints: citedMetrics.map((m: any) => `${m.label}: ${m.value}`),
        sentiment,
        confidence: 0.85,
        generatedAt: recent.generatedAt.toISOString(),
        snapshotData: recent.dataSnapshot,
      });
    }

    const insight = await generateDailyMarketInsight();

    const bodyLower = insight.body.toLowerCase();
    const sentiment =
      bodyLower.includes('accumulat') || bodyLower.includes('bullish') || bodyLower.includes('increas')
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
  } catch (err) {
    console.error('[ai/insight/generate]', err);
    res.status(500).json({ error: 'Failed to generate insight' });
  }
});

export default router;
