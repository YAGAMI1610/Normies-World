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

  const formatEth = (v: number | null | undefined) =>
    v == null ? '—' : `${v.toFixed(3)} Ξ`;

  const formatPct = (v: number | null | undefined) =>
    v == null ? '' : `${v > 0 ? '+' : ''}${v.toFixed(1)}% 24h`;

  const floorTrend = stats?.floorChange24h == null ? 'neutral'
    : stats.floorChange24h > 0 ? 'up' : 'down';

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <div className="col-span-2 md:col-span-3 lg:col-span-1">
        <StatCard
          label="Floor Price"
          value={isLoading ? '...' : formatEth(stats?.floorEth)}
          subValue={isLoading ? '' : formatPct(stats?.floorChange24h)}
          icon={Activity}
          accent="alpha"
          trend={floorTrend}
          delay={0}
        />
      </div>
      <div className="col-span-2 md:col-span-1 lg:col-span-1">
        <StatCard
          label="24h Volume"
          value={isLoading ? '...' : formatEth(stats?.volume24hEth)}
          icon={TrendingUp}
          accent="pulse"
          delay={0.05}
        />
      </div>
      <div className="col-span-1 lg:col-span-1">
        <StatCard
          label="Holders"
          value={isLoading ? '...' : (stats?.uniqueHolders?.toLocaleString() ?? '—')}
          icon={Users}
          accent="amber"
          delay={0.1}
        />
      </div>
      <div className="col-span-1 lg:col-span-1">
        <StatCard
          label="Active Whales"
          value={isLoading ? '...' : (stats?.activeWhales?.toString() ?? '—')}
          subValue="last 24h"
          icon={Fish}
          accent="whale"
          delay={0.15}
        />
      </div>
      <div className="col-span-1 lg:col-span-1">
        <StatCard
          label="Transfers 24h"
          value={isLoading ? '...' : (stats?.totalTransfers24h?.toLocaleString() ?? '—')}
          icon={Zap}
          accent="alpha"
          delay={0.2}
        />
      </div>
      <div className="col-span-1 lg:col-span-1">
        <StatCard
          label="Top Alert"
          value={isLoading ? '...' : (stats?.topAlert ? '🚨 Active' : '✓ Quiet')}
          subValue={stats?.topAlert ?? undefined}
          icon={Activity}
          accent={stats?.topAlert ? 'danger' : 'pulse'}
          delay={0.25}
        />
      </div>
    </div>
  );
}
