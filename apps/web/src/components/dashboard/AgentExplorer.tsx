'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, ChevronDown, ChevronUp, Cpu } from 'lucide-react';
import { normiesApi } from '@/lib/api';

interface AgentItem {
  agentId: string;
  tokenId: string;
  name: string;
  type: string;
  registeredBy: string;
  registeredAt: string;
}

function AgentCard({ agent }: { agent: AgentItem }) {
  const [expanded, setExpanded] = useState(false);
  const NORMIES_API = 'https://api.normies.art';

  return (
    <motion.div
      layout
      className="bg-surface rounded-xl ring-1 ring-border overflow-hidden"
    >
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/10 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted/20 flex-shrink-0">
          <img
            src={`${NORMIES_API}/agents/image/${agent.tokenId}`}
            alt={agent.name}
            className="w-full h-full object-cover"
            onError={e => {
              (e.target as HTMLImageElement).src = `${NORMIES_API}/normie/${agent.tokenId}/image.png`;
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-display font-700 text-white truncate">{agent.name}</p>
            <span className="text-[9px] font-mono bg-alpha/10 text-alpha px-1.5 py-0.5 rounded flex-shrink-0">
              {agent.type}
            </span>
          </div>
          <p className="text-[10px] font-mono text-ink mt-0.5">
            #{agent.tokenId} · Agent ID: {agent.agentId.slice(0, 8)}…
          </p>
        </div>

        <div className="flex-shrink-0 text-ink">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border"
          >
            <AgentDetail tokenId={parseInt(agent.tokenId)} agentName={agent.name} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function AgentDetail({ tokenId, agentName }: { tokenId: number; agentName: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['agent-detail', tokenId],
    queryFn: () => normiesApi.getAgent(tokenId),
  });

  if (isLoading) {
    return (
      <div className="p-4 space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-3 bg-muted/30 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-4 space-y-3">
      {data.tagline && (
        <p className="text-xs text-alpha italic">"{data.tagline}"</p>
      )}
      {data.backstory && (
        <p className="text-xs text-ink leading-relaxed line-clamp-3">{data.backstory}</p>
      )}
      {data.personalityTraits?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {data.personalityTraits.slice(0, 5).map((trait: string) => (
            <span key={trait} className="text-[9px] font-mono bg-muted/30 text-text px-2 py-0.5 rounded-full">
              {trait}
            </span>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div className="bg-void rounded-lg p-2">
          <p className="text-ink">Communication Style</p>
          <p className="text-white mt-0.5 font-mono">{data.communicationStyle || '—'}</p>
        </div>
        <div className="bg-void rounded-lg p-2">
          <p className="text-ink">Canvas Level</p>
          <p className="text-alpha mt-0.5 font-mono font-700">{data.canvas?.level ?? 1}</p>
        </div>
      </div>
    </div>
  );
}

export function AgentExplorer() {
  const { data, isLoading } = useQuery({
    queryKey: ['agents-list'],
    queryFn: () => normiesApi.getAgentsList(20),
    refetchInterval: 60_000,
  });

  const agents: AgentItem[] = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-display font-800 text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-alpha" />
            Agent Explorer
          </h2>
          <p className="text-sm text-ink mt-1">
            ERC-8004 registered Normies — autonomous AI agents bound to NFTs.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-surface rounded-xl px-3 py-2 ring-1 ring-border">
          <Cpu className="w-4 h-4 text-pulse" />
          <span className="text-sm font-mono text-white">{agents.length} Agents</span>
        </div>
      </div>

      <div className="space-y-3">
        {isLoading
          ? Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-20 bg-surface rounded-xl animate-pulse ring-1 ring-border" />
            ))
          : agents.length === 0
          ? (
            <div className="text-center py-16 text-ink">
              <Bot className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No registered agents found.</p>
            </div>
          )
          : agents.map(agent => <AgentCard key={agent.agentId} agent={agent} />)}
      </div>
    </div>
  );
}
