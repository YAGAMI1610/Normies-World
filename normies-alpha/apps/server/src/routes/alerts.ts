import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// GET /api/alerts?limit=20&severity=HIGH
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const severity = req.query.severity as string | undefined;

    const alerts = await prisma.alert.findMany({
      where: severity ? { severity: severity as any } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    res.json(alerts);
  } catch (err) {
    console.error('[alerts]', err);
    res.status(500).json({ error: 'Failed to load alerts' });
  }
});

export default router;
