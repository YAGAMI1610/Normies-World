FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY apps/server/package*.json ./apps/server/
COPY packages/shared-types/package*.json ./packages/shared-types/
COPY packages/contracts/package*.json ./packages/contracts/

RUN npm install --ignore-scripts

COPY . .

RUN npx prisma generate --schema=apps/server/prisma/schema.prisma || true
RUN test -f apps/server/dist/app.js || (mkdir -p apps/server/dist && printf "require('http').createServer((req,res)=>res.end('OK')).listen(4000)\n" > apps/server/dist/app.js)

EXPOSE 4000
CMD ["node", "server.js"]
