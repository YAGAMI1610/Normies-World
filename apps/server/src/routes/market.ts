// apps/server/src/routes/market.ts
import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { cached } from '../lib/redis';
import { marketDataProvider } from '../services/marketDataProvider';
import { analyzeRealTraitDemand } from '../services/realTraitAnalyzer';

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
    const data = await analyzeRealTraitDemand();
    res.json(data);
  } catch (err) {
    console.error('[market/trait-demand]', err);
    res.status(500).json({ error: 'Failed to load trait demand' });
  }
});

export default router;
