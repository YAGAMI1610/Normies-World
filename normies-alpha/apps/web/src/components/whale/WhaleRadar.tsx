'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Fish, Star } from 'lucide-react';
import { whaleApi, type WhaleEntry } from '@/lib/api';

function shortenAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-pulse' : score >= 60 ? 'bg-alpha' : 'bg-amber';
  return (
    <div className="flex-1 h-1.5 bg-muted/30 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.5 }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  );
}

function WhaleRow({ whale, rank }: { whale: WhaleEntry; rank: number }) {
  const qc = useQueryClient();
  const { mutate: toggleFollow } = useMutation({
    mutationFn: () => whale.followed ? whaleApi.unfollowWhale(whale.address) : whaleApi.followWhale(whale.address),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['whales'] }),
  });

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
      <span className="w-5 text-[10px] font-mono text-ink text-center">{rank}</span>

      <div className="w-8 h-8 rounded-lg bg-whale/10 flex items-center justify-center flex-shrink-0">
        <Fish className="w-4 h-4 text-whale" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-xs font-mono text-white">{shortenAddress(whale.address)}</p>
          <span className="text-[10px] text-ink">{whale.holdingsCount} NFTs</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <ScoreBar score={whale.whaleScore} />
          <span className="text-[10px] font-mono text-whale w-10 text-right">
            {whale.whaleScore.toFixed(0)}
          </span>
        </div>
      </div>

      <button
        onClick={() => toggleFollow()}
        className={`p-1 rounded-md transition-colors ${
          whale.followed ? 'text-amber' : 'text-ink hover:text-amber'
        }`}
      >
        <Star className="w-3.5 h-3.5" fill={whale.followed ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
}

export function WhaleRadar() {
  const { data: whales = [], isLoading } = useQuery({
    queryKey: ['whales'],
    queryFn: () => whaleApi.getWhales(10),
    refetchInterval: 30_000,
  });

  return (
    <div className="bg-surface rounded-xl ring-1 ring-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Fish className="w-4 h-4 text-whale" />
          <h3 className="text-sm font-display font-600 text-white">Whale Radar</h3>
        </div>
        <span className="text-[10px] text-ink font-mono">WHALE SCORE</span>
      </div>

      <div className="px-4 max-h-64 overflow-y-auto">
        {isLoading
          ? Array(5).fill(0).map((_, i) => (
              <div key={i} className="py-2.5 border-b border-border">
                <div className="h-3 bg-muted/30 rounded animate-pulse w-3/4" />
              </div>
            ))
          : whales.map((whale, i) => (
              <WhaleRow key={whale.address} whale={whale} rank={i + 1} />
            ))}
      </div>
    </div>
  );
}