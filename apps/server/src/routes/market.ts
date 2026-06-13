// apps/server/src/routes/market.ts
import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { cached } from '../lib/redis';
import { marketDataProvider } from '../services/marketDataProvider';

const router = Router();

// GET /api/market/floor-history?days=30
router.get('/floor-history', async (req: Request, res: Response) => {
  try {
    const days = Math.min(parseInt(req.query.days as string) || 30, 365);

    const data = await cached(`market:floor-history:${days}`, 60 * 5, async () => {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const snapshots = await prisma.historicalSnapshot.findMany({
        where: { date: { gte: since } },
        orderBy: { date: 'asc' },
        select: { date: true, floorPriceEth: true },
      });

      // If snapshots are sparse, fill with market provider data
      const history = snapshots
        .filter(s => s.floorPriceEth != null)
        .map(s => ({
          date: s.date.toISOString().split('T')[0],
          floor: s.floorPriceEth as number,
        }));

      // Ensure we have at least current floor
      if (history.length === 0) {
        const floor = await marketDataProvider.getFloor().catch(() => null);
        if (floor?.floorPriceEth) {
          history.push({
            date: new Date().toISOString().split('T')[0],
            floor: floor.floorPriceEth,
          });
        }
      }

      return history;
    });

    res.json(data);
  } catch (err) {
    console.error('[market/floor-history]', err);
    res.status(500).json({ error: 'Failed to load floor history' });
  }
});

// GET /api/market/trait-demand
router.get('/trait-demand', async (req: Request, res: Response) => {
  try {
    const data = await cached('market:trait-demand', 60 * 5, async () => {
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const prior24h = new Date(now.getTime() - 48 * 60 * 60 * 1000);

      // Tokens transferred in last 24h
      const recentTransfers = await prisma.transfer.findMany({
        where: { timestamp: { gte: last24h } },
        select: { tokenId: true },
      });

      const priorTransfers = await prisma.transfer.findMany({
        where: { timestamp: { gte: prior24h, lt: last24h } },
        select: { tokenId: true },
      });

      async function getTraitCounts(tokenIds: number[]) {
        if (tokenIds.length === 0) return new Map<string, number>();
        const traits = await prisma.trait.findMany({
          where: { tokenId: { in: tokenIds } },
        });
        const counts = new Map<string, number>();
        for (const t of traits) {
          const key = `${t.category}::${t.value}`;
          counts.set(key, (counts.get(key) ?? 0) + 1);
        }
        return counts;
      }

      const [recentCounts, priorCounts] = await Promise.all([
        getTraitCounts(recentTransfers.map(t => t.tokenId)),
        getTraitCounts(priorTransfers.map(t => t.tokenId)),
      ]);

      const result: { category: string; value: string; count: number; pctChange: number }[] = [];
      const allKeys = new Set([...recentCounts.keys(), ...priorCounts.keys()]);

      for (const key of allKeys) {
        const [category, value] = key.split('::');
        const recent = recentCounts.get(key) ?? 0;
        const prior = priorCounts.get(key) ?? 0;
        const pctChange = prior === 0
          ? (recent > 0 ? 100 : 0)
          : ((recent - prior) / prior) * 100;

        result.push({ category, value, count: recent, pctChange });
      }

      return result.sort((a, b) => Math.abs(b.pctChange) - Math.abs(a.pctChange)).slice(0, 20);
    });

    res.json(data);
  } catch (err) {
    console.error('[market/trait-demand]', err);
    res.status(500).json({ error: 'Failed to load trait demand' });
  }
});

export default router;
