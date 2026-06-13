import { Router, Request, Response } from 'express';
import { SiweMessage } from 'siwe';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { env } from '../lib/env';
import { cached } from '../lib/redis';

const router = Router();

// GET /api/auth/nonce/:address
router.get('/nonce/:address', async (req: Request, res: Response) => {
  const { address } = req.params;
  const nonce = Math.random().toString(36).substring(2, 15);
  // Cache nonce for 10 minutes
  await cached(`nonce:${address.toLowerCase()}`, 600, async () => nonce);
  res.json({ nonce });
});

// POST /api/auth/verify
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { address, signature, message } = req.body as {
      address: string;
      signature: string;
      message: string;
    };

    const siweMessage = new SiweMessage(message);
    const result = await siweMessage.verify({ signature });

    if (!result.success || result.data.address.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: 'Signature verification failed' });
    }

    // Upsert user + wallet
    const wallet = await prisma.wallet.upsert({
      where: { address: address.toLowerCase() },
      update: { lastActive: new Date() },
      create: { address: address.toLowerCase() },
    });

    let user = wallet.userId
      ? await prisma.user.findUnique({ where: { id: wallet.userId } })
      : null;

    if (!user) {
      user = await prisma.user.create({
        data: {
          primaryWallet: address.toLowerCase(),
          wallets: { connect: { id: wallet.id } },
        },
      });
    }

    const token = jwt.sign(
      { userId: user.id, whaleAddress: address.toLowerCase() },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, primaryWallet: address.toLowerCase() } });
  } catch (err) {
    console.error('[auth/verify]', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// GET /api/auth/me
router.get('/me', async (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { reputation: true, battleStats: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
