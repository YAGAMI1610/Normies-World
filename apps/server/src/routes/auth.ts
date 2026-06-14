import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { SiweMessage } from 'siwe';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';

const router = Router();

export interface AuthRequest extends Request {
  userId?: string;
  whaleAddress?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string; whaleAddress: string };
    req.userId = payload.userId;
    req.whaleAddress = payload.whaleAddress;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string; whaleAddress: string };
      req.userId = payload.userId;
      req.whaleAddress = payload.whaleAddress;
    } catch { /* ignore */ }
  }
  next();
}

function validateAddress(address: unknown): address is string {
  return typeof address === 'string' && /^0x[a-fA-F0-9]{40}$/.test(address);
}

router.get('/nonce/:address', async (req: Request, res: Response) => {
  const address = req.params.address?.toLowerCase();
  if (!validateAddress(address)) {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }

  const nonce = randomBytes(16).toString('hex');
  await redis.set(`siwe:nonce:${address}`, nonce, 'EX', 300);
  res.json({ nonce });
});

router.post('/verify', async (req: Request, res: Response) => {
  const { address, signature, message } = req.body;
  if (!validateAddress(address) || typeof signature !== 'string' || typeof message !== 'string') {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const normalizedAddress = address.toLowerCase();
  const storedNonce = await redis.get(`siwe:nonce:${normalizedAddress}`);
  if (!storedNonce) {
    return res.status(400).json({ error: 'Nonce expired or missing' });
  }

  try {
    const siweMessage = new SiweMessage(message);
    const verification = await siweMessage.verify({ signature, nonce: storedNonce });
    if (!verification.success || siweMessage.address.toLowerCase() !== normalizedAddress) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
  } catch (err) {
    console.error('[auth/verify] verification failed', err);
    return res.status(401).json({ error: 'Signature verification failed' });
  }

  await redis.del(`siwe:nonce:${normalizedAddress}`);

  let user = await prisma.user.findUnique({ where: { primaryWallet: normalizedAddress } });
  if (!user) {
    user = await prisma.user.create({ data: { primaryWallet: normalizedAddress } });
  }

  await prisma.wallet.upsert({
    where: { address: normalizedAddress },
    create: { address: normalizedAddress },
    update: { lastActive: new Date() },
  });

  const token = jwt.sign(
    { userId: user.id, whaleAddress: normalizedAddress },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  );

  res.json({ token, user: { id: user.id, primaryWallet: user.primaryWallet } });
});

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ id: user.id, primaryWallet: user.primaryWallet });
  } catch (err) {
    console.error('[auth/me]', err);
    res.status(500).json({ error: 'Failed to load user' });
  }
});

export default router;
