// apps/server/src/indexer/traitSync.ts
//
// Syncs decoded trait data for all 10,000 Normies from
// GET /normie/:id/traits, persists into the Trait table, and computes a
// rarity score per token based on the overall trait-value distribution
// (standard "trait rarity sum" method: lower frequency = higher score).
//
// Respects the API's 60 req/min rate limit by throttling requests.
// Resumable: skips tokens already synced (lastSyncedAt set) unless --force.

import { normiesApi } from "../services/normiesApiClient";
import { prisma } from "../lib/prisma";
import { TOTAL_SUPPLY } from "@normies-alpha/shared-types";

const REQUESTS_PER_MINUTE = 55; // stay under the 60/min limit
const DELAY_MS = Math.ceil(60_000 / REQUESTS_PER_MINUTE);

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function syncAllTraits(force = false): Promise<void> {
  console.log("[traitSync] starting trait sync...");

  const alreadySynced = force
    ? new Set<number>()
    : new Set(
        (
          await prisma.normie.findMany({
            where: { traits: { some: {} } },
            select: { tokenId: true },
          })
        ).map((n) => n.tokenId)
      );

  for (let tokenId = 0; tokenId < TOTAL_SUPPLY; tokenId++) {
    if (alreadySynced.has(tokenId)) continue;

    try {
      const [traits, metadata] = await Promise.all([
        normiesApi.traits(tokenId),
        normiesApi.metadata(tokenId).catch(() => null),
      ]);

      const pixelCountAttr = metadata?.attributes.find(
        (a) => a.trait_type === "Pixel Count"
      );
      const levelAttr = metadata?.attributes.find((a) => a.trait_type === "Level");
      const apAttr = metadata?.attributes.find((a) => a.trait_type === "Action Points");
      const customizedAttr = metadata?.attributes.find((a) => a.trait_type === "Customized");

      await prisma.$transaction(async (tx) => {
        await tx.normie.upsert({
          where: { tokenId },
          create: {
            tokenId,
            pixelCount: pixelCountAttr ? Number(pixelCountAttr.value) : null,
            level: levelAttr ? Number(levelAttr.value) : 1,
            actionPoints: apAttr ? Number(apAttr.value) : 0,
            customized: customizedAttr?.value === "Yes",
          },
          update: {
            pixelCount: pixelCountAttr ? Number(pixelCountAttr.value) : undefined,
            level: levelAttr ? Number(levelAttr.value) : undefined,
            actionPoints: apAttr ? Number(apAttr.value) : undefined,
            customized: customizedAttr ? customizedAttr.value === "Yes" : undefined,
          },
        });

        for (const attr of traits.attributes) {
          await tx.trait.upsert({
            where: { tokenId_category: { tokenId, category: attr.trait_type } },
            create: { tokenId, category: attr.trait_type, value: String(attr.value) },
            update: { value: String(attr.value) },
          });
        }
      });

      if (tokenId % 250 === 0) {
        console.log(`[traitSync] synced token ${tokenId}/${TOTAL_SUPPLY}`);
      }
    } catch (err: any) {
      if (err?.response?.status === 404) {
        // Token not minted / no data — skip silently.
        continue;
      }
      console.error(`[traitSync] error on token ${tokenId}:`, err.message ?? err);
    }

    await sleep(DELAY_MS);
  }

  console.log("[traitSync] trait sync complete. Computing rarity scores...");
  await computeRarityScores();
}

/**
 * Standard trait-rarity-sum scoring: for each trait category/value,
 * rarity contribution = 1 / (frequency of that value among minted tokens).
 * Score per token = sum of contributions across its 8 trait categories.
 * Higher score = rarer. Ranks are assigned by descending score.
 */
export async function computeRarityScores(): Promise<void> {
  const allTraits = await prisma.trait.findMany({
    select: { tokenId: true, category: true, value: true },
  });

  if (allTraits.length === 0) {
    console.warn("[traitSync] no traits found — skipping rarity computation");
    return;
  }

  // frequency[category][value] = count
  const frequency: Record<string, Record<string, number>> = {};
  const byToken: Record<number, { category: string; value: string }[]> = {};

  for (const t of allTraits) {
    frequency[t.category] ??= {};
    frequency[t.category][t.value] = (frequency[t.category][t.value] ?? 0) + 1;
    byToken[t.tokenId] ??= [];
    byToken[t.tokenId].push({ category: t.category, value: t.value });
  }

  const totalTokens = Object.keys(byToken).length;

  const scores: { tokenId: number; score: number }[] = [];
  for (const [tokenIdStr, traits] of Object.entries(byToken)) {
    const tokenId = Number(tokenIdStr);
    let score = 0;
    for (const t of traits) {
      const freq = frequency[t.category][t.value] ?? 1;
      score += totalTokens / freq;
    }
    scores.push({ tokenId, score });
  }

  scores.sort((a, b) => b.score - a.score);

  // Batch update in chunks to avoid overwhelming the DB.
  const BATCH = 200;
  for (let i = 0; i < scores.length; i += BATCH) {
    const batch = scores.slice(i, i + BATCH);
    await prisma.$transaction(
      batch.map((s, idx) =>
        prisma.normie.update({
          where: { tokenId: s.tokenId },
          data: { rarityScore: s.score, rarityRank: i + idx + 1 },
        })
      )
    );
  }

  console.log(`[traitSync] rarity scores computed for ${scores.length} tokens`);
}

if (require.main === module) {
  const force = process.argv.includes("--force");
  syncAllTraits(force)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[traitSync] fatal:", err);
      process.exit(1);
    });
}
