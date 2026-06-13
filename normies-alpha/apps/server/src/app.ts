// apps/server/src/app.ts
// Normies Alpha — Express + Socket.io server

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { redis } from './lib/redis';
import authRouter from './routes/auth';
import dashboardRouter from './routes/dashboard';
import alertsRouter from './routes/alerts';
import whalesRouter from './routes/whales';
import reputationRouter from './routes/reputation';
import battleRouter from './routes/battle';
import marketRouter from './routes/market';
import historyRouter from './routes/history';
import aiRouter from './routes/ai';
import normiesRouter from './routes/normies';
import authMiddleware } from './middleware/auth';
import { startAlertScheduler } from './jobs/alertScheduler';
import { startWhaleScoreScheduler } from './jobs/whaleScoreScheduler';
import { registerBattleSocket } from './services/battleEngine';

const app = express();
const httpServer = createServer(app);

// Socket.io
export const io = new SocketServer(httpServer, {
  cors: { origin: process.env.WEB_ORIGIN ?? '*', credentials: true },
});

// Bridge Redis pub/sub -> socket.io
const subscriber = redis.duplicate();
subscriber.connect().then(() => {
  subscriber.subscribe('alerts:new', (message) => {
    io.emit('alert:new', JSON.parse(message));
  });
  subscriber.subscribe('whale:move', (message) => {
    io.emit('whale:move', JSON.parse(message));
  });
});

// Register battle socket handlers
registerBattleSocket(io);

// Middleware
app.use(cors({ origin: process.env.WEB_ORIGIN ?? '*', credentials: true }));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

// Routes
app.use('/api/auth',       authRouter);
app.use('/api/dashboard',  dashboardRouter);
app.use('/api/alerts',     alertsRouter);
app.use('/api/whales',     whalesRouter);
app.use('/api/reputation', reputationRouter);
app.use('/api/battle',     authMiddleware, battleRouter);
app.use('/api/market',     marketRouter);
app.use('/api/history',    historyRouter);
app.use('/api/ai',         aiRouter);
app.use('/api/normies',    normiesRouter);

// Start background jobs
startAlertScheduler().catch(console.error);
startWhaleScoreScheduler().catch(console.error);

const PORT = process.env.PORT ?? 4000;
httpServer.listen(PORT, () => {
  console.log(`[server] listening on :${PORT}`);
});
