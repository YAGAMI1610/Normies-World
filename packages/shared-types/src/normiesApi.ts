// packages/shared-types/src/normiesApi.ts
// Type definitions mirroring the live api.normies.art responses.
// Source: https://api.normies.art (inspected June 2026)

export interface NormieAttribute {
  trait_type: string;
  value: string;
  display_type?: "number" | "string";
}

export interface TraitsResponse {
  raw: string; // hex bytes8, e.g. "0x0001000305010200"
  attributes: NormieAttribute[];
}

export interface MetadataResponse {
  name: string; // "Normie #0"
  attributes: NormieAttribute[]; // includes Level, Pixel Count, Action Points, Customized
  image: string; // data:image/svg+xml;base64,...
  animation_url?: string;
}

export interface OwnerResponse {
  tokenId: string;
  owner: string;
}

export interface HoldersResponse {
  address: string;
  tokenIds: string[];
}

export interface CanvasInfoResponse {
  actionPoints: number;
  level: number;
  customized: boolean;
  delegate: string;
  delegateSetBy: string;
}

export interface CanvasPixelDiff {
  x: number;
  y: number;
}

export interface CanvasDiffResponse {
  added: CanvasPixelDiff[];
  removed: CanvasPixelDiff[];
  addedCount: number;
  removedCount: number;
  netChange: number;
}

export interface CanvasStatusResponse {
  paused: boolean;
  maxBurnPercent: number;
  tierThresholds: number[];
  tierMinPercents: number[];
}

export interface BurnedTokenRef {
  tokenId: string;
  pixelCount: number;
}

export interface BurnCommit {
  commitId: string;
  owner: string;
  receiverTokenId: string;
  tokenCount: number;
  transferredActionPoints: string;
  blockNumber: string;
  timestamp: string;
  txHash: string;
  revealed: boolean;
  totalActions: string;
  expired: boolean;
  burnedTokens?: BurnedTokenRef[];
}

export interface BurnedTokenInfo {
  tokenId: string;
  commitId: string;
  pixelCount: number;
}

export interface TransformVersion {
  version: number;
  changeCount: number;
  newPixelCount: number;
  transformer: string;
  blockNumber: string;
  timestamp: string;
  txHash: string;
}

export interface GlobalCanvasStats {
  totalBurnCommitments: number;
  totalBurnedTokens: number;
  totalTransforms: number;
  totalActionPointsDistributed: string;
}

export interface AgentPersonaCanvas {
  level: number;
  actionPoints: number;
  customized: boolean;
  diff: { addedCount: number; removedCount: number; netChange: number };
}

export interface AgentPersona {
  tokenId: string;
  agentId: string;
  chainId: number;
  name: string;
  type: string;
  tagline: string;
  backstory: string;
  greeting: string;
  personalityTraits: string[];
  communicationStyle: string;
  quirks: string[];
  systemPrompt: string;
  traits: {
    name: string;
    attributes: Record<string, string>;
  };
  canvas: AgentPersonaCanvas;
  registeredBy: string;
  registeredAt: string;
  txHash: string;
  interactions: { status: string };
  mcp: { status: string };
}

export interface AgentIdentity {
  tokenId: number;
  name: string;
  type: string;
  traits: Record<string, string>;
}

export interface AgentListItem {
  agentId: string;
  tokenId: string;
  name: string;
  type: string;
  registeredBy: string;
  registeredAt: string;
  txHash: string;
}

export interface AgentListResponse {
  items: AgentListItem[];
  hasMore: boolean;
}

export interface AgentBinding {
  id?: string;
  agentId: string;
  standard?: number;
  tokenContract: string;
  tokenId: string;
  registeredBy: string;
  blockNumber: string;
  timestamp: string;
  txHash: string;
}

export interface AgentBindingResponse {
  binding: AgentBinding | null;
}

export interface AgentBindingBatchResponse {
  bindings: Record<string, AgentBinding>;
}

// Trait category map (byte index -> category name)
export const TRAIT_CATEGORIES = [
  "Type",
  "Gender",
  "Age",
  "Hair Style",
  "Facial Feature",
  "Eyes",
  "Expression",
  "Accessory",
] as const;

export type TraitCategory = (typeof TRAIT_CATEGORIES)[number];

export const NORMIES_CONTRACTS = {
  Normies: "0x9Eb6E2025B64f340691e424b7fe7022fFDE12438",
  NormiesStorage: "0x1B976bAf51cF51F0e369C070d47FBc47A706e602",
  NormiesRenderer: "0xBe57fC4D0c729b8e8d33b638Dd441F57365e4c25",
  NormiesRendererV2: "0x7818f24d3239c945510e0a1a523dd9971812c6c0",
  NormiesRendererV3: "0x1af01b902256d77cf9499a14ef4e494897380b05",
  NormiesMinter: "0xC74994dD70FFb621CC514cE18a4F6F52124e296d",
  NormiesMinterV2: "0xc513272597d3022D77b3d7EEBA92cea5D7fb2808",
  NormiesCanvas: "0x64951d92e345C50381267380e2975f66810E869c",
  NormiesCanvasStorage: "0xC255BE0983776BAB027a156681b6925cde47B2D1",
  NormiesRendererV4: "0x8eC46Cc1f306652868a4dfbAAae87CBa2715A0eB",
} as const;

export const TOTAL_SUPPLY = 10000;