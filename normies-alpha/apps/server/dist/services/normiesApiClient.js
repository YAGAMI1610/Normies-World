"use strict";
// apps/server/src/services/normiesApiClient.ts
//
// Typed wrapper over https://api.normies.art
//
// Rate limit: 60 requests/min per IP (sliding window). Since trait/metadata/
// pixel/image data for a given tokenId is immutable on-chain (except for
// canvas-affected fields: level/actionPoints/customized/Pixel Count/image),
// we cache aggressively. Canvas + ownership + agent endpoints get short TTLs.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normiesApi = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../lib/env");
const redis_1 = require("../lib/redis");
const BASE = env_1.env.NORMIES_API_URL;
const http = axios_1.default.create({
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
async function getJson(path, ttl, params) {
    const key = `normiesapi:${path}:${JSON.stringify(params ?? {})}`;
    return (0, redis_1.cached)(key, ttl, async () => {
        const res = await http.get(path, { params });
        return res.data;
    });
}
async function getText(path, ttl) {
    const key = `normiesapi:${path}`;
    return (0, redis_1.cached)(key, ttl, async () => {
        const res = await http.get(path, {
            responseType: "text",
            transformResponse: (d) => d, // keep raw string
        });
        return res.data;
    });
}
exports.normiesApi = {
    // ---- Core token data ----
    /** GET /normie/:id/pixels — 1600-char binary string (composited if customized) */
    pixels: (tokenId) => getText(`/normie/${tokenId}/pixels`, TTL.CANVAS),
    /** GET /normie/:id/traits/binary — raw bytes8 hex */
    traitsBinary: (tokenId) => getText(`/normie/${tokenId}/traits/binary`, TTL.IMMUTABLE),
    /** GET /normie/:id/traits — decoded human-readable traits (immutable mint traits) */
    traits: (tokenId) => getJson(`/normie/${tokenId}/traits`, TTL.IMMUTABLE),
    /** GET /normie/:id/metadata — full tokenURI metadata (canvas-aware) */
    metadata: (tokenId) => getJson(`/normie/${tokenId}/metadata`, TTL.METADATA),
    /** Direct image URLs (no need to proxy bytes - browsers can hit these directly) */
    imageSvgUrl: (tokenId) => `${BASE}/normie/${tokenId}/image.svg`,
    imagePngUrl: (tokenId) => `${BASE}/normie/${tokenId}/image.png`,
    originalImageSvgUrl: (tokenId) => `${BASE}/normie/${tokenId}/original/image.svg`,
    originalImagePngUrl: (tokenId) => `${BASE}/normie/${tokenId}/original/image.png`,
    /** GET /normie/:id/original/pixels — pre-canvas-edit bitmap */
    originalPixels: (tokenId) => getText(`/normie/${tokenId}/original/pixels`, TTL.IMMUTABLE),
    // ---- Ownership ----
    /** GET /normie/:id/owner */
    owner: (tokenId) => getJson(`/normie/${tokenId}/owner`, TTL.OWNERSHIP),
    /** GET /holders/:address — all tokenIds currently owned by address */
    holders: (address) => getJson(`/holders/${address}`, TTL.OWNERSHIP),
    // ---- Canvas ----
    /** GET /normie/:id/canvas/pixels — XOR transform layer */
    canvasPixels: (tokenId) => getText(`/normie/${tokenId}/canvas/pixels`, TTL.CANVAS),
    /** GET /normie/:id/canvas/diff */
    canvasDiff: (tokenId) => getJson(`/normie/${tokenId}/canvas/diff`, TTL.CANVAS),
    /** GET /normie/:id/canvas/info — level, actionPoints, customized, delegate */
    canvasInfo: (tokenId) => getJson(`/normie/${tokenId}/canvas/info`, TTL.CANVAS),
    /** GET /canvas/status — global contract status */
    canvasStatus: () => getJson(`/canvas/status`, TTL.GLOBAL),
    // ---- History (Ponder indexer) ----
    /** GET /history/burns?limit&offset */
    burnHistory: (limit = 50, offset = 0) => getJson(`/history/burns`, TTL.GLOBAL, { limit, offset }),
    /** GET /history/burns/:commitId */
    burnCommit: (commitId) => getJson(`/history/burns/${commitId}`, TTL.GLOBAL),
    /** GET /history/burns/address/:address */
    burnsByAddress: (address, limit = 50, offset = 0) => getJson(`/history/burns/address/${address}`, TTL.GLOBAL, { limit, offset }),
    /** GET /history/burns/receiver/:tokenId */
    burnsByReceiver: (tokenId, limit = 50, offset = 0) => getJson(`/history/burns/receiver/${tokenId}`, TTL.GLOBAL, { limit, offset }),
    /** GET /history/burned-tokens */
    burnedTokens: (limit = 50, offset = 0) => getJson(`/history/burned-tokens`, TTL.GLOBAL, { limit, offset }),
    /** GET /history/burned/:tokenId */
    burnedTokenInfo: (tokenId) => getJson(`/history/burned/${tokenId}`, TTL.GLOBAL),
    /** Image of a burned token (still readable via SSTORE2) */
    burnedImageSvgUrl: (tokenId) => `${BASE}/history/burned/${tokenId}/image.svg`,
    burnedImagePngUrl: (tokenId) => `${BASE}/history/burned/${tokenId}/image.png`,
    /** GET /history/normie/:id/versions — transform version history */
    versions: (tokenId) => getJson(`/history/normie/${tokenId}/versions`, TTL.GLOBAL),
    versionImageSvgUrl: (tokenId, version) => `${BASE}/history/normie/${tokenId}/version/${version}/image.svg`,
    versionImagePngUrl: (tokenId, version) => `${BASE}/history/normie/${tokenId}/version/${version}/image.png`,
    versionPixels: (tokenId, version) => getText(`/history/normie/${tokenId}/version/${version}/pixels`, TTL.GLOBAL),
    /** GET /history/stats — global canvas activity stats */
    globalStats: () => getJson(`/history/stats`, TTL.GLOBAL),
    // ---- Agents (ERC-8004) ----
    /** GET /agents/info/:tokenId — full live persona + canvas + registration */
    agentInfo: (tokenId) => getJson(`/agents/info/${tokenId}`, TTL.AGENT),
    /** GET /agents/identity/:tokenId — lightweight trait-derived identity */
    agentIdentity: (tokenId) => getJson(`/agents/identity/${tokenId}`, TTL.AGENT_IDENTITY),
    /** GET /agents/persona-preview/:tokenId — persona for any token regardless of registration */
    agentPersonaPreview: (tokenId) => getJson(`/agents/persona-preview/${tokenId}`, TTL.AGENT),
    agentImageUrl: (tokenId) => `${BASE}/agents/image/${tokenId}`,
    /** GET /agents/list?sort&limit&cursor */
    agentsList: (params) => getJson(`/agents/list`, TTL.GLOBAL, params),
    /** GET /agents/count */
    agentsCount: () => getJson(`/agents/count`, TTL.GLOBAL),
    /** GET /agents/binding/:tokenId */
    agentBinding: (tokenId) => getJson(`/agents/binding/${tokenId}`, TTL.AGENT_IDENTITY),
    /** POST /agents/binding/batch — { tokenIds: string[] } */
    agentBindingBatch: async (tokenIds) => {
        const key = `normiesapi:/agents/binding/batch:${tokenIds.join(",")}`;
        return (0, redis_1.cached)(key, TTL.AGENT_IDENTITY, async () => {
            const res = await http.post(`/agents/binding/batch`, { tokenIds });
            return res.data;
        });
    },
    /** GET /agents/by-agent-id/:agentId */
    agentByAgentId: (agentId) => getJson(`/agents/by-agent-id/${agentId}`, TTL.AGENT_IDENTITY),
    /** GET /agents/by-agent-id/:agentId/info */
    agentByAgentIdInfo: (agentId) => getJson(`/agents/by-agent-id/${agentId}/info`, TTL.AGENT),
};
