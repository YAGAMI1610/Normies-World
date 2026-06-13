'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Tag } from 'lucide-react';
import { dashboardApi } from '@/lib/api';

export function TraitHeatmap() {
  const { data: traits = [], isLoading } = useQuery({
    queryKey: ['trait-demand'],
    queryFn: dashboardApi.getTraitDemand,
    refetchInterval: 5 * 60_000,
  });

  // Group by category
  const byCategory = traits.reduce<Record<string, typeof traits>>((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {});

  return (
    <div className="bg-surface rounded-xl ring-1 ring-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-alpha" />
          <h3 className="text-sm font-display font-600 text-white">Trait Demand</h3>
        </div>
        <span className="text-[10px] text-ink font-mono">24H DELTA</span>
      </div>

      <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
        {isLoading
          ? Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-6 bg-muted/30 rounded animate-pulse" />
            ))
          : traits.length === 0
          ? <p className="text-ink text-sm text-center py-4">No trait data yet</p>
          : traits.slice(0, 12).map((trait, i) => {
              const isPositive = trait.pctChange >= 0;
              const barWidth = Math.min(Math.abs(trait.pctChange) * 2, 100);

              return (
                <motion.div
                  key={`${trait.category}-${trait.value}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3"
                >
                  {/* Labels */}
                  <div className="w-36 flex-shrink-0">
                    <p className="text-xs text-white truncate">{trait.value}</p>
                    <p className="text-[10px] text-ink">{trait.category}</p>
                  </div>

                  {/* Bar */}
                  <div className="flex-1 h-4 bg-muted/30 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ delay: i * 0.03 + 0.1, duration: 0.5 }}
                      className={`h-full rounded-full ${isPositive ? 'bg-pulse' : 'bg-danger'}`}
                    />
                  </div>

                  {/* Delta */}
                  <div className="w-14 text-right flex-shrink-0">
                    <span className={`text-xs font-mono ${isPositive ? 'text-pulse' : 'text-danger'}`}>
                      {isPositive ? '+' : ''}{trait.pctChange.toFixed(1)}%
                    </span>
                  </div>
                </motion.div>
              );
            })}
      </div>
    </div>
  );
}
