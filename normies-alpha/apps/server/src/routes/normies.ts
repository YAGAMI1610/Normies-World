// apps/server/src/routes/normies.ts
// Proxies / enriches Normies API data for the frontend.
// Adds rarity data from our DB on top of raw API responses.

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { cached } from '../lib/redis';
import { normiesApi } from '../services/normiesApiClient';

const router = Router();

// GET /api/normies/:tokenId — full enriched token data
router.get('/:tokenId', async (req: Request, res: Response) => {
  try {
    const tokenId = parseInt(req.params.tokenId);
    if (isNaN(tokenId) || tokenId < 0 || tokenId > 9999) {
      return res.status(400).json({ error: 'tokenId must be 0-9999' });
    }

    const data = await cached(`normies:token:${tokenId}`, 60 * 10, async () => {
      const [metadata, traits, canvasInfo, owner, normieDb, agentBinding] = await Promise.all([
        normiesApi.metadata(tokenId).catch(() => null),
        normiesApi.traits(tokenId).catch(() => null),
        normiesApi.canvasInfo(tokenId).catch(() => null),
        normiesApi.owner(tokenId).catch(() => null),
        prisma.normie.findUnique({ where: { tokenId } }).catch(() => null),
        normiesApi.agentBinding(tokenId).catch(() => null),
      ]);

      return {
        tokenId,
        name: metadata?.name ?? `Normie #${tokenId}`,
        imageUrl: normiesApi.imagePngUrl(tokenId),
        imageSvgUrl: normiesApi.imageSvgUrl(tokenId),
        originalImageUrl: normiesApi.originalImagePngUrl(tokenId),
        attributes: metadata?.attributes ?? [],
        traits: traits?.attributes ?? [],
        canvas: canvasInfo
          ? {
              level: canvasInfo.level,
              actionPoints: canvasInfo.actionPoints,
              customized: canvasInfo.customized,
              delegate: canvasInfo.delegate,
            }
          : null,
        owner: owner?.owner ?? null,
        rarity: {
          rank: normieDb?.rarityRank ?? null,
          score: normieDb?.rarityScore ?? null,
        },
        agentBound: !!(agentBinding?.binding),
        agentId: agentBinding?.binding?.agentId ?? null,
      };
    });

    res.json(data);
  } catch (err) {
    console.error('[normies/:tokenId]', err);
    res.status(500).json({ error: 'Failed to load token data' });
  }
});

// GET /api/normies/:tokenId/agent — full agent persona
router.get('/:tokenId/agent', async (req: Request, res: Response) => {
  try {
    const tokenId = parseInt(req.params.tokenId);
    if (isNaN(tokenId)) return res.status(400).json({ error: 'Invalid tokenId' });

    const data = await cached(`normies:agent:${tokenId}`, 60, async () => {
      return normiesApi.agentInfo(tokenId);
    });

    res.json(data);
  } catch (err) {
    res.status(404).json({ error: 'Agent not found or not registered' });
  }
});

// GET /api/normies/:tokenId/versions — canvas transform history
router.get('/:tokenId/versions', async (req: Request, res: Response) => {
  try {
    const tokenId = parseInt(req.params.tokenId);
    const versions = await normiesApi.versions(tokenId);
    res.json(versions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load versions' });
  }
});

// GET /api/normies/holders/:address — all tokens held by address
router.get('/holders/:address', async (req: Request, res: Response) => {
  try {
    const address = req.params.address.toLowerCase();
    const data = await cached(`normies:holders:${address}`, 30, async () => {
      const holders = await normiesApi.holders(address);
      const tokenIds = holders.tokenIds.map(Number);

      // Enrich with rarity data from DB
      const normieRecords = await prisma.normie.findMany({
        where: { tokenId: { in: tokenIds } },
        select: { tokenId: true, rarityRank: true, rarityScore: true },
      });
      const rarityMap = new Map(normieRecords.map(n => [n.tokenId, n]));

      return tokenIds.map(id => ({
        tokenId: id,
        imageUrl: normiesApi.imagePngUrl(id),
        rarityRank: rarityMap.get(id)?.rarityRank ?? null,
        rarityScore: rarityMap.get(id)?.rarityScore ?? null,
      }));
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load holdings' });
  }
});

// GET /api/normies/agents/list — registered agents
router.get('/agents/list', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const data = await cached(`normies:agents:list:${limit}`, 60 * 5, async () => {
      return normiesApi.agentsList({ limit });
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load agents' });
  }
});

// GET /api/normies/canvas/status — global canvas contract status
router.get('/canvas/status', async (_req: Request, res: Response) => {
  try {
    const data = await cached('normies:canvas:status', 60 * 5, async () => {
      return normiesApi.canvasStatus();
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load canvas status' });
  }
});

// GET /api/normies/history/stats — global canvas activity stats
router.get('/history/stats', async (_req: Request, res: Response) => {
  try {
    const data = await cached('normies:history:stats', 60 * 5, async () => {
      return normiesApi.globalStats();
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load global stats' });
  }
});

export default router;
