"use strict";
// apps/server/src/services/battleEngine.ts
// Multiplayer battle engine. Socket.io-driven game loop.
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerBattleSocket = registerBattleSocket;
const redis_1 = require("../lib/redis");
const prisma_1 = require("../lib/prisma");
const cardGenEngine_1 = require("./cardGenEngine");
const crypto_1 = require("crypto");
const K = 32;
const activeMatches = new Map();
// matchmaking queue: userId -> { socketId, tokenId, mode }
const queue = new Map();
function calcEloChange(winnerElo, loserElo) {
    const expected = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
    const delta = Math.round(K * (1 - expected));
    return { winner: delta, loser: -Math.round(K * expected) };
}
function resolveAttack(attacker, defender) {
    const speedBonus = attacker.speed > defender.speed ? 1.1 : 1.0;
    const rawDamage = Math.max(1, Math.round((attacker.attack * speedBonus) - (defender.defense * 0.5)));
    return {
        damage: rawDamage,
        log: `${attacker.specialAbility ? `[${attacker.specialAbility}] ` : ''}${attacker.name} deals ${rawDamage} damage`,
    };
}
async function startMatch(io, p1, p2, mode) {
    const matchId = (0, crypto_1.randomUUID)();
    const [card1, card2] = await Promise.all([
        (0, cardGenEngine_1.getOrCreateBattleCard)(p1.tokenId),
        (0, cardGenEngine_1.getOrCreateBattleCard)(p2.tokenId),
    ]);
    const match = {
        matchId,
        mode,
        player1: { userId: p1.userId, socketId: p1.socketId, card: card1, hp: 100 },
        player2: { userId: p2.userId, socketId: p2.socketId, card: card2, hp: 100 },
        turn: 0,
        phase: 'active',
        log: [`Battle started! ${card1.name} vs ${card2.name}`],
    };
    activeMatches.set(matchId, match);
    await redis_1.redis.set(`battle:match:${matchId}`, JSON.stringify(match), 'EX', 3600);
    // Create DB record
    await prisma_1.prisma.match.create({
        data: {
            id: matchId,
            mode,
            player1Id: p1.userId,
            player2Id: p2.userId,
            state: { phase: 'active' },
        },
    }).catch(() => { }); // non-fatal if schema differs
    io.to(p1.socketId).emit('battle:started', { matchId, yourCard: card1, opponentCard: card2, yourTurn: true });
    io.to(p2.socketId).emit('battle:started', { matchId, yourCard: card2, opponentCard: card1, yourTurn: false });
}
async function finishMatch(io, match, winnerId) {
    match.phase = 'finished';
    const loserId = winnerId === match.player1.userId ? match.player2.userId : match.player1.userId;
    const [winnerStats, loserStats] = await Promise.all([
        prisma_1.prisma.battleStats.upsert({ where: { userId: winnerId }, update: {}, create: { userId: winnerId } }),
        prisma_1.prisma.battleStats.upsert({ where: { userId: loserId }, update: {}, create: { userId: loserId } }),
    ]);
    const { winner: winDelta, loser: lossDelta } = calcEloChange(winnerStats.elo, loserStats.elo);
    await Promise.all([
        prisma_1.prisma.battleStats.update({ where: { userId: winnerId }, data: { wins: { increment: 1 }, elo: { increment: winDelta }, winStreak: { increment: 1 } } }),
        prisma_1.prisma.battleStats.update({ where: { userId: loserId }, data: { losses: { increment: 1 }, elo: { increment: lossDelta }, winStreak: 0 } }),
        prisma_1.prisma.match.update({ where: { id: match.matchId }, data: { winnerId, endedAt: new Date(), state: { phase: 'finished', log: match.log, turns: match.turn } } }).catch(() => { }),
    ]);
    const result = { matchId: match.matchId, winnerId, log: match.log, eloChange: winDelta };
    io.to(match.player1.socketId).emit('battle:finished', result);
    io.to(match.player2.socketId).emit('battle:finished', result);
    activeMatches.delete(match.matchId);
    await redis_1.redis.del(`battle:match:${match.matchId}`);
}
function registerBattleSocket(io) {
    io.on('connection', (socket) => {
        // Matchmaking
        socket.on('battle:queue', async ({ userId, tokenId, mode = 'casual' }) => {
            // Check if someone is already waiting in same mode
            let opponent;
            for (const [qUserId, qData] of queue.entries()) {
                if (qData.mode === mode && qUserId !== userId) {
                    opponent = { userId: qUserId, ...qData };
                    queue.delete(qUserId);
                    break;
                }
            }
            if (opponent) {
                await startMatch(io, { userId, socketId: socket.id, tokenId }, opponent, mode);
            }
            else {
                queue.set(userId, { socketId: socket.id, tokenId, mode });
                socket.emit('battle:queued', { position: queue.size });
            }
        });
        socket.on('battle:dequeue', ({ userId }) => {
            queue.delete(userId);
            socket.emit('battle:dequeued');
        });
        socket.on('battle:action', async ({ matchId, userId, action }) => {
            const match = activeMatches.get(matchId);
            if (!match || match.phase !== 'active')
                return;
            const isP1 = match.player1.userId === userId;
            const attacker = isP1 ? match.player1 : match.player2;
            const defender = isP1 ? match.player2 : match.player1;
            let logEntry = '';
            if (action === 'attack') {
                const { damage, log } = resolveAttack(attacker.card, defender.card);
                defender.hp = Math.max(0, defender.hp - damage);
                logEntry = log;
            }
            else if (action === 'defend') {
                attacker.hp = Math.min(100, attacker.hp + 10);
                logEntry = `${attacker.card.name} defends and restores 10 HP.`;
            }
            else if (action === 'ability') {
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
            }
            else {
                await redis_1.redis.set(`battle:match:${matchId}`, JSON.stringify(match), 'EX', 3600);
            }
        });
        socket.on('disconnect', () => {
            // Remove from queue if disconnected
            for (const [uid, data] of queue.entries()) {
                if (data.socketId === socket.id) {
                    queue.delete(uid);
                    break;
                }
            }
        });
    });
}
