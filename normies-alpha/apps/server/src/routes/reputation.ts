import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { cached } from '../lib/redis';
import { recalculateReputation } from '../services/reputationEngine';

const router = Router();

// GET /api/reputation/leaderboard
router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const data = await cached(`reputation:leaderboard:${limit}`, 120, async () => {
      const reputations = await prisma.reputation.findMany({
        orderBy: { score: 'desc' },
        take: limit,
        include: { user: { select: { primaryWallet: true } } },
      });

      return reputations.map((r, i) => ({
        userId: r.userId,
        whaleAddress: r.user?.primaryWallet ?? '0x???',
        score: r.score,
        level: r.level,
        xp: r.xp,
        badges: r?.badges,
        rank: i + 1,
      }));
    });

    res.json(data);
  } catch (err) {
    console.error('[reputation/leaderboard]', err);
    res.status(500).json({ error: 'Failed to load leaderboard' });
  }
});

// GET /api/reputation/profile/:whaleAddress
router.get('/profile/:whaleAddress', async (req: Request, res: Response) => {
  try {
    const address = req.params.whaleAddress.toLowerCase();

    const user = await prisma.user.findFirst({
      where: { primaryWallet: address },
      include: { reputation: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'Profile not found. Connect your wallet to create one.' });
    }

    if (!user.reputation) {
      // Trigger calculation on first access
      await recalculateReputation(user.id);
      const fresh = await prisma.reputation.findUnique({ where: { userId: user.id } });
      if (!fresh) return res.json({ userId: user.id, whaleAddress: address, score: 0, level: 1, xp: 0, badges: [], rank: null });
    }

    // Get rank
    const rank = await prisma.reputation.count({
      where: { score: { gt: user.reputation?.score ?? 0 } },
    });

    res.json({
      userId: user.id,
      whaleAddress: address,
      score: user.reputation?.score ?? 0,
      level: user.reputation?.level ?? 1,
      xp: user.reputation?.xp ?? 0,
      badges: user.reputation?.badges ?? [],
      rank: rank + 1,
    });
  } catch (err) {
    console.error('[reputation/profile]', err);
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

export default router;
