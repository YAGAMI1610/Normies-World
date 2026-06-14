'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { User, Shield, Star, Zap, Trophy, Wallet } from 'lucide-react';
import { reputationApi, battleApi, type ReputationEntry, type BattleLeaderEntry } from '@/lib/api';
import { BattleCard } from '@/components/battle/BattleCard';
import { NormieGallery } from '@/components/dashboard/NormieGallery';
import { useAuthStore } from '@/lib/stores/authStore';
import { useSiweAuth } from '@/hooks/useSiweAuth';

const BADGE_CONFIG: Record<string, { label: string; emoji: string; color: string; description: string }> = {
  ALPHA_COLLECTOR: { label: 'Alpha Collector', emoji: '⚡', color: 'bg-alpha/10 border-alpha/30 text-alpha', description: 'Acquired 10+ high-rarity Normies' },
  WHALE:           { label: 'Whale',           emoji: '🐳', color: 'bg-whale/10 border-whale/30 text-whale', description: 'Holds 15+ Normies with top whale score' },
  DIAMOND_HANDS:   { label: 'Diamond Hands',   emoji: '💎', color: 'bg-alpha/10 border-alpha/30 text-text',  description: 'Average hold duration > 6 months' },
  STRATEGIST:      { label: 'Strategist',       emoji: '🧠', color: 'bg-amber/10 border-amber/30 text-amber', description: 'Exceptional trading performance' },
  BATTLE_MASTER:   { label: 'Battle Master',    emoji: '⚔️', color: 'bg-danger/10 border-danger/30 text-danger', description: 'ELO > 1800 in battle' },
  NORMIES_LEGEND:  { label: 'Normies Legend',   emoji: '👑', color: 'bg-amber/10 border-amber/30 text-amber', description: 'Top 0.1% reputation score' },
};

function XPBar({ xp, level }: { xp: number; level: number }) {
  const xpForLevel = (l: number) => 50 * Math.pow(l - 1, 2);
  const current = xp - xpForLevel(level);
  const needed = xpForLevel(level + 1) - xpForLevel(level);
  const pct = Math.min((current / needed) * 100, 100);

  return (
    <div>
      <div className="flex items-center justify-between text-xs font-mono text-ink mb-1">
        <span>Level {level}</span>
        <span>{current.toLocaleString()} / {needed.toLocaleString()} XP</span>
      </div>
      <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-alpha to-whale rounded-full"
        />
      </div>
      {level < 100 && <p className="text-[10px] text-ink mt-0.5">Next: Level {level + 1}</p>}
    </div>
  );
}

function shortenAddress(addr: string) {
  return `${addr.slice(0, 8)}…${addr.slice(-6)}`;
}

export default function ProfilePage() {
  const { walletAddress: address, signIn, isLoading } = useSiweAuth();
  const isConnected = Boolean(address);

  const { data: reputation } = useQuery({
    queryKey: ['my-reputation', address],
    queryFn: () => reputationApi.getProfile(address!),
    enabled: !!address,
  });

  const { data: cards = [] } = useQuery({
    queryKey: ['my-cards'],
    queryFn: battleApi.getMyCards,
    enabled: !!address,
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['battle-leaderboard'],
    queryFn: () => battleApi.getLeaderboard(100),
    enabled: !!address,
  });

  const myBattleStats = leaderboard.find(e => e.walletAddress.toLowerCase() === address?.toLowerCase());

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Wallet className="w-12 h-12 text-ink opacity-50" />
        <h2 className="text-xl font-display font-700 text-white">Connect Your Wallet</h2>
        <p className="text-sm text-ink max-w-sm text-center">
          Connect a wallet holding Normies NFTs to view your reputation, badges, and battle statistics.
        </p>
        <button
          onClick={signIn}
          disabled={isLoading}
          className="px-5 py-2 rounded-lg bg-alpha text-white text-sm hover:bg-alpha/90 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Connecting…' : 'Connect Wallet'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile header */}
      <div className="bg-surface rounded-xl ring-1 ring-border p-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-alpha to-whale flex items-center justify-center shadow-alpha">
              <User className="w-8 h-8 text-white" />
            </div>
            {reputation && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-amber flex items-center justify-center text-xs font-display font-800 text-void">
                {reputation.level}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <p className="font-mono text-white text-sm">{shortenAddress(address!)}</p>
              <button
                onClick={() => navigator.clipboard.writeText(address!)}
                className="text-[10px] text-ink hover:text-alpha transition-colors"
              >
                Copy
              </button>
            </div>

            {reputation && (
              <>
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-alpha" />
                    <span className="text-sm font-display font-700 text-white">{reputation.score.toFixed(0)}</span>
                    <span className="text-xs text-ink">Reputation</span>
                  </div>
                  {reputation.rank && (
                    <div className="flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-amber" />
                      <span className="text-sm font-mono text-amber">#{reputation.rank}</span>
                    </div>
                  )}
                </div>
                <div className="max-w-sm">
                  <XPBar xp={reputation.xp} level={reputation.level} />
                </div>
              </>
            )}
          </div>

          {/* Battle stats */}
          {myBattleStats && (
            <div className="flex gap-4 text-center">
              {[
                { label: 'ELO', value: myBattleStats.elo.toString(), color: 'text-alpha' },
                { label: 'Wins', value: myBattleStats.wins.toString(), color: 'text-pulse' },
                { label: 'Losses', value: myBattleStats.losses.toString(), color: 'text-danger' },
                { label: 'Streak', value: `🔥 ${myBattleStats.winStreak}`, color: 'text-amber' },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <p className={`text-xl font-display font-700 ${color}`}>{value}</p>
                  <p className="text-[10px] text-ink uppercase">{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Badges */}
      {reputation && reputation.badges.length > 0 && (
        <div className="bg-surface rounded-xl ring-1 ring-border p-6">
          <h3 className="text-sm font-display font-600 text-white mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-alpha" />
            Badges ({reputation.badges.length})
          </h3>
          <div className="flex flex-wrap gap-3">
            {reputation.badges.map(badge => {
              const cfg = BADGE_CONFIG[badge];
              if (!cfg) return null;
              return (
                <motion.div
                  key={badge}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  title={cfg.description}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm ${cfg.color}`}
                >
                  <span>{cfg.emoji}</span>
                  <span className="font-medium text-xs">{cfg.label}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* My Normies Gallery */}
      {address && (
        <NormieGallery address={address} title="My Normies" />
      )}
    </div>
  );
}