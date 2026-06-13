'use client';

import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Fish, GitCompare, TrendingUp } from 'lucide-react';
import { whaleApi } from '@/lib/api';

function SimilarityMeter({ score }: { score: number }) {
  const color =
    score >= 80 ? 'from-pulse to-alpha' :
    score >= 60 ? 'from-alpha to-whale' :
    score >= 40 ? 'from-whale to-amber' :
    'from-amber to-danger';

  return (
    <div className="relative">
      <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
        />
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute right-0 -top-5 text-xs font-mono text-alpha font-700"
      >
        {score}%
      </motion.span>
    </div>
  );
}

function shortenAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function WhaleSimilarity() {
  const { address } = useAccount();

  const { data, isLoading } = useQuery({
    queryKey: ['whale-similarity', address],
    queryFn: () => whaleApi.getSimilarity(address!),
    enabled: !!address,
  });

  if (!address) return null;

  return (
    <div className="bg-surface rounded-xl ring-1 ring-border overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <GitCompare className="w-4 h-4 text-alpha" />
        <h3 className="text-sm font-display font-600 text-white">Wallet Similarity</h3>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-3 bg-muted/30 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-muted/30 rounded animate-pulse" />
          </div>
        ) : !data || !data.closestWhale ? (
          <p className="text-ink text-sm text-center py-4">
            Connect wallet & build history to see similarity.
          </p>
        ) : (
          <div className="space-y-4">
            {/* Score display */}
            <div className="text-center pb-2">
              <p className="text-3xl font-display font-800 text-alpha tabular">
                {data.score}%
              </p>
              <p className="text-xs text-ink mt-1">similar to top whale</p>
            </div>

            {/* Closest whale */}
            <div className="flex items-center gap-3 p-3 bg-void rounded-xl ring-1 ring-border">
              <div className="w-8 h-8 rounded-lg bg-whale/10 flex items-center justify-center flex-shrink-0">
                <Fish className="w-4 h-4 text-whale" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-white">
                  {shortenAddress(data.closestWhale.address)}
                </p>
                <p className="text-[10px] text-ink mt-0.5">
                  {data.closestWhale.holdingsCount} NFTs · Score {data.closestWhale.whaleScore.toFixed(0)}/100
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-whale/10 text-whale">
                  {data.closestWhale.rarityTier}
                </span>
              </div>
            </div>

            {/* Meter */}
            <div className="pt-1">
              <p className="text-[10px] text-ink font-mono mb-3 uppercase tracking-wider">
                Similarity Score
              </p>
              <SimilarityMeter score={data.score} />
            </div>

            <p className="text-[11px] text-ink text-center pt-1">
              You share similar{' '}
              <span className="text-alpha">holding patterns</span> &{' '}
              <span className="text-pulse">rarity preferences</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
