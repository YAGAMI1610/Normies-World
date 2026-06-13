'use client';

import { motion } from 'framer-motion';
import { Shield, Zap, Wind } from 'lucide-react';
import type { NormieCard } from '@/lib/api';

const RARITY_STYLES: Record<string, { border: string; glow: string; badge: string; label: string }> = {
  Legendary: { border: 'border-amber',   glow: 'shadow-[0_0_20px_#FFB54744]', badge: 'bg-amber/20 text-amber',   label: 'LEGENDARY' },
  Epic:      { border: 'border-whale',   glow: 'shadow-[0_0_20px_#9B6BFF44]', badge: 'bg-whale/20 text-whale',   label: 'EPIC' },
  Rare:      { border: 'border-alpha',   glow: 'shadow-[0_0_20px_#5B6EFF44]', badge: 'bg-alpha/20 text-alpha',   label: 'RARE' },
  Uncommon:  { border: 'border-pulse',   glow: 'shadow-[0_0_10px_#00E5A022]', badge: 'bg-pulse/20 text-pulse',   label: 'UNCOMMON' },
  Common:    { border: 'border-border',  glow: '',                              badge: 'bg-muted/20 text-ink',    label: 'COMMON' },
};

function StatBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  return (
    <div className="flex-1 h-1.5 bg-muted/30 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${(value / max) * 100}%` }}
        transition={{ duration: 0.6 }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  );
}

interface BattleCardProps {
  card: NormieCard;
  selected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function BattleCard({ card, selected, onClick, size = 'md' }: BattleCardProps) {
  const style = RARITY_STYLES[card.rarityTier] ?? RARITY_STYLES.Common;
  const NORMIES_API = 'https://api.normies.art';

  const sizeClasses = {
    sm: 'w-36',
    md: 'w-48',
    lg: 'w-64',
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative ${sizeClasses[size]} cursor-pointer select-none`}
    >
      <div className={`
        relative bg-surface rounded-xl border-2 ${style.border} ${style.glow}
        overflow-hidden transition-all duration-200
        ${selected ? 'ring-2 ring-alpha' : ''}
      `}>
        {/* Rarity badge */}
        <div className={`absolute top-2 left-2 z-10 text-[9px] font-mono font-600 px-1.5 py-0.5 rounded ${style.badge}`}>
          {style.label}
        </div>

        {/* NFT ownership indicator */}
        {card.owned && (
          <div className="absolute top-2 right-2 z-10 text-[9px] font-mono px-1.5 py-0.5 rounded bg-pulse/20 text-pulse">
            OWNED
          </div>
        )}

        {/* Image */}
        <div className="w-full aspect-square bg-muted/20 overflow-hidden">
          <img
            src={`${NORMIES_API}/normie/${card.tokenId}/image.png`}
            alt={card.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-normie.png';
            }}
          />
        </div>

        {/* Card info */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-display font-700 text-white truncate">{card.name}</p>
            {card.rarityRank && (
              <p className="text-[10px] font-mono text-ink flex-shrink-0">#{card.rarityRank}</p>
            )}
          </div>

          {/* Stats */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-danger flex-shrink-0" />
              <StatBar value={card.attack} color="bg-danger" />
              <span className="text-[10px] font-mono text-danger w-6 text-right">{card.attack}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3 text-alpha flex-shrink-0" />
              <StatBar value={card.defense} color="bg-alpha" />
              <span className="text-[10px] font-mono text-alpha w-6 text-right">{card.defense}</span>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="w-3 h-3 text-pulse flex-shrink-0" />
              <StatBar value={card.speed} color="bg-pulse" />
              <span className="text-[10px] font-mono text-pulse w-6 text-right">{card.speed}</span>
            </div>
          </div>

          {/* Special ability */}
          {card.ability && (
            <div className="mt-2 pt-2 border-t border-border">
              <p className="text-[10px] font-mono text-amber">{card.ability}</p>
              {size === 'lg' && (
                <p className="text-[10px] text-ink mt-0.5 leading-tight">{card.abilityDescription}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}