"use strict";
// apps/server/src/app.ts
// Normies Alpha — Express + Socket.io server
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const redis_1 = require("./lib/redis");
const auth_1 = __importDefault(require("./routes/auth"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const alerts_1 = __importDefault(require("./routes/alerts"));
const whales_1 = __importDefault(require("./routes/whales"));
const reputation_1 = __importDefault(require("./routes/reputation"));
const battle_1 = __importDefault(require("./routes/battle"));
const market_1 = __importDefault(require("./routes/market"));
const history_1 = __importDefault(require("./routes/history"));
const ai_1 = __importDefault(require("./routes/ai"));
const normies_1 = __importDefault(require("./routes/normies"));
const auth_2 = __importDefault(require("./middleware/auth"));
const env_1 = require("./lib/env");
const alertScheduler_1 = require("./jobs/alertScheduler");
const whaleScoreScheduler_1 = require("./jobs/whaleScoreScheduler");
const battleEngine_1 = require("./services/battleEngine");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
// Socket.io
exports.io = new socket_io_1.Server(httpServer, {
    cors: { origin: env_1.env.WEB_ORIGIN ?? '*', credentials: true },
});
// Bridge Redis pub/sub -> socket.io
const subscriber = redis_1.redis.duplicate();
subscriber.connect().then(() => {
    subscriber.subscribe('alerts:new', (message) => {
        exports.io.emit('alert:new', JSON.parse(message));
    });
    subscriber.subscribe('whale:move', (message) => {
        exports.io.emit('whale:move', JSON.parse(message));
    });
});
// Register battle socket handlers
(0, battleEngine_1.registerBattleSocket)(exports.io);
// Middleware
app.use((0, cors_1.default)({ origin: env_1.env.WEB_ORIGIN ?? '*', credentials: true }));
app.use(express_1.default.json());
// Health check
app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/dashboard', dashboard_1.default);
app.use('/api/alerts', alerts_1.default);
app.use('/api/whales', whales_1.default);
app.use('/api/reputation', reputation_1.default);
app.use('/api/battle', auth_2.default, battle_1.default);
app.use('/api/market', market_1.default);
app.use('/api/history', history_1.default);
app.use('/api/ai', ai_1.default);
app.use('/api/normies', normies_1.default);
// Start background jobs
(0, alertScheduler_1.startAlertScheduler)().catch(console.error);
(0, whaleScoreScheduler_1.startWhaleScoreScheduler)().catch(console.error);
const PORT = env_1.env.PORT ?? 4000;
httpServer.listen(PORT, () => {
    console.log(`[server] listening on :${PORT}`);
});
