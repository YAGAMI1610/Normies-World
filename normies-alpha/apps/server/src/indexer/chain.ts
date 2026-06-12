// apps/server/src/indexer/chain.ts
import { createPublicClient, http, fallback } from "viem";
import { mainnet } from "viem/chains";
import { env } from "../lib/env";

if (!env.RPC_URL) {
  // eslint-disable-next-line no-console
  console.warn(
    "[indexer] RPC_URL is not set — the indexer will not be able to read on-chain data."
  );
}

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: env.RPC_URL
    ? fallback([http(env.RPC_URL)])
    : http(), // falls back to viem's default public RPC (rate-limited)
});
