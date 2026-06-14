"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicClient = void 0;
// apps/server/src/indexer/chain.ts
const viem_1 = require("viem");
const chains_1 = require("viem/chains");
if (!process.env.RPC_URL) {
    // eslint-disable-next-line no-console
    console.warn("[indexer] RPC_URL is not set — the indexer will not be able to read on-chain data.");
}
exports.publicClient = (0, viem_1.createPublicClient)({
    chain: chains_1.mainnet,
    transport: process.env.RPC_URL
        ? (0, viem_1.fallback)([(0, viem_1.http)(process.env.RPC_URL)])
        : (0, viem_1.http)(), // falls back to viem's default public RPC (rate-limited)
});
