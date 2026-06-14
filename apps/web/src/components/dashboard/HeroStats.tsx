'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, Fish, Zap, Activity } from 'lucide-react';
import { dashboardApi } from '@/lib/api';

function StatCard({
  label, value, subValue, icon: Icon, accent, trend, delay,
}: {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ElementType;
  accent: 'alpha' | 'pulse' | 'whale' | 'amber' | 'danger';
  trend?: 'up' | 'down' | 'neutral';
  delay: number;
}) {
  const accentColors = {
    alpha: { bg: 'bg-alpha/10', icon: 'text-alpha', ring: 'ring-alpha/20' },
    pulse: { bg: 'bg-pulse/10', icon: 'text-pulse', ring: 'ring-pulse/20' },
    whale: { bg: 'bg-whale/10', icon: 'text-whale', ring: 'ring-whale/20' },
    amber: { bg: 'bg-amber/10', icon: 'text-amber', ring: 'ring-amber/20' },
    danger: { bg: 'bg-danger/10', icon: 'text-danger', ring: 'ring-danger/20' },
  };

  const c = accentColors[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={`relative bg-surface rounded-xl p-4 ring-1 ${c.ring} overflow-hidden`}
    >
      <div className={`absolute top-0 right-0 w-24 h-24 ${c.bg} rounded-full blur-2xl -translate-y-6 translate-x-6 pointer-events-none`} />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-ink uppercase tracking-wider">{label}</p>
          <p className="mt-1.5 text-2xl font-display font-700 text-white tabular">{value}</p>
          {subValue && (
            <div className="flex items-center gap-1 mt-1">
              {trend === 'up' && <TrendingUp className="w-3 h-3 text-pulse" />}
              {trend === 'down' && <TrendingDown className="w-3 h-3 text-danger" />}
              <p className={`text-xs font-mono ${trend === 'up' ? 'text-pulse' : trend === 'down' ? 'text-danger' : 'text-ink'}`}>
                {subValue}
              </p>
            </div>
          )}
        </div>
        <div className={`p-2 rounded-lg ${c.bg}`}>
          <Icon className={`w-4 h-4 ${c.icon}`} />
        </div>
      </div>
    </motion.div>
  );
}

export function HeroStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
    refetchInterval: 30_000,
  });

  const formatNumber = (value: number | string | null | undefined) =>
    value == null ? '—' : typeof value === 'string' ? value : value.toLocaleString();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
      <StatCard
        label="Burn Commits"
        value={isLoading ? '...' : formatNumber(stats?.totalBurnCommitments)}
        icon={TrendingUp}
        accent="pulse"
        delay={0}
      />
      <StatCard
        label="Burned Tokens"
        value={isLoading ? '...' : formatNumber(stats?.totalBurnedTokens)}
        icon={Fish}
        accent="whale"
        delay={0.05}
      />
      <StatCard
        label="Transforms"
        value={isLoading ? '...' : formatNumber(stats?.totalTransforms)}
        icon={Activity}
        accent="alpha"
        delay={0.1}
      />
      <StatCard
        label="Token Data"
        value={isLoading ? '...' : formatNumber(stats?.totalTokenData)}
        icon={Users}
        accent="amber"
        delay={0.15}
      />
      <StatCard
        label="Action Points"
        value={isLoading ? '...' : formatNumber(stats?.totalActionPointsDistributed)}
        icon={Zap}
        accent="danger"
        delay={0.2}
      />
    </div>
  );
}
