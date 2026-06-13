"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
// apps/server/src/lib/prisma.ts
const client_1 = require("@prisma/client");
const env_1 = require("./env");
const prismaClientSingleton = () => new client_1.PrismaClient({
    log: env_1.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    errorFormat: 'pretty',
    datasources: {
        db: {
            url: env_1.env.DATABASE_URL,
        },
    },
});
exports.prisma = global.__prisma ?? prismaClientSingleton();
if (env_1.env.NODE_ENV !== 'production') {
    global.__prisma = exports.prisma;
}
