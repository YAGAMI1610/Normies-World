"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
// apps/server/src/lib/prisma.ts
const client_1 = require("@prisma/client");
const prismaClientSingleton = () => new client_1.PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    errorFormat: 'pretty',
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});
exports.prisma = global.__prisma ?? prismaClientSingleton();
if (process.env.NODE_ENV !== 'production') {
    global.__prisma = exports.prisma;
}
