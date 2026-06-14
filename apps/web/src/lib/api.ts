// Frontend API client — calls our Express server
import axios from 'axios';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const NORMIES_BASE = 'https://api.normies.art';

export const api = axios.create({
  baseURL: `${BASE}/api`,
  timeout: 15_000,
  withCredentials: true,
});

const normiesExternalApi = axios.create({
  baseURL: NORMIES_BASE,
  timeout: 15_000,
});

// Auth token interceptor
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('na_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---- Typed API helpers ----

export interface Alert {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface WhaleEntry {
  address: string;
  whaleScore: number;
  holdingsCount: number;
  avgHoldDurationDays: number;
  rarityTier: string;
  followed: boolean;
}

export interface ReputationEntry {
  userId: string;
  walletAddress: string;
  score: number;
  level: number;
  xp: number;
  badges: string[];
  rank: number;
}

export interface BattleLeaderEntry {
  userId: string;
  walletAddress: string;
  elo: number;
  wins: number;
  losses: number;
  winStreak: number;
  rank: number;
}

export interface NormieCard {
  tokenId: number;
  name: string;
  imageUrl: string;
  rarityRank: number | null;
  rarityTier: string;
  attack: number;
  defense: number;
  speed: number;
  ability: string;
  abilityDescription: string;
  traits: Record<string, string>;
  owned: boolean;
}

export interface NormiesHolderResponse {
  address: string;
  tokenIds: string[];
}

export interface NormieVersion {
  version?: number | string;
  createdAt?: string;
  txHash?: string;
  [key: string]: unknown;
}

export interface CanvasStats {
  totalBurnCommitments: number;
  totalBurnedTokens: number;
  totalTransforms: number;
  totalActionPointsDistributed: string;
}

export interface AIInsight {
  id: string;
  summary: string;
  bulletPoints: string[];
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidence: number;
  generatedAt: string;
  snapshotData: Record<string, unknown>;
}

export interface HistoricalSnapshot {
  date: string;
  holderCount: number;
  topHolders: { address: string; count: number }[];
  floorEth: number | null;
  transferCount: number;
  topTraits: { category: string; value: string; count: number }[];
}

// --- Endpoints ---

export const dashboardApi = {
  getStats: () => normiesExternalApi.get<CanvasStats>('/history/stats').then(r => r.data),
  getAlerts: (limit = 20) => api.get<Alert[]>('/alerts', { params: { limit } }).then(r => r.data),
  getFloorHistory: (days = 30) => api.get<{ date: string; floor: number }[]>('/market/floor-history', { params: { days } }).then(r => r.data),
  getTraitDemand: () => api.get<{ category: string; value: string; count: number; pctChange: number }[]>('/market/trait-demand').then(r => r.data),
};

export const whaleApi = {
  getWhales: (limit = 20) => api.get<WhaleEntry[]>('/whales', { params: { limit } }).then(r => r.data),
  getWhaleDetail: (address: string) => api.get<WhaleEntry & { history: unknown[] }>(`/whales/${address}`).then(r => r.data),
  followWhale: (address: string) => api.post(`/whales/${address}/follow`).then(r => r.data),
  unfollowWhale: (address: string) => api.delete(`/whales/${address}/follow`).then(r => r.data),
  getSimilarity: (address: string) => api.get<{ score: number; closestWhale: WhaleEntry }>(`/whales/${address}/similarity`).then(r => r.data),
};

export const reputationApi = {
  getLeaderboard: (limit = 20) => api.get<ReputationEntry[]>('/reputation/leaderboard', { params: { limit } }).then(r => r.data),
  getProfile: (walletAddress: string) => api.get<ReputationEntry>(`/reputation/profile/${walletAddress}`).then(r => r.data),
};

export const battleApi = {
  getLeaderboard: (limit = 20) => api.get<BattleLeaderEntry[]>('/battle/leaderboard', { params: { limit } }).then(r => r.data),
  getMyCards: () => api.get<NormieCard[]>('/battle/my-cards').then(r => r.data),
  getCard: (tokenId: number) => api.get<NormieCard>(`/battle/card/${tokenId}`).then(r => r.data),
  findMatch: (mode: 'RANKED' | 'CASUAL') => api.post('/battle/matchmake', { mode }).then(r => r.data),
};

export const aiApi = {
  getLatestInsight: () => api.get<AIInsight>('/ai/insight/latest').then(r => r.data),
  generateInsight: () => api.post<AIInsight>('/ai/insight/generate').then(r => r.data),
};

export const timeMachineApi = {
  getSnapshot: (date: string) => api.get<HistoricalSnapshot>(`/history/snapshot/${date}`).then(r => r.data),
};

export const authApi = {
  nonce: (address: string) => api.get<{ nonce: string }>(`/auth/nonce/${address}`).then(r => r.data),
  verify: (address: string, signature: string, message: string) =>
    api.post<{ token: string; user: { id: string; primaryWallet: string } }>('/auth/verify', { address, signature, message }).then(r => r.data),
  me: () => api.get('/auth/me').then(r => r.data),
};

export const normiesApi = {
  imagePngUrl: (tokenId: number) => `${NORMIES_BASE}/normie/${tokenId}/image.png`,
  getToken: (tokenId: number) => api.get<any>(`/normies/${tokenId}`).then(r => r.data),
  getHoldings: (address: string) => api.get<{ tokenId: number; imageUrl: string; rarityRank: number | null; rarityScore: number | null }[]>(`/normies/holders/${address}`).then(r => r.data),
  getAgent: (tokenId: number) => api.get<any>(`/normies/${tokenId}/agent`).then(r => r.data),
  getAgents: (limit = 20) => api.get<any>(`/normies/agents/list`, { params: { limit } }).then(r => r.data),
  getCanvasStatus: () => api.get<any>('/normies/canvas/status').then(r => r.data),
  getGlobalStats: () => normiesExternalApi.get<CanvasStats>('/history/stats').then(r => r.data),
  getHolderTokens: (address: string) => normiesExternalApi.get<NormiesHolderResponse>(`/holders/${address}`).then(r => r.data),
  getNormieVersions: (tokenId: number) => normiesExternalApi.get<NormieVersion[]>(`/history/normie/${tokenId}/versions`).then(r => r.data),
};
