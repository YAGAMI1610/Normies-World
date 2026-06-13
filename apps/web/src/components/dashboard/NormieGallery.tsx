'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, ExternalLink } from 'lucide-react';
import { normiesApi } from '@/lib/api';

interface NormieToken {
  tokenId: number;
  imageUrl: string;
  rarityRank: number | null;
  rarityScore: number | null;
}

const RARITY_TIER = (rank: number | null): { label: string; color: string } => {
  if (!rank) return { label: 'Unknown', color: 'text-ink' };
  if (rank <= 100)  return { label: 'Legendary', color: 'text-amber' };
  if (rank <= 500)  return { label: 'Epic',      color: 'text-whale' };
  if (rank <= 2000) return { label: 'Rare',      color: 'text-alpha' };
  if (rank <= 5000) return { label: 'Uncommon',  color: 'text-pulse' };
  return                    { label: 'Common',    color: 'text-ink' };
};

function NormieCard({ token }: { token: NormieToken }) {
  const [imgErr, setImgErr] = useState(false);
  const tier = RARITY_TIER(token.rarityRank);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className="bg-surface rounded-xl ring-1 ring-border overflow-hidden group cursor-pointer"
    >
      <div className="aspect-square bg-muted/20 overflow-hidden relative">
        <img
          src={imgErr ? '/placeholder-normie.svg' : token.imageUrl}
          alt={`Normie #${token.tokenId}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImgErr(true)}
          loading="lazy"
        />
        {token.rarityRank && token.rarityRank <= 500 && (
          <div className="absolute top-2 left-2 text-[9px] font-mono bg-amber/90 text-void px-1.5 py-0.5 rounded font-700">
            #{token.rarityRank}
          </div>
        )}
        <a
          href={`https://opensea.io/assets/ethereum/0x9eb6e2025b64f340691e424b7fe7022ffde12438/${token.tokenId}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="absolute top-2 right-2 p-1 bg-void/80 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ExternalLink className="w-3 h-3 text-ink" />
        </a>
      </div>
      <div className="p-2.5">
        <p className="text-xs font-mono text-white">#{token.tokenId}</p>
        {token.rarityRank && (
          <p className={`text-[10px] font-mono ${tier.color}`}>{tier.label}</p>
        )}
      </div>
    </motion.div>
  );
}

interface NormieGalleryProps {
  address: string;
  title?: string;
}

export function NormieGallery({ address, title = 'Normies' }: NormieGalleryProps) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'id' | 'rarity'>('rarity');

  const { data: tokens = [], isLoading } = useQuery({
    queryKey: ['normie-gallery', address],
    queryFn: () => normiesApi.getHoldings(address),
    enabled: !!address,
  });

  const filtered = tokens
    .filter(t => !search || String(t.tokenId).includes(search))
    .sort((a, b) =>
      sortBy === 'rarity'
        ? (a.rarityRank ?? 9999) - (b.rarityRank ?? 9999)
        : a.tokenId - b.tokenId
    );

  return (
    <div className="bg-surface rounded-xl ring-1 ring-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-display font-600 text-white">
          {title}
          <span className="ml-2 text-ink font-normal text-xs">({tokens.length})</span>
        </h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3 h-3 text-ink absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Token ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-6 pr-2 py-1 bg-void border border-border rounded text-xs text-white placeholder-ink focus:outline-none focus:border-alpha w-24"
            />
          </div>
          <button
            onClick={() => setSortBy(s => s === 'id' ? 'rarity' : 'id')}
            className="flex items-center gap-1 px-2 py-1 bg-muted/20 hover:bg-muted/40 rounded text-xs text-ink transition-colors"
          >
            <SlidersHorizontal className="w-3 h-3" />
            {sortBy === 'rarity' ? 'Rarity' : 'ID'}
          </button>
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {Array(16).fill(0).map((_, i) => (
              <div key={i} className="aspect-square bg-muted/30 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-ink text-sm text-center py-8">No Normies found.</p>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {filtered.map(token => (
              <NormieCard key={token.tokenId} token={token} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
