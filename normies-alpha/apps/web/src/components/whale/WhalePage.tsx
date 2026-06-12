'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Fish, TrendingUp, Clock, Layers, Search } from 'lucide-react';
import { whaleApi, type WhaleEntry } from '@/lib/api';
import { WhaleSimilarity } from './WhaleSimilarity';

function shortenAddress(addr: string) {
  return `${addr.slice(0, 8)}…${addr.slice(-6)}`;
}

function WhaleCard({ whale, rank }: { whale: WhaleEntry; rank: number }) {
  const [expanded, setExpanded] = useState(false);
  const tierColor = whale.whaleScore >= 85 ? 'text-pulse border-pulse/30' :
                    whale.whaleScore >= 70 ? 'text-whale border-whale/30' :
                    'text-alpha border-alpha/30';

  return (
    <motion.div
      layout
      className={`bg-surface rounded-xl ring-1 ring-border overflow-hidden cursor-pointer`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-4 p-4">
        <div className="w-8 text-center flex-shrink-0">
          <span className={`text-lg font-display font-800 ${rank <= 3 ? 'text-amber' : 'text-ink'}`}>
            {rank <= 3 ? ['🥇','🥈','🥉'][rank-1] : rank}
          </span>
        </div>

        <div className="w-10 h-10 rounded-xl bg-whale/10 flex items-center justify-center flex-shrink-0">
          <Fish className="w-5 h-5 text-whale" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-mono text-white">{shortenAddress(whale.address)}</p>
          <div className="flex items-center gap-4 mt-1">
            <span className="flex items-center gap-1 text-xs text-ink">
              <Layers className="w-3 h-3" /> {whale.holdingsCount} NFTs
            </span>
            <span className="flex items-center gap-1 text-xs text-ink">
              <Clock className="w-3 h-3" /> {whale.avgHoldDurationDays.toFixed(0)}d avg hold
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded border ${tierColor}`}>
              {whale.rarityTier}
            </span>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <div className="text-lg font-display font-800 text-whale tabular">{whale.whaleScore.toFixed(0)}</div>
          <div className="text-[10px] text-ink">WHALE SCORE</div>
        </div>
      </div>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="border-t border-border px-4 py-3 bg-void/30"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-mono text-alpha">{whale.address}</p>
            <button
              onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(whale.address); }}
              className="text-[10px] text-ink hover:text-alpha"
            >
              Copy
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-surface rounded-lg p-2">
              <p className="text-xs font-display font-700 text-white">{whale.holdingsCount}</p>
              <p className="text-[10px] text-ink">Holdings</p>
            </div>
            <div className="bg-surface rounded-lg p-2">
              <p className="text-xs font-display font-700 text-white">{whale.avgHoldDurationDays.toFixed(0)}d</p>
              <p className="text-[10px] text-ink">Avg Hold</p>
            </div>
            <div className="bg-surface rounded-lg p-2">
              <p className={`text-xs font-display font-700 ${whale.whaleScore >= 70 ? 'text-pulse' : 'text-ink'}`}>
                {whale.whaleScore.toFixed(0)}/100
              </p>
              <p className="text-[10px] text-ink">Score</p>
            </div>
          </div>
          <a
            href={`https://etherscan.io/address/${whale.address}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="mt-2 text-[10px] text-alpha hover:underline block"
          >
            View on Etherscan →
          </a>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function WhalePage() {
  const [search, setSearch] = useState('');

  const { data: whales = [], isLoading } = useQuery({
    queryKey: ['whales-all'],
    queryFn: () => whaleApi.getWhales(50),
    refetchInterval: 60_000,
  });

  const filtered = whales.filter(w =>
    !search || w.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-800 text-white flex items-center gap-2">
            <Fish className="w-6 h-6 text-whale" />
            Whale Intelligence
          </h1>
          <p className="text-sm text-ink mt-1">Track smart money — accumulation, holdings, and behavior patterns.</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-ink absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search address…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-sm text-white placeholder-ink focus:outline-none focus:border-alpha font-mono w-56"
          />
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Whales', value: whales.length.toString(), icon: Fish, color: 'text-whale' },
          { label: 'Avg Score', value: whales.length ? (whales.reduce((s,w) => s+w.whaleScore,0)/whales.length).toFixed(1) : '—', icon: TrendingUp, color: 'text-pulse' },
          { label: 'Avg Holdings', value: whales.length ? (whales.reduce((s,w) => s+w.holdingsCount,0)/whales.length).toFixed(0) : '—', icon: Layers, color: 'text-alpha' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-surface rounded-xl ring-1 ring-border p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-muted/20`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div>
              <p className="text-lg font-display font-800 text-white">{isLoading ? '…' : value}</p>
              <p className="text-xs text-ink">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Whale list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {isLoading
            ? Array(5).fill(0).map((_, i) => <div key={i} className="h-20 bg-surface rounded-xl animate-pulse ring-1 ring-border" />)
            : filtered.map((whale, i) => (
                <WhaleCard key={whale.address} whale={whale} rank={i + 1} />
              ))}
        </div>
        <div className="space-y-4">
          <WhaleSimilarity />
        </div>
      </div>
    </div>
  );
}