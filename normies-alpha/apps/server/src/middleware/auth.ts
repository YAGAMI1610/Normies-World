import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../lib/env';

export interface AuthRequest extends Request {
  userId?: string;
  whaleAddress?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string; whaleAddress: string };
    req.userId = payload.userId;
    req.whaleAddress = payload.whaleAddress;
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string; whaleAddress: string };
      req.userId = payload.userId;
      req.whaleAddress = payload.whaleAddress;
    } catch {
      // ignore invalid optional auth tokens
    }
  }
  return next();
}

export default authMiddleware;
