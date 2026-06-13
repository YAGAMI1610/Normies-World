// apps/server/src/routes/history.ts
import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { cached } from '../lib/redis';

const router = Router();

// GET /api/history/snapshot/:date — reconstruct state on a given date (YYYY-MM-DD)
router.get('/snapshot/:date', async (req: Request, res: Response) => {
  try {
    const dateStr = req.params.date;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return res.status(400).json({ error: 'Date must be YYYY-MM-DD' });
    }

    const date = new Date(dateStr + 'T00:00:00.000Z');
    if (isNaN(date.getTime())) {
      return res.status(400).json({ error: 'Invalid date' });
    }

    const cacheKey = `history:snapshot:${dateStr}`;
    const data = await cached(cacheKey, 60 * 60, async () => {
      // Look for a pre-computed snapshot
      const snap = await prisma.historicalSnapshot.findFirst({
        where: { date: { gte: date, lt: new Date(date.getTime() + 24 * 60 * 60 * 1000) } },
      });

      if (snap) {
        return {
          date: snap.date.toISOString().split('T')[0],
          holderCount: snap.holderCount,
          floorPriceEth: snap.floorPriceEth,
          transferCount: 0,
          topHolders: snap.whaleLeaderboard as { address: string; count: number }[],
          topTraits: snap.topTraits as { category: string; value: string; count: number }[],
        };
      }

      // Reconstruct from transfer data
      const endDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

      // Count transfers on that day
      const transferCount = await prisma.transfer.count({
        where: { timestamp: { gte: date, lt: endDate } },
      });

      // Reconstruct holder state: all wallets that had > 0 tokens at end of date
      // Using current ownerships minus transfers after date + transfers before date
      const ownershipsAtDate = await prisma.normieOwnership.findMany({
        where: { acquiredAt: { lte: endDate } },
        select: { walletId: true, tokenId: true, wallet: { select: { address: true } } },
      });

      // Group by wallet
      const holdingsByWallet = new Map<string, { address: string; count: number }>();
      for (const o of ownershipsAtDate) {
        const addr = o.wallet.address;
        const existing = holdingsByWallet.get(addr) ?? { address: addr, count: 0 };
        existing.count += 1;
        holdingsByWallet.set(addr, existing);
      }

      const uniqueHolders = holdingsByWallet.size;
      const topHolders = Array.from(holdingsByWallet.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 20)
        .map(h => ({ address: h.address, count: h.count }));

      // Top traits among tokens that changed hands that day
      const dayTransfers = await prisma.transfer.findMany({
        where: { timestamp: { gte: date, lt: endDate } },
        select: { tokenId: true },
      });

      const tokenIds = dayTransfers.map(t => t.tokenId);
      const topTraits: { category: string; value: string; count: number }[] = [];

      if (tokenIds.length > 0) {
        const traits = await prisma.trait.findMany({
          where: { tokenId: { in: tokenIds } },
        });
        const traitCounts = new Map<string, number>();
        for (const t of traits) {
          const key = `${t.category}::${t.value}`;
          traitCounts.set(key, (traitCounts.get(key) ?? 0) + 1);
        }
        for (const [key, count] of traitCounts) {
          const [category, value] = key.split('::');
          topTraits.push({ category, value, count });
        }
        topTraits.sort((a, b) => b.count - a.count);
      }

      return {
        date: dateStr,
        holderCount: uniqueHolders,
        floorPriceEth: null, // historical floor not available without price oracle
        transferCount,
        topHolders,
        topTraits: topTraits.slice(0, 20),
      };
    });

    res.json(data);
  } catch (err) {
    console.error('[history/snapshot]', err);
    res.status(500).json({ error: 'Failed to reconstruct snapshot' });
  }
});

export default router;
