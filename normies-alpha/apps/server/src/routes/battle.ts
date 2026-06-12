// apps/server/src/routes/battle.ts
import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { cached } from '../lib/redis';
import { normiesApi } from '../services/normiesApiClient';
import { generateCardFromNormie } from '../services/cardGenEngine';
import type { AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/battle/leaderboard
router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const data = await cached(`battle:leaderboard:${limit}`, 30, async () => {
      const stats = await prisma.battleStats.findMany({
        orderBy: { elo: 'desc' },
        take: limit,
        include: { user: { select: { primaryWallet: true } } },
      });

      return stats.map((s, i) => ({
        userId: s.userId,
        walletAddress: s.user?.primaryWallet ?? '0x???',
        elo: s.elo,
        wins: s.wins,
        losses: s.losses,
        winStreak: s.winStreak,
        rank: i + 1,
      }));
    });

    res.json(data);
  } catch (err) {
    console.error('[battle/leaderboard]', err);
    res.status(500).json({ error: 'Failed to load leaderboard' });
  }
});

// GET /api/battle/my-cards — returns battle cards for connected wallet's Normies
router.get('/my-cards', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.walletAddress) {
      return res.status(401).json({ error: 'Wallet not connected' });
    }

    const address = req.walletAddress.toLowerCase();

    // Get tokenIds from Normies API
    let tokenIds: number[] = [];
    try {
      const holders = await normiesApi.holders(address);
      tokenIds = holders.tokenIds.map(Number).slice(0, 50); // cap at 50 cards
    } catch {
      // Fallback to DB if API unavailable
      const ownerships = await prisma.normieOwnership.findMany({
        where: {
          wallet: { address },
          current: true,
        },
        select: { tokenId: true },
        take: 50,
      });
      tokenIds = ownerships.map(o => o.tokenId);
    }

    if (tokenIds.length === 0) {
      return res.json([]);
    }

    // Generate/retrieve battle cards for each token
    const cards = await Promise.all(
      tokenIds.map(async (tokenId) => {
        // Check if card already generated
        let card = await prisma.battleCard.findUnique({
          where: { tokenId },
          include: { normie: { include: { traits: true } } },
        });

        if (!card) {
          // Generate card from Normies API data
          try {
            const [traits, metadata] = await Promise.all([
              normiesApi.traits(tokenId),
              normiesApi.metadata(tokenId),
            ]);
            card = await generateCardFromNormie(tokenId, traits, metadata);
          } catch {
            // Return a basic card if API fails
            return {
              tokenId,
              name: `Normie #${tokenId}`,
              imageUrl: normiesApi.imagePngUrl(tokenId),
              rarityRank: null,
              rarityTier: 'Common',
              attack: 50,
              defense: 50,
              speed: 50,
              ability: 'Normie Strike',
              abilityDescription: 'A basic attack.',
              traits: {},
              owned: true,
            };
          }
        }

        const traitMap = card.normie?.traits
          ? Object.fromEntries(card.normie.traits.map(t => [t.category, t.value]))
          : {};

        return {
          tokenId: card.tokenId,
          name: card.normie?.rarityRank ? `Normie #${tokenId}` : `Normie #${tokenId}`,
          imageUrl: normiesApi.imagePngUrl(tokenId),
          rarityRank: card.normie?.rarityRank ?? null,
          rarityTier: card.rarityTier,
          attack: card.attack,
          defense: card.defense,
          speed: card.speed,
          ability: card.specialAbility,
          abilityDescription: card.abilityDescription,
          traits: traitMap,
          owned: true,
        };
      })
    );

    res.json(cards);
  } catch (err) {
    console.error('[battle/my-cards]', err);
    res.status(500).json({ error: 'Failed to load cards' });
  }
});

// GET /api/battle/card/:tokenId — public card data
router.get('/card/:tokenId', async (req: Request, res: Response) => {
  try {
    const tokenId = parseInt(req.params.tokenId);
    if (isNaN(tokenId) || tokenId < 0 || tokenId > 9999) {
      return res.status(400).json({ error: 'Invalid tokenId' });
    }

    let card = await prisma.battleCard.findUnique({
      where: { tokenId },
      include: { normie: { include: { traits: true } } },
    });

    if (!card) {
      const [traits, metadata] = await Promise.all([
        normiesApi.traits(tokenId),
        normiesApi.metadata(tokenId),
      ]);
      card = await generateCardFromNormie(tokenId, traits, metadata);
    }

    const traitMap = card.normie?.traits
      ? Object.fromEntries(card.normie.traits.map(t => [t.category, t.value]))
      : {};

    // Check ownership
    let owned = false;
    const ownerData = await normiesApi.owner(tokenId).catch(() => null);
    if (ownerData) {
      const authReq = req as AuthRequest;
      owned = !!(authReq.walletAddress &&
        ownerData.owner.toLowerCase() === authReq.walletAddress.toLowerCase());
    }

    res.json({
      tokenId: card.tokenId,
      name: `Normie #${tokenId}`,
      imageUrl: normiesApi.imagePngUrl(tokenId),
      rarityRank: card.normie?.rarityRank ?? null,
      rarityTier: card.rarityTier,
      attack: card.attack,
      defense: card.defense,
      speed: card.speed,
      ability: card.specialAbility,
      abilityDescription: card.abilityDescription,
      traits: traitMap,
      owned,
    });
  } catch (err) {
    console.error('[battle/card]', err);
    res.status(500).json({ error: 'Failed to load card' });
  }
});

// POST /api/battle/matchmake — find or create a match
router.post('/matchmake', async (req: AuthRequest, res: Response) => {
  try {
    const { mode = 'CASUAL' } = req.body as { mode?: string };
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });

    // Ensure user has battle stats
    await prisma.battleStats.upsert({
      where: { userId: req.userId },
      update: {},
      create: { userId: req.userId },
    });

    // Look for an open match in the queue
    const openMatch = await prisma.match.findFirst({
      where: {
        mode,
        endedAt: null,
        player2Id: { equals: req.userId }, // waiting for opponent
        NOT: { player1Id: req.userId },
      },
    });

    if (openMatch) {
      // Join as player 2
      const match = await prisma.match.update({
        where: { id: openMatch.id },
        data: { player2Id: req.userId },
      });
      return res.json({ matchId: match.id, role: 'player2', status: 'ready' });
    }

    // Create new match waiting for opponent
    const match = await prisma.match.create({
      data: {
        mode,
        player1Id: req.userId,
        player2Id: req.userId, // temporary self-reference until opponent joins
        state: { phase: 'waiting', turns: [] },
      },
    });

    res.json({ matchId: match.id, role: 'player1', status: 'waiting' });
  } catch (err) {
    console.error('[battle/matchmake]', err);
    res.status(500).json({ error: 'Matchmaking failed' });
  }
});

export default router;
