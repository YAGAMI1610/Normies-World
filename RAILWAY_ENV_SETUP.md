# Railway Environment Variables Setup

Copy these environment variables to Railway dashboard for the web service:

## Web App (apps/web)
```
NEXT_PUBLIC_API_URL=https://normies-world-production.up.railway.app
NEXT_PUBLIC_WS_URL=https://normies-world-production.up.railway.app
```

Browser wallet sign-in via `window.ethereum` is used, so no WalletConnect project ID is required for the web app.

## Server App (apps/server)
```
DATABASE_URL=your-postgres-url
REDIS_URL=your-redis-url
NORMIES_API_URL=https://api.normies.art
OPENAI_API_KEY=sk-...
JWT_SECRET=your-secure-random-string
WEB_ORIGIN=https://normies-world-production.up.railway.app
PORT=4000
```

## Notes
- Browser wallet sign-in uses `window.ethereum` and SIWE.
- No RainbowKit or WalletConnect project ID is required for the web app.
