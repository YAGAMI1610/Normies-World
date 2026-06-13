import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { cached } from '../lib/redis';
import authMiddleware, { optionalAuth, type AuthRequest } from '../middleware/auth';

const router = Router();
router.use(optionalAuth);

// GET /api/whales?limit=20
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    
    const data = await cached(`whales:list:${limit}`, 60, async () => {
      const wallets = await prisma.wallet.findMany({
        where: { isWhale: true },
        orderBy: { whaleScore: 'desc' },
        take: limit,
        include: {
          ownerships: { where: { current: true } },
        },
      });

      return wallets.map(w => ({
        address: w.address,
        whaleScore: w.whaleScore ?? 0,
        holdingsCount: w.ownerships.length,
        avgHoldDurationDays: calculateAvgHold(w.ownerships),
        rarityTier: getRarityTier(w.ownerships),
        followed: false, // populated per-user below
      }));
    });

    // Personalize follow status if authenticated
    if (req.userId) {
      const follows = await prisma.whaleFollow.findMany({
        where: { userId: req.userId },
        select: { whaleAddress: true },
      });
      const followedSet = new Set(follows.map(f => f.whaleAddress));
      return res.json(data.map((w: any) => ({ ...w, followed: followedSet.has(w.address) })));
    }

    res.json(data);
  } catch (err) {
    console.error('[whales]', err);
    res.status(500).json({ error: 'Failed to load whales' });
  }
});

// GET /api/whales/:address
router.get('/:address', async (req: Request, res: Response) => {
  try {
    const address = req.params.address.toLowerCase();
    const wallet = await prisma.wallet.findUnique({
      where: { address },
      include: {
        ownerships: {
          where: { current: true },
          include: { normie: { include: { traits: true } } },
          orderBy: { acquiredAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!wallet) return res.status(404).json({ error: 'Whale not found' });

    res.json({
      address: wallet.address,
      whaleScore: wallet.whaleScore ?? 0,
      holdingsCount: wallet.ownerships.length,
      avgHoldDurationDays: calculateAvgHold(wallet.ownerships),
      rarityTier: getRarityTier(wallet.ownerships),
      recentAcquisitions: wallet.ownerships.slice(0, 10).map(o => ({
        tokenId: o.tokenId,
        acquiredAt: o.acquiredAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load whale detail' });
  }
});

// POST /api/whales/:address/follow
router.post('/:address/follow', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.whaleFollow.upsert({
      where: { userId_whaleAddress: { userId: req.userId!, whaleAddress: req.params.address.toLowerCase() } },
      update: {},
      create: { userId: req.userId!, whaleAddress: req.params.address.toLowerCase() },
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to follow whale' });
  }
});

// DELETE /api/whales/:address/follow
router.delete('/:address/follow', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.whaleFollow.deleteMany({
      where: { userId: req.userId!, whaleAddress: req.params.address.toLowerCase() },
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unfollow' });
  }
});

// GET /api/whales/:address/similarity
router.get('/:address/similarity', async (req: Request, res: Response) => {
  try {
    // Simple similarity: find whales with closest avg hold + holding count
    const address = req.params.address.toLowerCase();
    const wallet = await prisma.wallet.findUnique({ where: { address }, include: { ownerships: { where: { current: true } } } });
    if (!wallet) return res.status(404).json({ error: 'Not found' });

    const myHold = calculateAvgHold(wallet.ownerships);
    const myCount = wallet.ownerships.length;

    const whales = await prisma.wallet.findMany({
      where: { isWhale: true, NOT: { address } },
      include: { ownerships: { where: { current: true } } },
      take: 50,
    });

    let bestScore = -1;
    let closestWhale: any = null;

    for (const w of whales) {
      const hold = calculateAvgHold(w.ownerships);
      const count = w.ownerships.length;
      // Normalize differences
      const holdDiff = Math.abs(myHold - hold) / (Math.max(myHold, hold, 1));
      const countDiff = Math.abs(myCount - count) / (Math.max(myCount, count, 1));
      const score = 100 * (1 - (holdDiff + countDiff) / 2);
      if (score > bestScore) { bestScore = score; closestWhale = w; }
    }

    res.json({
      score: Math.round(bestScore),
      closestWhale: closestWhale ? {
        address: closestWhale.address,
        whaleScore: closestWhale.whaleScore ?? 0,
        holdingsCount: closestWhale.ownerships.length,
        avgHoldDurationDays: calculateAvgHold(closestWhale.ownerships),
        rarityTier: getRarityTier(closestWhale.ownerships),
        followed: false,
      } : null,
    });
  } catch (err) {
    res.status(500).json({ error: 'Similarity computation failed' });
  }
});

function calculateAvgHold(ownerships: { acquiredAt: Date }[]): number {
  if (!ownerships.length) return 0;
  const now = Date.now();
  const totalDays = ownerships.reduce((s, o) => s + (now - o.acquiredAt.getTime()) / 86_400_000, 0);
  return totalDays / ownerships.length;
}

function getRarityTier(ownerships: { normie?: { rarityRank?: number | null } | null }[]): string {
  if (!ownerships.length) return 'Unknown';
  const avgRank = ownerships.reduce((s, o) => s + (o.normie?.rarityRank ?? 5000), 0) / ownerships.length;
  if (avgRank <= 500) return 'Legendary';
  if (avgRank <= 1000) return 'Epic';
  if (avgRank <= 3000) return 'Rare';
  return 'Common';
}

export default router;
