// apps/server/src/services/cardGenEngine.ts
//
// Generates AI Battle Card stats for a Normie from real on-chain/API data:
//  - /normie/:id/traits        -> trait-driven ability lookup
//  - /normie/:id/metadata       -> Pixel Count, Level, Action Points, Customized
//  - /normie/:id/canvas/info     -> live canvas level/customization (ownership bonus)
//  - Normie.rarityScore/rarityRank (computed by traitSync) -> rarity tier + stat scaling
//
// Stats are deterministic given the same inputs (no RNG) so cards are
// reproducible and explainable. Original gameplay design — NOT based on any
// copyrighted card game artwork or mechanics.

import { normiesApi } from "./normiesApiClient";
import { prisma } from "../lib/prisma";
import type { BattleCardData } from "@normies-alpha/shared-types";
import { TOTAL_SUPPLY } from "@normies-alpha/shared-types";

type RarityTier = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";

function rarityTierFromRank(rank: number | null): RarityTier {
  if (rank == null) return "Common";
  const pct = rank / TOTAL_SUPPLY;
  if (pct <= 0.01) return "Legendary"; // top 1%
  if (pct <= 0.05) return "Epic"; // top 5%
  if (pct <= 0.2) return "Rare"; // top 20%
  if (pct <= 0.5) return "Uncommon"; // top 50%
  return "Common";
}

/** Maps a trait value -> a [min,max] stat boost range, deterministic hash-based pick within range. */
function statFromTraitValue(value: string, base: number, spread: number): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  const offset = hash % spread;
  return base + offset;
}

interface AbilityRule {
  category: string;
  match: (value: string) => boolean;
  ability: string;
  description: string;
}

// Trait-driven special ability lookup table.
const ABILITY_RULES: AbilityRule[] = [
  {
    category: "Accessory",
    match: (v) => v === "Top Hat",
    ability: "Trait Surge",
    description: "+15 Attack for 1 turn — the Top Hat commands respect on the battlefield.",
  },
  {
    category: "Accessory",
    match: (v) => v === "Fedora" || v === "Cowboy Hat",
    ability: "Sharp Read",
    description: "Reveal the opponent's next card before it's played.",
  },
  {
    category: "Type",
    match: (v) => v === "Alien",
    ability: "Static Drift",
    description: "Steal 10 Speed from the opponent for the rest of the match.",
  },
  {
    category: "Type",
    match: (v) => v === "Agent",
    ability: "Protocol Override",
    description: "Negate the opponent's special ability this turn.",
  },
  {
    category: "Type",
    match: (v) => v === "Cat",
    ability: "Nine Lives",
    description: "Survive a defeat once per match with 1 HP remaining.",
  },
  {
    category: "Eyes",
    match: (v) => v.includes("Shades"),
    ability: "Cold Read",
    description: "+10 Defense when this card is attacked first.",
  },
  {
    category: "Expression",
    match: (v) => v === "Serious",
    ability: "Iron Focus",
    description: "Immune to Speed-reducing abilities.",
  },
  {
    category: "Facial Feature",
    match: (v) => v.includes("Beard"),
    ability: "Veteran's Resolve",
    description: "+5 Defense for every full year the wallet has held this Normie.",
  },
  {
    category: "Hair Style",
    match: (v) => v.includes("Long"),
    ability: "Flowing Strike",
    description: "+8 Speed on the first turn of the match.",
  },
];

const DEFAULT_ABILITY = {
  ability: "Pixel Resonance",
  description: "+5 to all stats for every 50 pixels in this Normie's bitmap.",
  abilityTraitSource: "Pixel Count",
};

export async function generateBattleCard(tokenId: number): Promise<BattleCardData> {
  const [traits, metadata, canvasInfo, normie] = await Promise.all([
    normiesApi.traits(tokenId),
    normiesApi.metadata(tokenId).catch(() => null),
    normiesApi.canvasInfo(tokenId).catch(() => null),
    prisma.normie.findUnique({ where: { tokenId } }),
  ]);

  const traitMap: Record<string, string> = {};
  for (const a of traits.attributes) {
    traitMap[a.trait_type] = String(a.value);
  }

  const pixelCount =
    Number(metadata?.attributes.find((a) => a.trait_type === "Pixel Count")?.value) ||
    normie?.pixelCount ||
    500;

  const rarityRank = normie?.rarityRank ?? null;
  const rarityTier = rarityTierFromRank(rarityRank);

  // Base stats from Accessory + Facial Feature (Attack), Type + Age (Defense),
  // Eyes + Expression (Speed). Each trait contributes a deterministic value
  // in [40, 75); a rarity bonus (0-25) is added based on rarityTier.
  const rarityBonus: Record<RarityTier, number> = {
    Common: 0,
    Uncommon: 6,
    Rare: 12,
    Epic: 18,
    Legendary: 25,
  };
  const bonus = rarityBonus[rarityTier];

  const attack = Math.min(
    99,
    Math.round(
      (statFromTraitValue(traitMap["Accessory"] ?? "", 40, 35) +
        statFromTraitValue(traitMap["Facial Feature"] ?? "", 40, 35)) /
        2 +
        bonus
    )
  );

  const canvasLevel = canvasInfo?.level ?? normie?.level ?? 1;
  const defense = Math.min(
    99,
    Math.round(
      (statFromTraitValue(traitMap["Type"] ?? "", 40, 35) +
        statFromTraitValue(traitMap["Age"] ?? "", 40, 35)) /
        2 +
        bonus +
        Math.min(10, canvasLevel * 2) // canvas progression bonus
    )
  );

  const speed = Math.min(
    99,
    Math.round(
      (statFromTraitValue(traitMap["Eyes"] ?? "", 40, 35) +
        statFromTraitValue(traitMap["Expression"] ?? "", 40, 35)) /
        2 +
        bonus +
        Math.min(8, Math.floor(pixelCount / 100)) // pixel-density micro-bonus
    )
  );

  // Pick the first matching ability rule, else default Pixel Resonance.
  let abilityRule: AbilityRule | undefined;
  for (const rule of ABILITY_RULES) {
    const value = traitMap[rule.category];
    if (value && rule.match(value)) {
      abilityRule = rule;
      break;
    }
  }

  const specialAbility = abilityRule?.ability ?? DEFAULT_ABILITY.ability;
  const abilityDescription = abilityRule?.description ?? DEFAULT_ABILITY.description;
  const abilityTraitSource = abilityRule?.category ?? DEFAULT_ABILITY.abilityTraitSource;

  const customized = canvasInfo?.customized ?? normie?.customized ?? false;

  return {
    tokenId,
    name: metadata?.name ?? `Normie #${tokenId}`,
    imageUrl: normiesApi.imageSvgUrl(tokenId),
    attack,
    defense,
    speed,
    specialAbility,
    abilityDescription,
    abilityTraitSource,
    rarityTier,
    rarityRank: rarityRank ?? undefined,
    ownedSkin: {
      animated: customized,
      canvasLevel,
      customized,
    },
  };
}

/** Generate + persist a battle card, caching the result in BattleCard. */
export async function getOrCreateBattleCard(tokenId: number): Promise<BattleCardData> {
  const existing = await prisma.battleCard.findUnique({ where: { tokenId } });
  const cardData = await generateBattleCard(tokenId);

  if (!existing) {
    await prisma.battleCard.create({
      data: {
        tokenId,
        attack: cardData.attack,
        defense: cardData.defense,
        speed: cardData.speed,
        specialAbility: cardData.specialAbility,
        abilityDescription: cardData.abilityDescription,
        abilityTraitSource: cardData.abilityTraitSource,
        rarityTier: cardData.rarityTier,
      },
    });
  }

  return cardData;
}
