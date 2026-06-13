'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Shield, Star, Crown } from 'lucide-react';
import { reputationApi, type ReputationEntry } from '@/lib/api';

const BADGE_ICONS: Record<string, string> = {
  ALPHA_COLLECTOR: '⚡',
  WHALE:           '🐳',
  DIAMOND_HANDS:   '💎',
  STRATEGIST:      '🧠',
  BATTLE_MASTER:   '⚔️',
  NORMIES_LEGEND:  '👑',
};

function shortenAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

const RANK_ICONS: Record<number, React.ElementType> = {
  1: Crown,
  2: Star,
  3: Shield,
};

export function ReputationLeaderboard() {
  const { data: leaders = [], isLoading } = useQuery({
    queryKey: ['reputation-leaderboard'],
    queryFn: () => reputationApi.getLeaderboard(8),
    refetchInterval: 60_000,
  });

  return (
    <div className="bg-surface rounded-xl ring-1 ring-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-alpha" />
          <h3 className="text-sm font-display font-600 text-white">Reputation</h3>
        </div>
        <span className="text-[10px] text-ink font-mono">SCORE / LEVEL</span>
      </div>

      <div className="px-4 divide-y divide-border">
        {isLoading
          ? Array(5).fill(0).map((_, i) => (
              <div key={i} className="py-2.5">
                <div className="h-3 bg-muted/30 rounded animate-pulse w-2/3" />
              </div>
            ))
          : leaders.map((entry, i) => {
              const RankIcon = RANK_ICONS[i + 1];
              return (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 py-2.5"
                >
                  <div className="w-5 flex-shrink-0 text-center">
                    {RankIcon ? (
                      <RankIcon className={`w-3.5 h-3.5 mx-auto ${i === 0 ? 'text-amber' : i === 1 ? 'text-ink' : 'text-amber/60'}`} />
                    ) : (
                      <span className="text-[10px] font-mono text-ink">{i + 1}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-mono text-white">{shortenAddress(entry.walletAddress)}</p>
                      <div className="flex gap-0.5">
                        {entry.badges.slice(0, 3).map(badge => (
                          <span key={badge} className="text-[10px]" title={badge}>
                            {BADGE_ICONS[badge] ?? '🏅'}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 h-1 bg-muted/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-alpha rounded-full"
                          style={{ width: `${Math.min(entry.score, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-mono text-alpha">{entry.score.toFixed(0)}</p>
                    <p className="text-[10px] text-ink">Lv.{entry.level}</p>
                  </div>
                </motion.div>
              );
            })}
      </div>
    </div>
  );
}