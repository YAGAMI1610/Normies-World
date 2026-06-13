// apps/server/src/services/battleEngine.ts
// Multiplayer battle engine. Socket.io-driven game loop.

import type { Server as SocketServer, Socket } from 'socket.io';
import { redis } from '../lib/redis';
import { prisma } from '../lib/prisma';
import { getOrCreateBattleCard } from './cardGenEngine';
import type { BattleCardData } from '@normies-alpha/shared-types';
import { randomUUID } from 'crypto';

const K = 32;

export interface ActiveMatch {
  matchId: string;
  mode: string;
  player1: { userId: string; socketId: string; card: BattleCardData; hp: number };
  player2: { userId: string; socketId: string; card: BattleCardData; hp: number };
  turn: number;
  phase: 'waiting' | 'active' | 'finished';
  log: string[];
}

const activeMatches = new Map<string, ActiveMatch>();
// matchmaking queue: userId -> { socketId, tokenId, mode }
const queue = new Map<string, { socketId: string; tokenId: number; mode: string }>();

function calcEloChange(winnerElo: number, loserElo: number) {
  const expected = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  const delta = Math.round(K * (1 - expected));
  return { winner: delta, loser: -Math.round(K * expected) };
}

function resolveAttack(attacker: BattleCardData, defender: BattleCardData) {
  const speedBonus = attacker.speed > defender.speed ? 1.1 : 1.0;
  const rawDamage = Math.max(1, Math.round((attacker.attack * speedBonus) - (defender.defense * 0.5)));
  return {
    damage: rawDamage,
    log: `${attacker.specialAbility ? `[${attacker.specialAbility}] ` : ''}${attacker.name} deals ${rawDamage} damage`,
  };
}

async function startMatch(
  io: SocketServer,
  p1: { userId: string; socketId: string; tokenId: number },
  p2: { userId: string; socketId: string; tokenId: number },
  mode: string
) {
  const matchId = randomUUID();
  const [card1, card2] = await Promise.all([
    getOrCreateBattleCard(p1.tokenId),
    getOrCreateBattleCard(p2.tokenId),
  ]);

  const match: ActiveMatch = {
    matchId,
    mode,
    player1: { userId: p1.userId, socketId: p1.socketId, card: card1, hp: 100 },
    player2: { userId: p2.userId, socketId: p2.socketId, card: card2, hp: 100 },
    turn: 0,
    phase: 'active',
    log: [`Battle started! ${card1.name} vs ${card2.name}`],
  };

  activeMatches.set(matchId, match);
  await redis.set(`battle:match:${matchId}`, JSON.stringify(match), { EX: 3600 });

  // Create DB record
  await prisma.match.create({
    data: {
      id: matchId,
      mode,
      player1Id: p1.userId,
      player2Id: p2.userId,
      state: { phase: 'active' } as any,
    },
  }).catch(() => {}); // non-fatal if schema differs

  io.to(p1.socketId).emit('battle:started', { matchId, yourCard: card1, opponentCard: card2, yourTurn: true });
  io.to(p2.socketId).emit('battle:started', { matchId, yourCard: card2, opponentCard: card1, yourTurn: false });
}

async function finishMatch(io: SocketServer, match: ActiveMatch, winnerId: string) {
  match.phase = 'finished';
  const loserId = winnerId === match.player1.userId ? match.player2.userId : match.player1.userId;

  const [winnerStats, loserStats] = await Promise.all([
    prisma.battleStats.upsert({ where: { userId: winnerId }, update: {}, create: { userId: winnerId } }),
    prisma.battleStats.upsert({ where: { userId: loserId }, update: {}, create: { userId: loserId } }),
  ]);

  const { winner: winDelta, loser: lossDelta } = calcEloChange(winnerStats.elo, loserStats.elo);

  await Promise.all([
    prisma.battleStats.update({ where: { userId: winnerId }, data: { wins: { increment: 1 }, elo: { increment: winDelta }, winStreak: { increment: 1 } } }),
    prisma.battleStats.update({ where: { userId: loserId }, data: { losses: { increment: 1 }, elo: { increment: lossDelta }, winStreak: 0 } }),
    prisma.match.update({ where: { id: match.matchId }, data: { winnerId, endedAt: new Date(), state: { phase: 'finished', log: match.log, turns: match.turn } as any } }).catch(() => {}),
  ]);

  const result = { matchId: match.matchId, winnerId, log: match.log, eloChange: winDelta };
  io.to(match.player1.socketId).emit('battle:finished', result);
  io.to(match.player2.socketId).emit('battle:finished', result);

  activeMatches.delete(match.matchId);
  await redis.del(`battle:match:${match.matchId}`);
}

export function registerBattleSocket(io: SocketServer) {
  io.on('connection', (socket: Socket) => {
    // Matchmaking
    socket.on('battle:queue', async ({ userId, tokenId, mode = 'casual' }: { userId: string; tokenId: number; mode: string }) => {
      // Check if someone is already waiting in same mode
      let opponent: { userId: string; socketId: string; tokenId: number; mode: string } | undefined;
      for (const [qUserId, qData] of queue.entries()) {
        if (qData.mode === mode && qUserId !== userId) {
          opponent = { userId: qUserId, ...qData };
          queue.delete(qUserId);
          break;
        }
      }

      if (opponent) {
        await startMatch(io, { userId, socketId: socket.id, tokenId }, opponent, mode);
      } else {
        queue.set(userId, { socketId: socket.id, tokenId, mode });
        socket.emit('battle:queued', { position: queue.size });
      }
    });

    socket.on('battle:dequeue', ({ userId }: { userId: string }) => {
      queue.delete(userId);
      socket.emit('battle:dequeued');
    });

    socket.on('battle:action', async ({ matchId, userId, action }: { matchId: string; userId: string; action: 'attack' | 'defend' | 'ability' }) => {
      const match = activeMatches.get(matchId);
      if (!match || match.phase !== 'active') return;

      const isP1 = match.player1.userId === userId;
      const attacker = isP1 ? match.player1 : match.player2;
      const defender = isP1 ? match.player2 : match.player1;

      let logEntry = '';

      if (action === 'attack') {
        const { damage, log } = resolveAttack(attacker.card, defender.card);
        defender.hp = Math.max(0, defender.hp - damage);
        logEntry = log;
      } else if (action === 'defend') {
        attacker.hp = Math.min(100, attacker.hp + 10);
        logEntry = `${attacker.card.name} defends and restores 10 HP.`;
      } else if (action === 'ability') {
        const { damage } = resolveAttack({ ...attacker.card, attack: Math.round(attacker.card.attack * 1.5) }, defender.card);
        defender.hp = Math.max(0, defender.hp - damage);
        attacker.hp = Math.max(0, attacker.hp - 5);
        logEntry = `${attacker.card.name} uses ${attacker.card.specialAbility}! Deals ${damage} damage.`;
      }

      match.turn++;
      match.log.push(logEntry);

      const stateUpdate = { matchId, turn: match.turn, p1Hp: match.player1.hp, p2Hp: match.player2.hp, log: logEntry };
      io.to(match.player1.socketId).emit('battle:turnResult', { ...stateUpdate, yourTurn: !isP1 });
      io.to(match.player2.socketId).emit('battle:turnResult', { ...stateUpdate, yourTurn: isP1 });

      if (defender.hp <= 0 || match.turn >= 20) {
        const winnerId = defender.hp <= 0 ? attacker.userId : (match.player1.hp >= match.player2.hp ? match.player1.userId : match.player2.userId);
        await finishMatch(io, match, winnerId);
      } else {
        await redis.set(`battle:match:${matchId}`, JSON.stringify(match), { EX: 3600 });
      }
    });

    socket.on('disconnect', () => {
      // Remove from queue if disconnected
      for (const [uid, data] of queue.entries()) {
        if (data.socketId === socket.id) { queue.delete(uid); break; }
      }
    });
  });
}
