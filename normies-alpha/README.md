# Normies Alpha ⚡

> Next-generation on-chain intelligence platform built around the Normies ecosystem.

A production-ready hackathon submission combining **Nansen-style analytics**, **Dune-style dashboards**, **OpenSea-style market data**, **fantasy sports reputation**, and **Hearthstone-inspired battle cards** — all powered by the [Normies API](https://api.normies.art) and on-chain data.

---

## 🏗 Architecture

```
normies-alpha/
├── apps/
│   ├── web/          # Next.js 15 frontend (Vercel)
│   └── server/       # Express + Socket.io backend (Railway)
├── packages/
│   ├── shared-types/ # Shared TypeScript types
│   └── contracts/    # ABI + viem helpers
├── docker-compose.yml  # Postgres + Redis for local dev
├── vercel.json
└── railway.toml
```

---

## ✨ Features

| Feature | Description |
|---|---|
| **Alpha Alerts** | Real-time whale, trait, price, and holder alerts via WebSocket + email/Telegram/Discord |
| **Copy Whale** | Whale score engine, portfolio similarity, smart money tracking |
| **Reputation System** | On-chain reputation score, badges, XP/levels (1–100) |
| **AI Market Analyst** | GPT-powered market insights from live Normies API + blockchain data |
| **Time Machine** | Historical state reconstruction — ownership, floor, traits, whales on any date |
| **AI Battle Cards** | Multiplayer card battle game with ELO, stats derived from real Normie traits |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker (for Postgres + Redis)

### 1. Clone & install
```bash
git clone <repo>
cd normies-alpha
npm install
```

### 2. Start infrastructure
```bash
docker-compose up -d
```

### 3. Configure environment
```bash
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example    apps/web/.env
```

Edit `apps/server/.env`:
- Set `DATABASE_URL` (default works with docker-compose)
- Set `REDIS_URL` (default works with docker-compose)
- Set `RPC_URL` (get from [Alchemy](https://alchemy.com) or [Infura](https://infura.io))
- Set `OPENAI_API_KEY` (optional — has mock fallback)

Edit `apps/web/.env`:
- Set `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` (get from [cloud.walletconnect.com](https://cloud.walletconnect.com))

### 4. Migrate database
```bash
cd apps/server
npx prisma migrate dev --name init
npx prisma generate
cd ../..
```

### 5. Run
```bash
npm run dev
```

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:4000
- **Health**: http://localhost:4000/health

---

## 📡 API Reference

| Route | Description |
|---|---|
| `GET /api/dashboard/stats` | Hero stats (floor, volume, holders, whales) |
| `GET /api/alerts` | Recent alerts feed |
| `GET /api/whales` | Whale leaderboard |
| `GET /api/whales/:address` | Whale detail + history |
| `GET /api/whales/:address/similarity` | Wallet similarity engine |
| `GET /api/reputation/leaderboard` | Reputation rankings |
| `GET /api/reputation/profile/:address` | Wallet reputation profile |
| `GET /api/battle/leaderboard` | Battle ELO rankings |
| `GET /api/battle/my-cards` | Authenticated user's battle cards |
| `GET /api/market/floor-history` | Floor price history |
| `GET /api/market/trait-demand` | Trait demand analytics |
| `GET /api/history/snapshot/:date` | Time Machine snapshot |
| `POST /api/ai/insight/generate` | Trigger AI market analysis |
| `GET /api/normies/:tokenId` | Enriched token data |
| `GET /api/normies/holders/:address` | Holdings by wallet |
| `GET /api/normies/agents/list` | Registered agents |

### WebSocket Events

| Event | Direction | Description |
|---|---|---|
| `alert:new` | Server → Client | New alpha alert |
| `whale:move` | Server → Client | Whale score recalculation |
| `battle:queue` | Client → Server | Join matchmaking |
| `battle:started` | Server → Client | Match found |
| `battle:action` | Client → Server | Play a turn |
| `battle:turnResult` | Server → Client | Turn outcome |
| `battle:finished` | Server → Client | Match over + ELO |

---

## 🚢 Deployment

### Frontend → Vercel
```bash
cd apps/web
vercel deploy
```
Set env vars in Vercel dashboard (see `apps/web/.env.example`).

### Backend → Railway
1. Connect GitHub repo to Railway
2. Railway auto-detects `railway.toml` and uses the Dockerfile
3. Add env vars from `apps/server/.env.example`
4. Add Postgres and Redis plugins in Railway dashboard

### Docker (self-hosted)
```bash
docker build -f apps/server/Dockerfile -t normies-server .
docker run -p 4000:4000 --env-file apps/server/.env normies-server
```

---

## 🗄 Database

Prisma schema includes: `User`, `Wallet`, `Normie`, `Trait`, `Transfer`, `Sale`, `Alert`, `AlertPreference`, `Whale`, `Reputation`, `BattleCard`, `BattleStats`, `Match`, `HistoricalSnapshot`, `AIInsight`, `Notification`

Run migrations:
```bash
npx prisma migrate deploy --schema=apps/server/prisma/schema.prisma
```

---

## 🔗 Key Dependencies

- **Normies API**: `https://api.normies.art` — NFT metadata, traits, canvas, agents, holders
- **viem / ethers.js**: On-chain ownership verification + event indexing
- **Reservoir API**: Floor price + market data
- **OpenAI**: Structured AI insight generation
- **Socket.io**: Real-time alerts + battle game

---

## 📋 Environment Variables

See `apps/server/.env.example` and `apps/web/.env.example` for the full list.

**Required to run locally:**
- `DATABASE_URL`
- `REDIS_URL`
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

**Required for full features:**
- `RPC_URL` — blockchain indexer + ownership verification
- `OPENAI_API_KEY` — AI analyst (has mock fallback without it)

**Optional:**
- `RESERVOIR_API_KEY` — richer market data
- `SMTP_*` — email alerts
- `TELEGRAM_BOT_TOKEN` — Telegram alerts
- `DISCORD_WEBHOOK_URL` — Discord alerts
