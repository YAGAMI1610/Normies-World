'use client';

import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { dashboardApi } from '@/lib/api';
import { format, parseISO } from 'date-fns';

export function FloorChart() {
  const { data: history = [], isLoading } = useQuery({
    queryKey: ['floor-history'],
    queryFn: () => dashboardApi.getFloorHistory(30),
    refetchInterval: 5 * 60_000,
  });

  const latest = history[history.length - 1]?.floor;
  const earliest = history[0]?.floor;
  const pctChange = latest && earliest
    ? ((latest - earliest) / earliest * 100).toFixed(1)
    : null;
  const isPositive = pctChange != null && parseFloat(pctChange) >= 0;

  const chartData = history.map(d => ({
    date: format(parseISO(d.date), 'MMM d'),
    floor: d.floor,
  }));

  return (
    <div className="bg-surface rounded-xl ring-1 ring-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div>
          <h3 className="text-sm font-display font-600 text-white">Floor Price</h3>
          <div className="flex items-center gap-2 mt-0.5">
            {latest != null && (
              <span className="text-xl font-display font-700 text-white tabular">
                {latest.toFixed(3)} Ξ
              </span>
            )}
            {pctChange != null && (
              <span className={`flex items-center gap-0.5 text-xs font-mono ${isPositive ? 'text-pulse' : 'text-danger'}`}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isPositive ? '+' : ''}{pctChange}% 30d
              </span>
            )}
          </div>
        </div>
        <span className="text-[10px] text-ink font-mono uppercase">30 days</span>
      </div>

      <div className="px-2 pt-2 pb-1 h-40">
        {isLoading ? (
          <div className="h-full bg-muted/20 rounded animate-pulse" />
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 2, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5B6EFF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#5B6EFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fill: '#8A9BC0', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: '#8A9BC0', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `${v.toFixed(2)}Ξ`}
              />
              <Tooltip
                contentStyle={{
                  background: '#0F1420',
                  border: '1px solid #1A2035',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#D6E4FF',
                  fontFamily: 'JetBrains Mono',
                }}
                formatter={(v: number) => [`${v.toFixed(3)} Ξ`, 'Floor']}
                labelStyle={{ color: '#8A9BC0' }}
              />
              <Area
                type="monotone"
                dataKey="floor"
                stroke="#5B6EFF"
                strokeWidth={1.5}
                fill="url(#floorGrad)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-ink text-xs">No floor data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
