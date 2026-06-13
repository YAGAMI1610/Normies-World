'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Swords, Trophy } from 'lucide-react';
import { battleApi, type BattleLeaderEntry } from '@/lib/api';

function shortenAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function BattleLeaderboard() {
  const { data: leaders = [], isLoading } = useQuery({
    queryKey: ['battle-leaderboard'],
    queryFn: () => battleApi.getLeaderboard(10),
    refetchInterval: 30_000,
  });

  return (
    <div className="bg-surface rounded-xl ring-1 ring-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-alpha" />
          <h3 className="text-sm font-display font-600 text-white">Battle Leaderboard</h3>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-ink font-mono">
          <span className="w-12 text-center">ELO</span>
          <span className="w-10 text-center">W/L</span>
          <span className="w-12 text-center">STREAK</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <tbody>
            {isLoading
              ? Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="py-3 px-4">
                      <div className="h-3 bg-muted/30 rounded animate-pulse w-32" />
                    </td>
                  </tr>
                ))
              : leaders.map((entry, i) => (
                  <motion.tr
                    key={entry.userId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-border hover:bg-muted/10 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-mono flex-shrink-0
                          ${i === 0 ? 'bg-amber/20 text-amber' : i === 1 ? 'bg-ink/20 text-text' : i === 2 ? 'bg-amber/10 text-amber/60' : 'bg-muted/20 text-ink'}`}>
                          {i === 0 ? <Trophy className="w-3 h-3" /> : i + 1}
                        </div>
                        <span className="text-xs font-mono text-white">{shortenAddress(entry.walletAddress)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-sm font-display font-700 text-alpha tabular">{entry.elo}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-xs font-mono text-pulse">{entry.wins}</span>
                      <span className="text-xs text-ink mx-1">/</span>
                      <span className="text-xs font-mono text-danger">{entry.losses}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {entry.winStreak > 0 ? (
                        <span className="text-xs font-mono text-pulse">🔥 {entry.winStreak}</span>
                      ) : (
                        <span className="text-xs text-ink">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full 
                        ${entry.elo >= 2000 ? 'bg-amber/20 text-amber' :
                          entry.elo >= 1500 ? 'bg-whale/20 text-whale' :
                          entry.elo >= 1200 ? 'bg-alpha/20 text-alpha' :
                          'bg-muted/20 text-ink'}`}>
                        {entry.elo >= 2000 ? 'LEGEND' : entry.elo >= 1500 ? 'MASTER' : entry.elo >= 1200 ? 'GOLD' : 'SILVER'}
                      </span>
                    </td>
                  </motion.tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}