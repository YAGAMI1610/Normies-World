'use client';

import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Fish, TrendingUp, Tag, Users, AlertTriangle } from 'lucide-react';
import { useAlertStore } from '@/lib/stores/alertStore';
import { dashboardApi, type Alert } from '@/lib/api';

const SEVERITY_STYLES = {
  LOW:      { bar: 'bg-ink',    badge: 'bg-ink/20 text-ink' },
  MEDIUM:   { bar: 'bg-amber',  badge: 'bg-amber/20 text-amber' },
  HIGH:     { bar: 'bg-danger', badge: 'bg-danger/20 text-danger' },
  CRITICAL: { bar: 'bg-danger', badge: 'bg-danger/30 text-danger animate-pulse' },
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  WHALE_ACCUMULATION: Fish,
  WHALE_LIQUIDATION:  Fish,
  TRAIT_SPIKE:        Tag,
  FLOOR_CHANGE:       TrendingUp,
  RAPID_APPRECIATION: TrendingUp,
  HOLDER_BUY:         Users,
  HOLDER_SELL:        Users,
  REPUTATION_LEADER_MOVE: Users,
};

function AlertRow({ alert, isNew }: { alert: Alert; isNew?: boolean }) {
  const style = SEVERITY_STYLES[alert.severity] ?? SEVERITY_STYLES.LOW;
  const Icon = TYPE_ICONS[alert.type] ?? AlertTriangle;
  const ago = formatAgo(new Date(alert.createdAt));

  return (
    <motion.div
      layout
      initial={isNew ? { opacity: 0, x: -12 } : false}
      animate={{ opacity: 1, x: 0 }}
      className="flex gap-3 py-3 border-b border-border last:border-0 group"
    >
      <div className={`w-0.5 self-stretch rounded-full flex-shrink-0 ${style.bar}`} />
      <div className={`mt-0.5 p-1.5 rounded-md ${style.badge} flex-shrink-0`}>
        <Icon className="w-3 h-3" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text leading-snug">{alert.message}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${style.badge}`}>
            {alert.severity}
          </span>
          <span className="text-[10px] text-ink">{ago}</span>
        </div>
      </div>
    </motion.div>
  );
}

function formatAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function AlertFeed() {
  const { alerts: liveAlerts } = useAlertStore();
  const { data: fetchedAlerts = [] } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => dashboardApi.getAlerts(15),
    refetchInterval: 60_000,
  });

  // Merge live + fetched, deduplicate by id, cap at 20
  const allIds = new Set<string>();
  const merged: Alert[] = [];
  for (const a of [...liveAlerts, ...fetchedAlerts]) {
    if (!allIds.has(a.id)) { allIds.add(a.id); merged.push(a); }
  }
  const displayed = merged.slice(0, 20);

  return (
    <div className="bg-surface rounded-xl ring-1 ring-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-alpha" />
          <h3 className="text-sm font-display font-600 text-white">Alpha Alerts</h3>
          {liveAlerts.length > 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-pulse animate-pulse-slow" />
          )}
        </div>
        <span className="text-[10px] text-ink font-mono">LIVE</span>
      </div>

      <div className="px-4 max-h-72 overflow-y-auto">
        {displayed.length === 0 ? (
          <p className="text-ink text-sm py-6 text-center">No alerts yet. Watching the chain...</p>
        ) : (
          <AnimatePresence initial={false}>
            {displayed.map((alert, i) => (
              <AlertRow key={alert.id} alert={alert} isNew={i === 0 && liveAlerts.includes(alert)} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
