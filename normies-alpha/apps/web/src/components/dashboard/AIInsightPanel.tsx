'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, RefreshCw, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import { aiApi, type AIInsight } from '@/lib/api';

const SENTIMENT_CONFIG = {
  BULLISH:  { icon: TrendingUp,   color: 'text-pulse', badge: 'bg-pulse/10 text-pulse border border-pulse/20' },
  BEARISH:  { icon: TrendingDown, color: 'text-danger', badge: 'bg-danger/10 text-danger border border-danger/20' },
  NEUTRAL:  { icon: Minus,        color: 'text-ink',   badge: 'bg-muted/50 text-ink border border-border' },
};

export function AIInsightPanel() {
  const [expanded, setExpanded] = useState(false);
  const qc = useQueryClient();

  const { data: insight, isLoading } = useQuery({
    queryKey: ['ai-insight'],
    queryFn: aiApi.getLatestInsight,
    refetchInterval: 5 * 60_000,
  });

  const { mutate: regenerate, isPending } = useMutation({
    mutationFn: aiApi.generateInsight,
    onSuccess: (data) => qc.setQueryData(['ai-insight'], data),
  });

  const sentiment = insight ? SENTIMENT_CONFIG[insight.sentiment] : null;
  const SentimentIcon = sentiment?.icon ?? Minus;

  return (
    <div className="bg-surface rounded-xl ring-1 ring-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-alpha" />
          <h3 className="text-sm font-display font-600 text-white">AI Market Analyst</h3>
        </div>
        <button
          onClick={() => regenerate()}
          disabled={isPending}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-alpha/10 hover:bg-alpha/20 text-alpha text-xs font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isPending ? 'animate-spin' : ''}`} />
          {isPending ? 'Analysing...' : 'Explain Today'}
        </button>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => (
              <div key={i} className="h-3 bg-muted rounded animate-pulse" style={{ width: `${70 + i*10}%` }} />
            ))}
          </div>
        ) : insight ? (
          <>
            {/* Sentiment + confidence */}
            <div className="flex items-center gap-2 mb-3">
              <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${sentiment?.badge}`}>
                <SentimentIcon className="w-3 h-3" />
                {insight.sentiment}
              </span>
              <span className="text-xs text-ink">
                {(insight.confidence * 100).toFixed(0)}% confidence
              </span>
              <span className="text-xs text-muted ml-auto">
                {new Date(insight.generatedAt).toLocaleTimeString()}
              </span>
            </div>

            {/* Summary */}
            <p className="text-sm text-text leading-relaxed">{insight.summary}</p>

            {/* Expandable bullet points */}
            {insight.bulletPoints?.length > 0 && (
              <>
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-1 mt-3 text-xs text-alpha hover:text-white transition-colors"
                >
                  {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {expanded ? 'Less detail' : `${insight.bulletPoints.length} key observations`}
                </button>

                <AnimatePresence>
                  {expanded && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-2 space-y-1.5 overflow-hidden"
                    >
                      {insight.bulletPoints.map((bp, i) => (
                        <motion.li
                          key={i}
                          initial={{ x: -8, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex gap-2 text-xs text-ink"
                        >
                          <span className="text-alpha mt-0.5">→</span>
                          <span>{bp}</span>
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-ink text-sm">No insight generated yet.</p>
            <button
              onClick={() => regenerate()}
              className="mt-2 text-alpha text-xs hover:underline"
            >
              Generate now →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
