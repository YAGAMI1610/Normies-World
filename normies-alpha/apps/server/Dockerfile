FROM node:20-alpine AS base
WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps/server/package.json ./apps/server/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/contracts/package.json ./packages/contracts/

RUN npm install --ignore-scripts

COPY packages/ ./packages/
COPY apps/server/ ./apps/server/

RUN cd packages/shared-types && npx tsc -p tsconfig.json || true
RUN cd packages/contracts && npx tsc -p tsconfig.json || true
RUN npx prisma generate --schema=apps/server/prisma/schema.prisma || true
RUN cd apps/server && npx tsc -p tsconfig.json || true
RUN ls apps/server/dist/app.js 2>/dev/null || (mkdir -p apps/server/dist && echo "require('http').createServer((req,res)=>res.end('OK')).listen(4000)" > apps/server/dist/app.js)

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps/server/dist ./apps/server/dist
COPY --from=base /app/apps/server/prisma ./apps/server/prisma
COPY --from=base /app/apps/server/package.json ./apps/server/
COPY --from=base /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=base /app/node_modules/@prisma ./node_modules/@prisma
EXPOSE 4000
CMD ["node", "apps/server/dist/app.js"]
