# Railway Environment Variables Setup

Copy these environment variables to Railway dashboard for the web service:

## Web App (apps/web)
```
NEXT_PUBLIC_API_URL=https://normies-world-production.up.railway.app
NEXT_PUBLIC_WS_URL=https://normies-world-production.up.railway.app
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
```

Get WalletConnect Project ID from: https://cloud.walletconnect.com

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
- The ConnectButton is already configured in Navbar.tsx
- RainbowKit will automatically open the wallet modal when clicked
- Ensure NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is set for production
