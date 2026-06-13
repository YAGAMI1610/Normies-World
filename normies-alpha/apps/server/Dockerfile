FROM node:20-alpine AS base
WORKDIR /app

# Install deps
COPY package.json package-lock.json* ./
COPY apps/server/package.json ./apps/server/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/contracts/package.json ./packages/contracts/

RUN npm ci --workspace=apps/server --workspace=packages/shared-types --workspace=packages/contracts --ignore-scripts

# Copy source
COPY packages/ ./packages/
COPY apps/server/ ./apps/server/

# Build shared packages first
RUN npm run build --workspace=packages/shared-types
RUN npm run build --workspace=packages/contracts

# Generate Prisma client
RUN npx prisma generate --schema=apps/server/prisma/schema.prisma

# Build server
RUN npm run build --workspace=apps/server

# Production image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps/server/dist ./apps/server/dist
COPY --from=base /app/apps/server/prisma ./apps/server/prisma
COPY --from=base /app/apps/server/package.json ./apps/server/

EXPOSE 4000

CMD ["node", "apps/server/dist/app.js"]
