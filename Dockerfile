FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY apps/server/package*.json ./apps/server/
COPY apps/web/package*.json ./apps/web/
COPY packages/shared-types/package*.json ./packages/shared-types/
COPY packages/contracts/package*.json ./packages/contracts/

RUN npm install --ignore-scripts

COPY . .

RUN npx prisma generate --schema=apps/server/prisma/schema.prisma || true
RUN npm run build --workspace=packages/shared-types
RUN npm run build --workspace=packages/contracts
RUN npm run build --workspace=apps/server
RUN npm run build --workspace=apps/web

EXPOSE 3000
CMD ["node", "server.js"]
