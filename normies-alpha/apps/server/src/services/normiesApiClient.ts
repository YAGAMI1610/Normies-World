// apps/server/src/services/normiesApiClient.ts
//
// Typed wrapper over https://api.normies.art
//
// Rate limit: 60 requests/min per IP (sliding window). Since trait/metadata/
// pixel/image data for a given tokenId is immutable on-chain (except for
// canvas-affected fields: level/actionPoints/customized/Pixel Count/image),
// we cache aggressively. Canvas + ownership + agent endpoints get short TTLs.

import axios, { AxiosInstance } from "axios";
import { env } from "../lib/env";
import { cached } from "../lib/redis";
import type {
  TraitsResponse,
  MetadataResponse,
  OwnerResponse,
  HoldersResponse,
  CanvasInfoResponse,
  CanvasDiffResponse,
  CanvasStatusResponse,
  BurnCommit,
  BurnedTokenInfo,
  TransformVersion,
  GlobalCanvasStats,
  AgentPersona,
  AgentIdentity,
  AgentListResponse,
  AgentBindingResponse,
  AgentBindingBatchResponse,
} from "@normies-alpha/shared-types";

const BASE = env.NORMIES_API_URL;

const http: AxiosInstance = axios.create({
  baseURL: BASE,
  timeout: 15_000,
  headers: { "User-Agent": "normies-alpha/1.0 (+https://github.com/normies-alpha)" },
});

// TTLs (seconds)
const TTL = {
  IMMUTABLE: 60 * 60 * 24, // traits, original pixels/images - never change
  METADATA: 60 * 10, // can change with canvas edits
  CANVAS: 60 * 2, // canvas info/diff - changes on edits
  OWNERSHIP: 30, // owner / holders - changes on transfer
  AGENT: 60, // agent persona - regenerated live, short cache per API docs
  AGENT_IDENTITY: 60 * 5, // trait-derived only, longer cache per API docs
  GLOBAL: 60 * 5,
};

async function getJson<T>(path: string, ttl: number, params?: Record<string, unknown>): Promise<T> {
  const key = `normiesapi:${path}:${JSON.stringify(params ?? {})}`;
  return cached(key, ttl, async () => {
    const res = await http.get<T>(path, { params });
    return res.data;
  });
}

async function getText(path: string, ttl: number): Promise<string> {
  const key = `normiesapi:${path}`;
  return cached(key, ttl, async () => {
    const res = await http.get<string>(path, {
      responseType: "text",
      transformResponse: (d) => d, // keep raw string
    });
    return res.data;
  });
}

export const normiesApi = {
  // ---- Core token data ----

  /** GET /normie/:id/pixels — 1600-char binary string (composited if customized) */
  pixels: (tokenId: number) => getText(`/normie/${tokenId}/pixels`, TTL.CANVAS),

  /** GET /normie/:id/traits/binary — raw bytes8 hex */
  traitsBinary: (tokenId: number) => getText(`/normie/${tokenId}/traits/binary`, TTL.IMMUTABLE),

  /** GET /normie/:id/traits — decoded human-readable traits (immutable mint traits) */
  traits: (tokenId: number) =>
    getJson<TraitsResponse>(`/normie/${tokenId}/traits`, TTL.IMMUTABLE),

  /** GET /normie/:id/metadata — full tokenURI metadata (canvas-aware) */
  metadata: (tokenId: number) =>
    getJson<MetadataResponse>(`/normie/${tokenId}/metadata`, TTL.METADATA),

  /** Direct image URLs (no need to proxy bytes - browsers can hit these directly) */
  imageSvgUrl: (tokenId: number) => `${BASE}/normie/${tokenId}/image.svg`,
  imagePngUrl: (tokenId: number) => `${BASE}/normie/${tokenId}/image.png`,
  originalImageSvgUrl: (tokenId: number) => `${BASE}/normie/${tokenId}/original/image.svg`,
  originalImagePngUrl: (tokenId: number) => `${BASE}/normie/${tokenId}/original/image.png`,

  /** GET /normie/:id/original/pixels — pre-canvas-edit bitmap */
  originalPixels: (tokenId: number) => getText(`/normie/${tokenId}/original/pixels`, TTL.IMMUTABLE),

  // ---- Ownership ----

  /** GET /normie/:id/owner */
  owner: (tokenId: number) =>
    getJson<OwnerResponse>(`/normie/${tokenId}/owner`, TTL.OWNERSHIP),

  /** GET /holders/:address — all tokenIds currently owned by address */
  holders: (address: string) =>
    getJson<HoldersResponse>(`/holders/${address}`, TTL.OWNERSHIP),

  // ---- Canvas ----

  /** GET /normie/:id/canvas/pixels — XOR transform layer */
  canvasPixels: (tokenId: number) => getText(`/normie/${tokenId}/canvas/pixels`, TTL.CANVAS),

  /** GET /normie/:id/canvas/diff */
  canvasDiff: (tokenId: number) =>
    getJson<CanvasDiffResponse>(`/normie/${tokenId}/canvas/diff`, TTL.CANVAS),

  /** GET /normie/:id/canvas/info — level, actionPoints, customized, delegate */
  canvasInfo: (tokenId: number) =>
    getJson<CanvasInfoResponse>(`/normie/${tokenId}/canvas/info`, TTL.CANVAS),

  /** GET /canvas/status — global contract status */
  canvasStatus: () => getJson<CanvasStatusResponse>(`/canvas/status`, TTL.GLOBAL),

  // ---- History (Ponder indexer) ----

  /** GET /history/burns?limit&offset */
  burnHistory: (limit = 50, offset = 0) =>
    getJson<BurnCommit[]>(`/history/burns`, TTL.GLOBAL, { limit, offset }),

  /** GET /history/burns/:commitId */
  burnCommit: (commitId: number | string) =>
    getJson<BurnCommit>(`/history/burns/${commitId}`, TTL.GLOBAL),

  /** GET /history/burns/address/:address */
  burnsByAddress: (address: string, limit = 50, offset = 0) =>
    getJson<BurnCommit[]>(`/history/burns/address/${address}`, TTL.GLOBAL, { limit, offset }),

  /** GET /history/burns/receiver/:tokenId */
  burnsByReceiver: (tokenId: number, limit = 50, offset = 0) =>
    getJson<BurnCommit[]>(`/history/burns/receiver/${tokenId}`, TTL.GLOBAL, { limit, offset }),

  /** GET /history/burned-tokens */
  burnedTokens: (limit = 50, offset = 0) =>
    getJson<BurnedTokenInfo[]>(`/history/burned-tokens`, TTL.GLOBAL, { limit, offset }),

  /** GET /history/burned/:tokenId */
  burnedTokenInfo: (tokenId: number) =>
    getJson<BurnedTokenInfo>(`/history/burned/${tokenId}`, TTL.GLOBAL),

  /** Image of a burned token (still readable via SSTORE2) */
  burnedImageSvgUrl: (tokenId: number) => `${BASE}/history/burned/${tokenId}/image.svg`,
  burnedImagePngUrl: (tokenId: number) => `${BASE}/history/burned/${tokenId}/image.png`,

  /** GET /history/normie/:id/versions — transform version history */
  versions: (tokenId: number) =>
    getJson<TransformVersion[]>(`/history/normie/${tokenId}/versions`, TTL.GLOBAL),

  versionImageSvgUrl: (tokenId: number, version: number) =>
    `${BASE}/history/normie/${tokenId}/version/${version}/image.svg`,
  versionImagePngUrl: (tokenId: number, version: number) =>
    `${BASE}/history/normie/${tokenId}/version/${version}/image.png`,
  versionPixels: (tokenId: number, version: number) =>
    getText(`/history/normie/${tokenId}/version/${version}/pixels`, TTL.GLOBAL),

  /** GET /history/stats — global canvas activity stats */
  globalStats: () => getJson<GlobalCanvasStats>(`/history/stats`, TTL.GLOBAL),

  // ---- Agents (ERC-8004) ----

  /** GET /agents/info/:tokenId — full live persona + canvas + registration */
  agentInfo: (tokenId: number) =>
    getJson<AgentPersona>(`/agents/info/${tokenId}`, TTL.AGENT),

  /** GET /agents/identity/:tokenId — lightweight trait-derived identity */
  agentIdentity: (tokenId: number) =>
    getJson<AgentIdentity>(`/agents/identity/${tokenId}`, TTL.AGENT_IDENTITY),

  /** GET /agents/persona-preview/:tokenId — persona for any token regardless of registration */
  agentPersonaPreview: (tokenId: number) =>
    getJson<AgentPersona>(`/agents/persona-preview/${tokenId}`, TTL.AGENT),

  agentImageUrl: (tokenId: number) => `${BASE}/agents/image/${tokenId}`,

  /** GET /agents/list?sort&limit&cursor */
  agentsList: (params?: { sort?: "newest" | "oldest"; limit?: number; cursor?: string }) =>
    getJson<AgentListResponse>(`/agents/list`, TTL.GLOBAL, params),

  /** GET /agents/count */
  agentsCount: () => getJson<{ count: number }>(`/agents/count`, TTL.GLOBAL),

  /** GET /agents/binding/:tokenId */
  agentBinding: (tokenId: number) =>
    getJson<AgentBindingResponse>(`/agents/binding/${tokenId}`, TTL.AGENT_IDENTITY),

  /** POST /agents/binding/batch — { tokenIds: string[] } */
  agentBindingBatch: async (tokenIds: string[]): Promise<AgentBindingBatchResponse> => {
    const key = `normiesapi:/agents/binding/batch:${tokenIds.join(",")}`;
    return cached(key, TTL.AGENT_IDENTITY, async () => {
      const res = await http.post<AgentBindingBatchResponse>(`/agents/binding/batch`, { tokenIds });
      return res.data;
    });
  },

  /** GET /agents/by-agent-id/:agentId */
  agentByAgentId: (agentId: string | number) =>
    getJson<AgentBindingResponse>(`/agents/by-agent-id/${agentId}`, TTL.AGENT_IDENTITY),

  /** GET /agents/by-agent-id/:agentId/info */
  agentByAgentIdInfo: (agentId: string | number) =>
    getJson<AgentPersona>(`/agents/by-agent-id/${agentId}/info`, TTL.AGENT),
};

export type NormiesApi = typeof normiesApi;