import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { cached } from '../lib/redis';
import { marketDataProvider } from '../services/marketDataProvider';

const router = Router();

// GET /api/dashboard/stats
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const data = await cached('dashboard:stats', 30, async () => {
      const now = new Date();
      const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const since1h  = new Date(now.getTime() - 60 * 60 * 1000);

      const [
        floor,
        volume24h,
        uniqueHolders,
        transfers24h,
        activeWhales,
        latestAlert,
      ] = await Promise.all([
        marketDataProvider.getFloor().catch(() => null),
        marketDataProvider.get24hVolumeEth().catch(() => null),
        prisma.wallet.count({ where: { ownerships: { some: { current: true } } } }),
        prisma.transfer.count({ where: { timestamp: { gte: since24h }, NOT: { fromAddress: '0x0000000000000000000000000000000000000000' } } }),
        prisma.wallet.count({ where: { isWhale: true, lastActive: { gte: since24h } } }),
        prisma.alert.findFirst({ orderBy: { createdAt: 'desc' }, select: { message: true } }),
      ]);

      // Floor 24h change — compare to snapshot 24h ago
      let floorChange24h: number | null = null;
      const snap = await prisma.historicalSnapshot.findFirst({
        where: { date: { lte: since24h } },
        orderBy: { date: 'desc' },
        select: { floorPriceEth: true },
      }).catch(() => null);

      if (floor?.floorPriceEth && snap?.floorPriceEth) {
        floorChange24h = ((floor.floorPriceEth - snap.floorPriceEth) / snap.floorPriceEth) * 100;
      }

      return {
        floorPriceEth: floor?.floorPriceEth ?? null,
        floorChange24h,
        volume24hEth: volume24h,
        uniqueHolders,
        activeWhales,
        totalTransfers24h: transfers24h,
        topAlert: latestAlert?.message ?? null,
      };
    });

    res.json(data);
  } catch (err) {
    console.error('[dashboard/stats]', err);
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

export default router;
